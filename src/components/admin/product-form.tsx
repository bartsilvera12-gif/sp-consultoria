"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Card, Btn, Field, TextInput, TextArea, Select, Toggle,
  Loading, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-field";
import type { Product, ProductCost, ProductCategory, ProductBrand } from "@/lib/supabase/types";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

type PDraft = Partial<Product>;
type CDraft = Partial<ProductCost>;

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { userId } = useAdminAuth();
  const { toast } = useUI();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [cats, setCats] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [p, setP] = useState<PDraft>({
    code: "", slug: "", name_es: "", name_en: "", description_es: "", description_en: "",
    model: "", image_url: "", category_id: null, brand_id: null,
    sale_price: null, show_price: false, currency: "PYG", featured: false, active: true, sort_order: 0,
  });
  const [cost, setCost] = useState<CDraft>({ supplier_name: "", supplier_cost: null, currency: "PYG", source_document: "", notes: "" });

  useEffect(() => {
    (async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          db().from("product_categories").select("*").order("sort_order"),
          db().from("product_brands").select("*").order("name"),
        ]);
        if (catRes.error || brandRes.error) throw catRes.error || brandRes.error;
        setCats((catRes.data as ProductCategory[]) ?? []);
        setBrands((brandRes.data as ProductBrand[]) ?? []);

        if (productId) {
          const { data: prod, error: e1 } = await db().from("products").select("*").eq("id", productId).single();
          if (e1) throw e1;
          setP(prod as Product);
          setSlugTouched(true);
          const { data: c } = await db().from("product_costs").select("*").eq("product_id", productId).maybeSingle();
          if (c) setCost(c as ProductCost);
        }
      } catch {
        setErr(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  function setName(v: string) {
    setP((prev) => ({ ...prev, name_es: v, slug: slugTouched ? prev.slug : slugify(v) }));
  }

  async function save() {
    if (!p.name_es?.trim()) { toast("El nombre en español es obligatorio.", "error"); return; }
    const slug = (p.slug?.trim() || slugify(p.name_es)).trim();
    if (!slug) { toast("No se pudo generar el slug.", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        code: p.code?.trim() || null,
        category_id: p.category_id || null,
        brand_id: p.brand_id || null,
        slug,
        name_es: p.name_es!.trim(),
        name_en: p.name_en?.trim() || null,
        description_es: p.description_es?.trim() || null,
        description_en: p.description_en?.trim() || null,
        model: p.model?.trim() || null,
        image_url: p.image_url?.trim() || null,
        sale_price: p.sale_price === null || p.sale_price === undefined || (p.sale_price as unknown as string) === "" ? null : Number(p.sale_price),
        show_price: p.show_price ?? false,
        currency: p.currency || "PYG",
        featured: p.featured ?? false,
        active: p.active ?? true,
        sort_order: Number(p.sort_order) || 0,
      };

      let id = productId;
      if (id) {
        const { error } = await db().from("products").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await db().from("products").insert(payload).select("id").single();
        if (error) throw error;
        id = (data as { id: string }).id;
      }

      // Costo de proveedor (privado). Upsert manual por product_id.
      const hasCost = (cost.supplier_cost !== null && cost.supplier_cost !== undefined && (cost.supplier_cost as unknown as string) !== "") || cost.supplier_name?.trim() || cost.notes?.trim();
      if (hasCost) {
        const cPayload = {
          product_id: id,
          supplier_name: cost.supplier_name?.trim() || null,
          supplier_cost: cost.supplier_cost === null || cost.supplier_cost === undefined || (cost.supplier_cost as unknown as string) === "" ? null : Number(cost.supplier_cost),
          currency: cost.currency || "PYG",
          source_document: cost.source_document?.trim() || null,
          notes: cost.notes?.trim() || null,
          updated_by: userId,
        };
        const { data: existing } = await db().from("product_costs").select("id").eq("product_id", id).maybeSingle();
        if (existing) await db().from("product_costs").update(cPayload).eq("id", (existing as { id: string }).id);
        else await db().from("product_costs").insert(cPayload);
      }

      await logAudit(userId!, productId ? "update" : "create", "product", id);
      toast(productId ? "Producto actualizado." : "Producto creado.");
      router.push("/admin/products");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;
  if (err) return <div><PageHeader title={productId ? "Editar producto" : "Nuevo producto"} backHref="/admin/products" /><ErrorState /></div>;

  return (
    <div>
      <PageHeader title={productId ? "Editar producto" : "Nuevo producto"} subtitle="Los campos en inglés son opcionales." backHref="/admin/products">
        <Btn variant="secondary" onClick={() => router.push("/admin/products")}>Cancelar</Btn>
        <Btn loading={saving} icon="check" onClick={save}>Guardar</Btn>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-4">
            <Field label="Nombre" lang="ES">
              <TextInput value={p.name_es ?? ""} onChange={(e) => setName(e.target.value)} placeholder="Cámara IP domo 4MP" />
            </Field>
            <Field label="Nombre" lang="EN">
              <TextInput value={p.name_en ?? ""} onChange={(e) => setP({ ...p, name_en: e.target.value })} placeholder="4MP dome IP camera" />
            </Field>
            <Field label="Descripción" lang="ES">
              <TextArea value={p.description_es ?? ""} onChange={(e) => setP({ ...p, description_es: e.target.value })} />
            </Field>
            <Field label="Descripción" lang="EN">
              <TextArea value={p.description_en ?? ""} onChange={(e) => setP({ ...p, description_en: e.target.value })} />
            </Field>
            <ImageField value={p.image_url ?? null} onChange={(url) => setP({ ...p, image_url: url })} />
          </Card>

          {/* Costo de proveedor (privado) */}
          <Card className="space-y-4 border-amber-200 bg-amber-50/40">
            <div className="flex items-center gap-2 text-amber-800">
              <Icon name="warn" className="size-5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Costo de proveedor</h3>
                <p className="text-[12px]">Uso interno — <strong>no se muestra al público</strong>. Protegido a nivel de base de datos.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Proveedor"><TextInput value={cost.supplier_name ?? ""} onChange={(e) => setCost({ ...cost, supplier_name: e.target.value })} placeholder="Electropar" /></Field>
              <Field label="Costo (número)">
                <TextInput type="number" value={cost.supplier_cost ?? ""} onChange={(e) => setCost({ ...cost, supplier_cost: e.target.value === "" ? null : Number(e.target.value) })} placeholder="0" />
              </Field>
              <Field label="Moneda">
                <Select value={cost.currency ?? "PYG"} onChange={(e) => setCost({ ...cost, currency: e.target.value })}>
                  <option value="PYG">Guaraníes (PYG)</option><option value="USD">Dólares (USD)</option>
                </Select>
              </Field>
              <Field label="Documento origen"><TextInput value={cost.source_document ?? ""} onChange={(e) => setCost({ ...cost, source_document: e.target.value })} placeholder="Cotización N° …" /></Field>
            </div>
            <Field label="Notas internas"><TextArea value={cost.notes ?? ""} onChange={(e) => setCost({ ...cost, notes: e.target.value })} /></Field>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          <Card className="space-y-4">
            <Field label="Categoría">
              <Select value={p.category_id ?? ""} onChange={(e) => setP({ ...p, category_id: e.target.value || null })}>
                <option value="">— Sin categoría —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name_es}</option>)}
              </Select>
            </Field>
            <Field label="Marca">
              <Select value={p.brand_id ?? ""} onChange={(e) => setP({ ...p, brand_id: e.target.value || null })}>
                <option value="">— Sin marca —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Código"><TextInput value={p.code ?? ""} onChange={(e) => setP({ ...p, code: e.target.value })} /></Field>
              <Field label="Modelo"><TextInput value={p.model ?? ""} onChange={(e) => setP({ ...p, model: e.target.value })} /></Field>
            </div>
            <Field label="Slug" hint="URL" help="Se genera solo desde el nombre.">
              <TextInput value={p.slug ?? ""} onChange={(e) => { setSlugTouched(true); setP({ ...p, slug: e.target.value }); }} />
            </Field>
            <Field label="Orden"><TextInput type="number" value={p.sort_order ?? 0} onChange={(e) => setP({ ...p, sort_order: Number(e.target.value) })} /></Field>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--navy)]">Precio de venta</h3>
            <Field label="Precio (opcional)">
              <TextInput type="number" value={p.sale_price ?? ""} onChange={(e) => setP({ ...p, sale_price: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Dejar vacío = Consultar" />
            </Field>
            <Field label="Moneda">
              <Select value={p.currency ?? "PYG"} onChange={(e) => setP({ ...p, currency: e.target.value })}>
                <option value="PYG">Guaraníes (PYG)</option><option value="USD">Dólares (USD)</option>
              </Select>
            </Field>
            <Toggle checked={p.show_price ?? false} onChange={(v) => setP({ ...p, show_price: v })} label="Mostrar precio" description='Si está apagado, el público ve "Consultar".' />
          </Card>

          <Card className="space-y-3">
            <Toggle checked={p.active ?? true} onChange={(v) => setP({ ...p, active: v })} label="Activo" description="Visible en el sitio." />
            <Toggle checked={p.featured ?? false} onChange={(v) => setP({ ...p, featured: v })} label="Destacado" />
          </Card>
        </div>
      </div>
    </div>
  );
}

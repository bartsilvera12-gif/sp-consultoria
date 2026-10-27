"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Card, Btn, Field, TextInput, TextArea, Select, Toggle,
  Loading, ErrorState, useUI,
} from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-field";
import type { Product, ProductCategory, ProductBrand } from "@/lib/supabase/types";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

type PDraft = Partial<Product>;

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
            <Field label="Modelo"><TextInput value={p.model ?? ""} onChange={(e) => setP({ ...p, model: e.target.value })} /></Field>
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
          </Card>
        </div>
      </div>
    </div>
  );
}

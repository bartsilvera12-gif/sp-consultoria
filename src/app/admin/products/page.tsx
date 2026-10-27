"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Badge, Loading, EmptyState, ErrorState, Icon, Select, TextInput, useUI,
} from "@/components/admin/ui";
import type { Product, ProductCategory, ProductBrand } from "@/lib/supabase/types";

function money(n: number | null, cur: string) {
  if (n === null || n === undefined) return null;
  try { return new Intl.NumberFormat("es-PY", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n); }
  catch { return `${n} ${cur}`; }
}

export default function ProductsPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<Product[] | null>(null);
  const [cats, setCats] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const load = useCallback(async () => {
    try {
      const [pr, ct, br] = await Promise.all([
        db().from("products").select("*").order("sort_order").order("name_es"),
        db().from("product_categories").select("*").order("sort_order"),
        db().from("product_brands").select("*").order("name"),
      ]);
      if (pr.error) throw pr.error;
      setRows((pr.data as Product[]) ?? []);
      setCats((ct.data as ProductCategory[]) ?? []);
      setBrands((br.data as ProductBrand[]) ?? []);
    } catch { setErr(true); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const catName = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.name_es])), [cats]);
  const brandName = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b.name])), [brands]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = q.trim().toLowerCase();
    return rows.filter((p) =>
      (!catFilter || p.category_id === catFilter) &&
      (!needle || p.name_es.toLowerCase().includes(needle) || (p.code ?? "").toLowerCase().includes(needle)),
    );
  }, [rows, q, catFilter]);

  async function remove(p: Product) {
    const ok = await confirm({ title: "Eliminar producto", message: `"${p.name_es}". Esta acción no se puede deshacer.`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    const { error } = await db().from("products").delete().eq("id", p.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "product", p.id);
    toast("Producto eliminado.");
    load();
  }

  return (
    <div>
      <PageHeader title="Productos" subtitle={rows ? `${rows.length} producto${rows.length === 1 ? "" : "s"} en el catálogo.` : "Catálogo de productos."}>
        <Link href="/admin/products/new"><Btn icon="plus">Nuevo producto</Btn></Link>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="box" title="Sin productos" message="Agregá tu primer producto al catálogo."
          action={<Link href="/admin/products/new"><Btn icon="plus">Nuevo producto</Btn></Link>} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o código…" className="pl-9" />
            </div>
            <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="w-auto">
              <option value="">Todas las categorías</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name_es}</option>)}
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="search" title="Sin resultados" message="Probá con otro término o quitá los filtros." />
          ) : (
            <Card className="!p-0 overflow-hidden">
              <ul className="divide-y divide-black/5">
                {filtered.map((p) => {
                  const price = p.show_price ? money(p.sale_price, p.currency) : null;
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-black/5 bg-[#f3f5f9]">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt="" className="size-full object-contain" />
                        ) : <Icon name="box" className="size-5 text-black/20" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-[var(--navy)]">{p.name_es}</span>
                          {p.featured && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">★</span>}
                          <Badge active={p.active} />
                        </div>
                        <div className="truncate text-[12px] text-muted-foreground">
                          {catName[p.category_id ?? ""] ?? "Sin categoría"}
                          {p.brand_id && brandName[p.brand_id] ? ` · ${brandName[p.brand_id]}` : ""}
                          {p.code ? ` · ${p.code}` : ""}
                        </div>
                      </div>
                      <div className="hidden shrink-0 text-right text-[13px] sm:block">
                        {price ? <span className="font-semibold text-[var(--navy)]">{price}</span> : <span className="text-muted-foreground">Consultar</span>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link href={`/admin/products/edit?id=${p.id}`}><Btn variant="ghost" size="sm" icon="edit">Editar</Btn></Link>
                        <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(p)}><Icon name="trash" className="size-4" /></Btn>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

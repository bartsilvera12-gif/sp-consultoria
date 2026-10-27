"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/supabase/client";
import { useAdminAuth } from "@/components/admin/admin-provider";

type Stats = {
  productsTotal: number | null;
  productsActive: number | null;
  categories: number | null;
  services: number | null;
  lastUpdate: string | null;
};

type RecentProduct = { id: string; name_es: string; updated_at: string; active: boolean };

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    productsTotal: null, productsActive: null, categories: null, services: null, lastUpdate: null,
  });
  const [recent, setRecent] = useState<RecentProduct[]>([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const head = { count: "exact" as const, head: true };
        const [pt, pa, cat, srv, last, rec] = await Promise.all([
          db().from("products").select("*", head),
          db().from("products").select("*", head).eq("active", true),
          db().from("product_categories").select("*", head),
          db().from("services").select("*", head),
          db().from("products").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
          db().from("products").select("id,name_es,updated_at,active").order("updated_at", { ascending: false }).limit(5),
        ]);
        setStats({
          productsTotal: pt.count ?? 0,
          productsActive: pa.count ?? 0,
          categories: cat.count ?? 0,
          services: srv.count ?? 0,
          lastUpdate: (last.data as { updated_at: string } | null)?.updated_at ?? null,
        });
        setRecent((rec.data as RecentProduct[]) ?? []);
      } catch {
        setErr(true);
      }
    })();
  }, []);

  const cards = [
    { label: "Productos", value: stats.productsTotal, icon: "box" },
    { label: "Productos activos", value: stats.productsActive, icon: "check" },
    { label: "Categorías", value: stats.categories, icon: "tag" },
    { label: "Servicios", value: stats.services, icon: "wrench" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--navy)]">Hola{admin?.full_name ? `, ${admin.full_name}` : ""} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Resumen del sitio y accesos rápidos.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy-2)]">
          + Nuevo producto
        </Link>
      </div>

      {err && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          No se pudieron cargar los datos. Verificá que el schema <code>spconsultoriaweb</code> esté expuesto en la Data API de Supabase.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="text-[13px] font-medium text-muted-foreground">{c.label}</div>
            <div className="mt-2 text-3xl font-bold text-[var(--navy)] tabular-nums">{c.value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--navy)]">Últimos productos modificados</h2>
          <div className="mt-4 divide-y divide-black/5">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin datos todavía.</p>
            ) : (
              recent.map((p) => (
                <Link key={p.id} href={`/admin/products/edit?id=${p.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                  <span className="truncate text-[13.5px] text-[var(--navy)]">{p.name_es}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.active ? "Activo" : "Inactivo"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--navy)]">Acciones rápidas</h2>
          <div className="mt-4 flex flex-col gap-2">
            {[
              { label: "Nuevo producto", href: "/admin/products/new" },
              { label: "Administrar productos", href: "/admin/products" },
              { label: "Editar contenido", href: "/admin/content" },
              { label: "Administrar servicios", href: "/admin/services" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="rounded-lg border border-black/5 bg-[#f3f5f9] px-3.5 py-2.5 text-[13.5px] font-medium text-[var(--navy)] transition-colors hover:bg-[var(--muted)]">
                {a.label}
              </Link>
            ))}
          </div>
          {stats.lastUpdate && (
            <p className="mt-4 text-[11px] text-muted-foreground">
              Última actualización: {new Date(stats.lastUpdate).toLocaleString("es-PY")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

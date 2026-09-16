"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Camera,
  KeyRound,
  MessageCircle,
  MonitorSmartphone,
  Network,
  Package,
  Search,
} from "lucide-react";
import { contact } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { productCategories, products, type ProductCategory } from "@/lib/products";

const categoryIcons = {
  "Cámaras": Camera,
  "Videoporteros": MonitorSmartphone,
  "Alarmas y sensores": Bell,
  "Control de acceso": KeyRound,
  "Redes y grabación": Network,
  "Otros": Package,
} satisfies Record<ProductCategory, typeof Camera>;

const categoryLabels: Record<ProductCategory, { es: string; en: string }> = {
  "Cámaras": { es: "Cámaras", en: "Cameras" },
  "Videoporteros": { es: "Videoporteros", en: "Video intercoms" },
  "Alarmas y sensores": { es: "Alarmas y sensores", en: "Alarms & sensors" },
  "Control de acceso": { es: "Control de acceso", en: "Access control" },
  "Redes y grabación": { es: "Redes y grabación", en: "Network & recording" },
  "Otros": { es: "Otros", en: "Other" },
};

export function ProductCatalog() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | ProductCategory>("Todos");

  const copy =
    lang === "es"
      ? {
          search: "Buscar por producto, marca o código...",
          all: "Todos",
          found: "productos disponibles",
          empty: "No encontramos productos con esos filtros.",
          code: "Código",
          ask: "Consultar precio",
          note: "Los precios no se publican en el sitio. Cada producto se cotiza según disponibilidad y necesidad del proyecto.",
        }
      : {
          search: "Search by product, brand or code...",
          all: "All",
          found: "products available",
          empty: "No products match those filters.",
          code: "Code",
          ask: "Ask for price",
          note: "Prices are not published on the website. Each product is quoted according to availability and project requirements.",
        };

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery =
        !term ||
        product.name.toLocaleLowerCase().includes(term) ||
        product.brand.toLocaleLowerCase().includes(term) ||
        product.code.toLocaleLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <>
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            className="h-13 w-full rounded-2xl border border-black/10 bg-white pl-12 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-[var(--navy-2)]/40 focus:ring-4 focus:ring-[var(--navy-2)]/5"
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setCategory("Todos")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            category === "Todos"
              ? "border-[var(--navy)] bg-[var(--navy)] text-white"
              : "border-black/10 bg-white text-muted-foreground hover:border-[var(--navy-2)]/30 hover:text-navy"
          }`}
        >
          {copy.all}
        </button>
        {productCategories.map((item) => {
          const CategoryIcon = categoryIcons[item];
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === item
                  ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                  : "border-black/10 bg-white text-muted-foreground hover:border-[var(--navy-2)]/30 hover:text-navy"
              }`}
            >
              <CategoryIcon className="size-4" />
              {categoryLabels[item][lang]}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-b border-black/5 pb-4">
        <p className="text-sm font-medium text-muted-foreground">
          <span className="font-bold text-navy">{filtered.length}</span> {copy.found}
        </p>
        <p className="hidden max-w-xl text-right text-xs leading-relaxed text-muted-foreground sm:block">{copy.note}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">{copy.empty}</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const ProductIcon = categoryIcons[product.category];
            const waMessage = encodeURIComponent(
              lang === "es"
                ? `Hola, quisiera consultar el precio y disponibilidad del producto ${product.name} (código ${product.code}).`
                : `Hello, I would like to ask about price and availability for ${product.name} (code ${product.code}).`,
            );
            const waLink = `${contact.wa}?text=${waMessage}`;

            return (
              <article
                key={product.code}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-[linear-gradient(135deg,#f4f6f9_0%,#e8edf4_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(65,90,119,0.15),transparent_45%)]" />
                  <div className="relative grid size-20 place-items-center rounded-3xl bg-white text-navy shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
                    <ProductIcon className="size-9" strokeWidth={1.6} />
                  </div>
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-navy shadow-sm backdrop-blur">
                    {product.brand}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold text-[var(--slate)]">
                    {copy.code}: {product.code}
                  </span>
                  <h2 className="mt-2 line-clamp-4 text-[15px] font-bold leading-snug text-navy">
                    {product.name}
                  </h2>
                  <span className="mt-3 inline-flex w-fit rounded-full bg-[var(--muted)] px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {categoryLabels[product.category][lang]}
                  </span>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--navy-2)]"
                  >
                    <MessageCircle className="size-4" />
                    {copy.ask}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground sm:hidden">{copy.note}</p>
    </>
  );
}

"use client";

// Provee al sitio público el contenido mezclado: Supabase cuando está disponible,
// con content.ts como respaldo. El HTML estático se genera con el respaldo (SEO),
// y tras hidratar se actualiza con lo que haya en Supabase (idéntico salvo ediciones).

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  dict as fallbackDict, contact as fallbackContact, productCatalog,
  type Dict, type Lang,
} from "@/lib/content";
import { fetchPublicData, type PublicData } from "@/lib/supabase/public-queries";

export type CatalogItem = { name: string; brand: string; price: string; showPrice: boolean; img?: string; description?: string; code?: string; model?: string };
export type CatalogGroup = { id: string; icon: string; items: CatalogItem[] };
export type Contact = typeof fallbackContact;

type SiteData = { dict: Record<Lang, Dict>; contact: Contact; catalog: CatalogGroup[] };

/* ----------------------------- helpers ----------------------------- */

const money = (n: number) => new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(n);
const pick = (v: unknown, fb: string): string => (typeof v === "string" && v.trim() ? v : fb);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const strArr = (v: unknown, fb: string[]): string[] =>
  Array.isArray(v) && v.length && v.every((x) => typeof x === "string") ? (v as string[]) : fb;

/* Catálogo de respaldo (content.ts) con rutas de imagen ya resueltas. */
const fallbackCatalog: CatalogGroup[] = productCatalog.map((g) => ({
  id: g.id as string,
  icon: g.icon,
  items: g.items.map((p) => ({
    name: p.name, brand: p.brand, price: p.price, showPrice: true,
    img: p.img ? `/productos/${p.img}` : undefined,
  })),
}));

const FALLBACK: SiteData = { dict: fallbackDict, contact: fallbackContact, catalog: fallbackCatalog };

/* Construye el dict de un idioma mezclando Supabase sobre el respaldo. */
function buildDict(base: Dict, data: PublicData, lang: Lang): Dict {
  const S = (k: string) => obj(data.sections[k]?.[lang]);
  const t = (es: string | null, en: string | null) => ((lang === "en" ? en ?? es : es) ?? "");

  const hero = S("hero"), about = S("about"), mvS = S("mission_vision"), svcH = S("services_header"),
    prodH = S("products_header"), methH = S("methodology_header"), diffH = S("differentiators_header"),
    procH = S("process_header"), ctaS = S("contact_cta"), uiS = S("ui_labels");
  const mission = obj(mvS.mission), vision = obj(mvS.vision);

  const catMap: Record<string, string> = {};
  for (const c of data.categories) catMap[c.key] = t(c.name_es, c.name_en);

  return {
    nav: data.navigation.length
      ? data.navigation.map((n) => ({ label: t(n.label_es, n.label_en), href: n.href }))
      : base.nav,
    hero: {
      eyebrow: pick(hero.eyebrow, base.hero.eyebrow),
      line1: pick(hero.line1, base.hero.line1),
      line2: pick(hero.line2, base.hero.line2),
      line3: pick(hero.line3, base.hero.line3),
      sub: pick(hero.sub, base.hero.sub),
      cta1: pick(hero.cta1, base.hero.cta1),
      cta2: pick(hero.cta2, base.hero.cta2),
    },
    about: {
      h1: pick(about.h1, base.about.h1),
      h2: pick(about.h2, base.about.h2),
      paras: strArr(about.paras, base.about.paras),
      quote: pick(about.quote, base.about.quote),
    },
    values: {
      items: data.values.length
        ? data.values.map((v) => ({ title: t(v.title_es, v.title_en), desc: t(v.description_es, v.description_en) }))
        : base.values.items,
    },
    services: {
      sub: pick(svcH.sub, base.services.sub),
      items: data.services.length
        ? data.services.map((s) => ({
            icon: s.icon ?? "",
            title: t(s.title_es, s.title_en),
            tags: data.serviceTags.filter((tg) => tg.service_id === s.id).map((tg) => t(tg.label_es, tg.label_en)),
          }))
        : base.services.items,
    },
    products: {
      eyebrow: pick(prodH.eyebrow, base.products.eyebrow),
      title1: pick(prodH.title1, base.products.title1),
      title2: pick(prodH.title2, base.products.title2),
      sub: pick(prodH.sub, base.products.sub),
      note: pick(prodH.note, base.products.note),
      quote: pick(prodH.quote, base.products.quote),
      all: pick(prodH.all, base.products.all),
      currency: pick(prodH.currency, base.products.currency),
      waPrefix: pick(prodH.waPrefix, base.products.waPrefix),
      categories: { ...base.products.categories, ...catMap },
    },
    feature: base.feature,
    method: {
      text: pick(methH.text, base.method.text),
      standards: data.standards.length
        ? data.standards.map((st) => ({ code: st.code, name: t(st.name_es, st.name_en) }))
        : base.method.standards,
    },
    process: {
      phases: data.processPhases.length
        ? data.processPhases.map((p) => ({ title: t(p.title_es, p.title_en), desc: t(p.description_es, p.description_en) }))
        : base.process.phases,
    },
    diff: {
      items: data.differentiators.length
        ? data.differentiators.map((dd) => ({ icon: dd.icon ?? "", title: t(dd.title_es, dd.title_en) }))
        : base.diff.items,
    },
    mv: {
      mission: { kicker: pick(mission.kicker, base.mv.mission.kicker), text: pick(mission.text, base.mv.mission.text) },
      vision: { kicker: pick(vision.kicker, base.mv.vision.kicker), text: pick(vision.text, base.mv.vision.text) },
    },
    cta: {
      eyebrow: pick(ctaS.eyebrow, base.cta.eyebrow),
      h: pick(ctaS.h, base.cta.h),
      sub: pick(ctaS.sub, base.cta.sub),
      button: pick(ctaS.button, base.cta.button),
      note: pick(ctaS.note, base.cta.note),
    },
    ui: {
      ...base.ui,
      aboutEyebrow: pick(uiS.aboutEyebrow, base.ui.aboutEyebrow),
      purposeEyebrow: pick(uiS.purposeEyebrow, base.ui.purposeEyebrow),
      valuesEyebrow: pick(uiS.valuesEyebrow, base.ui.valuesEyebrow),
      valuesTitle: pick(uiS.valuesTitle, base.ui.valuesTitle),
      servicesEyebrow: pick(svcH.eyebrow, base.ui.servicesEyebrow),
      servicesTitle1: pick(svcH.title1, base.ui.servicesTitle1),
      servicesTitle2: pick(svcH.title2, base.ui.servicesTitle2),
      methodEyebrow: pick(methH.eyebrow, base.ui.methodEyebrow),
      methodTitle: pick(methH.title, base.ui.methodTitle),
      methodCaption: pick(methH.caption, base.ui.methodCaption),
      standardsBadge: pick(methH.badge, base.ui.standardsBadge),
      diffEyebrow: pick(diffH.eyebrow, base.ui.diffEyebrow),
      diffTitle: pick(diffH.title, base.ui.diffTitle),
      processEyebrow: pick(procH.eyebrow, base.ui.processEyebrow),
      processTitle: pick(procH.title, base.ui.processTitle),
      phase: pick(uiS.phase, base.ui.phase),
      contactPhone: pick(uiS.contactPhone, base.ui.contactPhone),
      contactEmail: pick(uiS.contactEmail, base.ui.contactEmail),
      contactLocation: pick(uiS.contactLocation, base.ui.contactLocation),
      brandTagline: pick(uiS.brandTagline, base.ui.brandTagline),
      headerCta: pick(uiS.headerCta, base.ui.headerCta),
      footerNav: pick(uiS.footerNav, base.ui.footerNav),
      footerContact: pick(uiS.footerContact, base.ui.footerContact),
      developedBy: pick(uiS.developedBy, base.ui.developedBy),
      privacy: pick(uiS.privacy, base.ui.privacy),
    },
  };
}

function buildContact(data: PublicData): Contact {
  const s = data.settings;
  if (!s) return fallbackContact;
  return {
    phone: pick(s.phone, fallbackContact.phone),
    phoneRaw: pick(s.phone_raw, fallbackContact.phoneRaw),
    email: pick(s.email, fallbackContact.email),
    place: pick(s.address, fallbackContact.place),
    wa: pick(s.whatsapp_url, s.whatsapp_number ? `https://wa.me/${s.whatsapp_number}` : fallbackContact.wa),
    maps: pick(s.maps_url, fallbackContact.maps),
    instagram: pick(s.instagram_url, fallbackContact.instagram),
    tiktok: pick(s.tiktok_url, fallbackContact.tiktok),
  };
}

function buildCatalog(data: PublicData): CatalogGroup[] {
  if (!data.categories.length || !data.products.length) return fallbackCatalog;
  const brandName: Record<string, string> = {};
  for (const b of data.brands) brandName[b.id] = b.name;
  const groups = data.categories.map((c) => ({
    id: c.key,
    icon: c.icon ?? "box",
    items: data.products
      .filter((p) => p.category_id === c.id)
      .map((p) => ({
        name: p.name_es || p.name_en || "",
        brand: p.brand_id ? brandName[p.brand_id] ?? "" : "",
        price: p.show_price && p.sale_price != null ? money(Number(p.sale_price)) : "",
        showPrice: Boolean(p.show_price) && p.sale_price != null,
        img: p.image_url || undefined,
        description: p.description_es || p.description_en || undefined,
        code: p.code || undefined,
        model: p.model || undefined,
      })),
  }));
  const withItems = groups.filter((g) => g.items.length);
  return withItems.length ? withItems : fallbackCatalog;
}

/* ----------------------------- contexto ----------------------------- */

const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(FALLBACK);

  useEffect(() => {
    let alive = true;
    fetchPublicData().then((pd) => {
      if (!alive || !pd) return;
      setData({
        dict: { es: buildDict(fallbackDict.es, pd, "es"), en: buildDict(fallbackDict.en, pd, "en") },
        contact: buildContact(pd),
        catalog: buildCatalog(pd),
      });
    });
    return () => { alive = false; };
  }, []);

  const value = useMemo(() => data, [data]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteData {
  return useContext(SiteDataContext) ?? FALLBACK;
}

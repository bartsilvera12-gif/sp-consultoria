// Lectura pública del sitio desde Supabase (rol anon).
// IMPORTANTE: acá NUNCA se consulta product_costs (costo de proveedor, privado).
// Si Supabase no está configurado o falla, devuelve null y la web usa content.ts.

import { supabaseEnabled, db } from "./client";
import type {
  SiteSettings, NavigationItem, ValueItem, Service, ServiceTag, Standard,
  Differentiator, ProcessPhase, ProductCategory, ProductBrand, Product,
} from "./types";

export interface PublicData {
  settings: SiteSettings | null;
  navigation: NavigationItem[];
  sections: Record<string, { es: Record<string, unknown>; en: Record<string, unknown> }>;
  values: ValueItem[];
  services: Service[];
  serviceTags: ServiceTag[];
  standards: Standard[];
  differentiators: Differentiator[];
  processPhases: ProcessPhase[];
  categories: ProductCategory[];
  brands: ProductBrand[];
  products: Product[];
}

export async function fetchPublicData(): Promise<PublicData | null> {
  if (!supabaseEnabled) return null;
  try {
    const d = db();
    const [
      settings, navigation, sections, values, services, serviceTags,
      standards, differentiators, processPhases, categories, brands, products,
    ] = await Promise.all([
      d.from("site_settings").select("*").limit(1).maybeSingle(),
      d.from("navigation_items").select("*").eq("active", true).order("sort_order"),
      d.from("content_sections").select("*").eq("active", true),
      d.from("values").select("*").eq("active", true).order("sort_order"),
      d.from("services").select("*").eq("active", true).order("sort_order"),
      d.from("service_tags").select("*").order("sort_order"),
      d.from("standards").select("*").eq("active", true).order("sort_order"),
      d.from("differentiators").select("*").eq("active", true).order("sort_order"),
      d.from("process_phases").select("*").eq("active", true).order("sort_order"),
      d.from("product_categories").select("*").eq("active", true).order("sort_order"),
      d.from("product_brands").select("*"),
      d.from("products").select("*").eq("active", true).order("sort_order"),
    ]);

    // Si las consultas núcleo fallan (p.ej. schema no expuesto), usar respaldo.
    if (products.error && navigation.error && sections.error) return null;

    const sectionMap: PublicData["sections"] = {};
    for (const s of (sections.data as { section_key: string; content_es: Record<string, unknown>; content_en: Record<string, unknown> }[]) ?? []) {
      sectionMap[s.section_key] = { es: s.content_es ?? {}, en: s.content_en ?? {} };
    }

    return {
      settings: (settings.data as SiteSettings) ?? null,
      navigation: (navigation.data as NavigationItem[]) ?? [],
      sections: sectionMap,
      values: (values.data as ValueItem[]) ?? [],
      services: (services.data as Service[]) ?? [],
      serviceTags: (serviceTags.data as ServiceTag[]) ?? [],
      standards: (standards.data as Standard[]) ?? [],
      differentiators: (differentiators.data as Differentiator[]) ?? [],
      processPhases: (processPhases.data as ProcessPhase[]) ?? [],
      categories: (categories.data as ProductCategory[]) ?? [],
      brands: (brands.data as ProductBrand[]) ?? [],
      products: (products.data as Product[]) ?? [],
    };
  } catch {
    return null;
  }
}

// Tipos de las entidades del schema spconsultoriaweb.
// Mantener en sync con la migración supabase/migrations/001_spconsultoriaweb.sql

export type Role = "superadmin" | "editor";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  company_name: string | null;
  tagline_es: string | null;
  tagline_en: string | null;
  phone: string | null;
  phone_raw: string | null;
  email: string | null;
  address: string | null;
  whatsapp_number: string | null;
  whatsapp_url: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label_es: string;
  label_en: string;
  href: string;
  sort_order: number;
  active: boolean;
}

export interface ContentSection {
  id: string;
  section_key: string;
  content_es: Record<string, unknown>;
  content_en: Record<string, unknown>;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

export interface ValueItem {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string | null;
  description_en: string | null;
  sort_order: number;
  active: boolean;
}

export interface Service {
  id: string;
  icon: string | null;
  title_es: string;
  title_en: string;
  description_es: string | null;
  description_en: string | null;
  sort_order: number;
  active: boolean;
}

export interface ServiceTag {
  id: string;
  service_id: string;
  label_es: string;
  label_en: string;
  sort_order: number;
}

export interface Standard {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  sort_order: number;
  active: boolean;
}

export interface Differentiator {
  id: string;
  icon: string | null;
  title_es: string;
  title_en: string;
  sort_order: number;
  active: boolean;
}

export interface ProcessPhase {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string | null;
  description_en: string | null;
  sort_order: number;
  active: boolean;
}

export interface ProductCategory {
  id: string;
  key: string;
  name_es: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export interface ProductBrand {
  id: string;
  name: string;
  active: boolean;
}

export interface Product {
  id: string;
  code: string | null;
  category_id: string | null;
  brand_id: string | null;
  slug: string;
  name_es: string;
  name_en: string | null;
  description_es: string | null;
  description_en: string | null;
  model: string | null;
  image_url: string | null;
  sale_price: number | null;
  show_price: boolean;
  currency: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** PRIVADO: sólo accesible por administradores (RLS). */
export interface ProductCost {
  id: string;
  product_id: string;
  supplier_name: string | null;
  supplier_cost: number | null;
  currency: string;
  source_document: string | null;
  notes: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  public_url: string | null;
  alt_es: string | null;
  alt_en: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_by: string | null;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title_es: string | null;
  title_en: string | null;
  content_es: string | null;
  content_en: string | null;
  meta_title_es: string | null;
  meta_title_en: string | null;
  meta_description_es: string | null;
  meta_description_en: string | null;
  published: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

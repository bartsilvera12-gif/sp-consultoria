-- ============================================================================
-- SP Consultoría — Migración inicial del panel administrador
-- Schema: spconsultoriaweb   (todas las tablas de negocio viven acá)
-- Ejecutable desde cero. Idempotente en lo posible.
--
-- IMPORTANTE (Supabase): luego de correr esto, exponer el schema `spconsultoriaweb`
-- en la Data API:  Dashboard > Project Settings > API > Exposed schemas
-- (o en self-hosted: PGRST_DB_SCHEMAS="public,storage,spconsultoriaweb").
-- ============================================================================

begin;

create schema if not exists spconsultoriaweb;

-- ----------------------------------------------------------------------------
-- Helper: mantener updated_at
-- ----------------------------------------------------------------------------
create or replace function spconsultoriaweb.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLAS
-- ============================================================================

-- ---- Administradores ----
create table if not exists spconsultoriaweb.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique not null references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'editor' check (role in ('superadmin','editor')),
  active       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Configuración general del sitio (una sola fila) ----
create table if not exists spconsultoriaweb.site_settings (
  id              uuid primary key default gen_random_uuid(),
  company_name    text,
  tagline_es      text,
  tagline_en      text,
  phone           text,
  phone_raw       text,
  email           text,
  address         text,
  whatsapp_number text,
  whatsapp_url    text,
  maps_url        text,
  instagram_url   text,
  tiktok_url      text,
  logo_url        text,
  favicon_url     text,
  og_image_url    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---- Navegación ----
create table if not exists spconsultoriaweb.navigation_items (
  id          uuid primary key default gen_random_uuid(),
  label_es    text not null,
  label_en    text not null,
  href        text not null,
  sort_order  integer not null default 0,
  active       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Secciones de contenido estructurado (hero, about, headers, etc.) ----
create table if not exists spconsultoriaweb.content_sections (
  id          uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  content_es  jsonb not null default '{}'::jsonb,
  content_en  jsonb not null default '{}'::jsonb,
  image_url   text,
  active       boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Valores ----
create table if not exists spconsultoriaweb.values (
  id             uuid primary key default gen_random_uuid(),
  title_es       text not null,
  title_en       text not null,
  description_es text,
  description_en text,
  sort_order     integer not null default 0,
  active          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---- Servicios ----
create table if not exists spconsultoriaweb.services (
  id             uuid primary key default gen_random_uuid(),
  icon           text,
  title_es       text not null,
  title_en       text not null,
  description_es text,
  description_en text,
  sort_order     integer not null default 0,
  active          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists spconsultoriaweb.service_tags (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references spconsultoriaweb.services(id) on delete cascade,
  label_es    text not null,
  label_en    text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_service_tags_service on spconsultoriaweb.service_tags(service_id);

-- ---- Estándares / Metodología ----
create table if not exists spconsultoriaweb.standards (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  name_es     text not null,
  name_en     text not null,
  sort_order  integer not null default 0,
  active       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Diferenciales ----
create table if not exists spconsultoriaweb.differentiators (
  id          uuid primary key default gen_random_uuid(),
  icon        text,
  title_es    text not null,
  title_en    text not null,
  sort_order  integer not null default 0,
  active       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Proceso de trabajo ----
create table if not exists spconsultoriaweb.process_phases (
  id             uuid primary key default gen_random_uuid(),
  title_es       text not null,
  title_en       text not null,
  description_es text,
  description_en text,
  sort_order     integer not null default 0,
  active          boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---- Categorías de productos ----
create table if not exists spconsultoriaweb.product_categories (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name_es     text not null,
  name_en     text not null,
  icon        text,
  sort_order  integer not null default 0,
  active       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Marcas ----
create table if not exists spconsultoriaweb.product_brands (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  active       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Productos (PÚBLICO: nunca contiene el costo del proveedor) ----
create table if not exists spconsultoriaweb.products (
  id             uuid primary key default gen_random_uuid(),
  code           text,
  category_id    uuid references spconsultoriaweb.product_categories(id) on delete set null,
  brand_id       uuid references spconsultoriaweb.product_brands(id) on delete set null,
  slug           text unique not null,
  name_es        text not null,
  name_en        text,
  description_es text,
  description_en text,
  model          text,
  image_url      text,
  sale_price     numeric,
  show_price     boolean not null default false,
  currency       text not null default 'PYG',
  featured       boolean not null default false,
  active          boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_products_category on spconsultoriaweb.products(category_id);
create index if not exists idx_products_brand on spconsultoriaweb.products(brand_id);
create index if not exists idx_products_active on spconsultoriaweb.products(active);

-- ---- Costos del proveedor (PRIVADO: solo admins) ----
create table if not exists spconsultoriaweb.product_costs (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid unique not null references spconsultoriaweb.products(id) on delete cascade,
  supplier_name   text,
  supplier_cost   numeric,
  currency        text not null default 'PYG',
  source_document text,
  notes           text,
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users(id) on delete set null
);

-- ---- Multimedia ----
create table if not exists spconsultoriaweb.media_assets (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'spconsultoriaweb-media',
  path        text not null,
  public_url  text,
  alt_es      text,
  alt_en      text,
  mime_type   text,
  size_bytes  bigint,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---- Páginas (ej. política de privacidad) ----
create table if not exists spconsultoriaweb.pages (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  title_es             text,
  title_en             text,
  content_es           text,
  content_en           text,
  meta_title_es        text,
  meta_title_en        text,
  meta_description_es  text,
  meta_description_en  text,
  published            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---- Auditoría ----
create table if not exists spconsultoriaweb.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_created on spconsultoriaweb.audit_logs(created_at desc);

-- ============================================================================
-- TRIGGERS updated_at
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'admin_users','site_settings','navigation_items','content_sections','values',
    'services','service_tags','standards','differentiators','process_phases',
    'product_categories','product_brands','products','pages'
  ] loop
    execute format(
      'drop trigger if exists trg_set_updated_at on spconsultoriaweb.%1$I;
       create trigger trg_set_updated_at before update on spconsultoriaweb.%1$I
       for each row execute function spconsultoriaweb.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
-- FUNCIONES DE SEGURIDAD
-- ============================================================================
create or replace function spconsultoriaweb.is_admin()
returns boolean
language sql
stable
security definer
set search_path = spconsultoriaweb, public, pg_temp
as $$
  select exists (
    select 1 from spconsultoriaweb.admin_users a
    where a.user_id = auth.uid() and a.active = true
  );
$$;

create or replace function spconsultoriaweb.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = spconsultoriaweb, public, pg_temp
as $$
  select exists (
    select 1 from spconsultoriaweb.admin_users a
    where a.user_id = auth.uid() and a.active = true and a.role = 'superadmin'
  );
$$;

-- ============================================================================
-- RLS + POLÍTICAS
-- ============================================================================
-- Activar RLS en todas las tablas
do $$
declare t text;
begin
  foreach t in array array[
    'admin_users','site_settings','navigation_items','content_sections','values',
    'services','service_tags','standards','differentiators','process_phases',
    'product_categories','product_brands','products','product_costs',
    'media_assets','pages','audit_logs'
  ] loop
    execute format('alter table spconsultoriaweb.%I enable row level security;', t);
  end loop;
end $$;

-- ---- Tablas PÚBLICAS: lectura anónima de registros activos; CRUD admin ----
-- (se arma una policy de lectura por "active" y una de administración total)
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','navigation_items','content_sections','values','services',
    'service_tags','standards','differentiators','process_phases',
    'product_categories','product_brands','products'
  ] loop
    -- lectura pública
    execute format('drop policy if exists p_public_read on spconsultoriaweb.%I;', t);
    if t in ('site_settings','service_tags') then
      -- estas no tienen columna active booleana de "publicado" relevante → lectura libre
      execute format('create policy p_public_read on spconsultoriaweb.%I for select to anon, authenticated using (true);', t);
    else
      execute format('create policy p_public_read on spconsultoriaweb.%I for select to anon, authenticated using (active = true or spconsultoriaweb.is_admin());', t);
    end if;
    -- administración total
    execute format('drop policy if exists p_admin_all on spconsultoriaweb.%I;', t);
    execute format('create policy p_admin_all on spconsultoriaweb.%I for all to authenticated using (spconsultoriaweb.is_admin()) with check (spconsultoriaweb.is_admin());', t);
  end loop;
end $$;

-- ---- Páginas: lectura pública solo publicadas ----
drop policy if exists p_pages_read on spconsultoriaweb.pages;
create policy p_pages_read on spconsultoriaweb.pages
  for select to anon, authenticated using (published = true or spconsultoriaweb.is_admin());
drop policy if exists p_pages_admin on spconsultoriaweb.pages;
create policy p_pages_admin on spconsultoriaweb.pages
  for all to authenticated using (spconsultoriaweb.is_admin()) with check (spconsultoriaweb.is_admin());

-- ---- PRIVADO: costos del proveedor (NUNCA anon) ----
drop policy if exists p_costs_admin on spconsultoriaweb.product_costs;
create policy p_costs_admin on spconsultoriaweb.product_costs
  for all to authenticated using (spconsultoriaweb.is_admin()) with check (spconsultoriaweb.is_admin());

-- ---- PRIVADO: media_assets (solo admin) ----
drop policy if exists p_media_admin on spconsultoriaweb.media_assets;
create policy p_media_admin on spconsultoriaweb.media_assets
  for all to authenticated using (spconsultoriaweb.is_admin()) with check (spconsultoriaweb.is_admin());

-- ---- PRIVADO: audit_logs (admin lee/inserta) ----
drop policy if exists p_audit_read on spconsultoriaweb.audit_logs;
create policy p_audit_read on spconsultoriaweb.audit_logs
  for select to authenticated using (spconsultoriaweb.is_admin());
drop policy if exists p_audit_insert on spconsultoriaweb.audit_logs;
create policy p_audit_insert on spconsultoriaweb.audit_logs
  for insert to authenticated with check (spconsultoriaweb.is_admin() and user_id = auth.uid());

-- ---- admin_users: admin lee; superadmin administra ----
drop policy if exists p_admin_users_read on spconsultoriaweb.admin_users;
create policy p_admin_users_read on spconsultoriaweb.admin_users
  for select to authenticated using (spconsultoriaweb.is_admin());
drop policy if exists p_admin_users_manage on spconsultoriaweb.admin_users;
create policy p_admin_users_manage on spconsultoriaweb.admin_users
  for all to authenticated using (spconsultoriaweb.is_superadmin()) with check (spconsultoriaweb.is_superadmin());

-- ============================================================================
-- PERMISOS (grants). RLS sigue filtrando fila por fila.
-- ============================================================================
grant usage on schema spconsultoriaweb to anon, authenticated;

-- Tablas públicas: anon solo SELECT; authenticated CRUD (gateado por RLS)
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','navigation_items','content_sections','values','services',
    'service_tags','standards','differentiators','process_phases',
    'product_categories','product_brands','products','pages'
  ] loop
    execute format('grant select on spconsultoriaweb.%I to anon;', t);
    execute format('grant select, insert, update, delete on spconsultoriaweb.%I to authenticated;', t);
  end loop;
end $$;

-- Tablas privadas: nada para anon; CRUD para authenticated (gateado por RLS a admin)
do $$
declare t text;
begin
  foreach t in array array['product_costs','media_assets','audit_logs','admin_users'] loop
    execute format('revoke all on spconsultoriaweb.%I from anon;', t);
    execute format('grant select, insert, update, delete on spconsultoriaweb.%I to authenticated;', t);
  end loop;
end $$;

grant execute on function spconsultoriaweb.is_admin() to anon, authenticated;
grant execute on function spconsultoriaweb.is_superadmin() to anon, authenticated;

commit;

-- ============================================================================
-- SEEDS — contenido actual del sitio (src/lib/content.ts)
-- Ejecutar una sola vez (migración from-zero).
-- ============================================================================
begin;

-- ---- Configuración general ----
insert into spconsultoriaweb.site_settings
  (company_name, tagline_es, tagline_en, phone, phone_raw, email, address,
   whatsapp_number, whatsapp_url, maps_url, instagram_url, tiktok_url, logo_url, favicon_url, og_image_url)
values (
  'SP Consultoría, Estrategia y Seguridad',
  'Consultoría, Estrategia y Seguridad',
  'Consulting, Strategy and Security',
  '+595 984 868 243', '+595984868243',
  'spconsultoriayseguridad@gmail.com',
  'Manuel Gondra 1118, Lambaré — Paraguay',
  '595984868243', 'https://wa.me/595984868243',
  'https://maps.google.com/?q=Manuel+Gondra+1118+Lambar%C3%A9+Paraguay',
  'https://www.instagram.com/spconsultoriayseguridad',
  'https://www.tiktok.com/@spconsultoriayseguridad',
  '/brand/logo-emblem.png', '/favicon.ico', null
);

-- ---- Navegación (orden actual) ----
insert into spconsultoriaweb.navigation_items (label_es, label_en, href, sort_order) values
  ('Inicio','Home','#inicio',1),
  ('Nosotros','About','#nosotros',2),
  ('Servicios','Services','#servicios',3),
  ('Metodología','Methodology','#metodologia',4),
  ('Proceso','Process','#proceso',5),
  ('Contacto','Contact','#contacto',6),
  ('Productos','Products','#productos',7);

-- ---- Valores ----
insert into spconsultoriaweb.values (title_es, title_en, description_es, description_en, sort_order) values
  ('Profesionalismo','Professionalism','Rigor técnico y estándares profesionales en cada intervención.','Technical rigor and professional standards in every engagement.',1),
  ('Confidencialidad','Confidentiality','Manejo estrictamente reservado de toda la información.','Strictly reserved handling of all information.',2),
  ('Integridad','Integrity','Criterio ético y objetividad en cada análisis y recomendación.','Ethical judgment and objectivity in every analysis and recommendation.',3),
  ('Prevención','Prevention','Anticipar el riesgo antes de que se materialice.','Anticipating risk before it materializes.',4),
  ('Excelencia operativa','Operational excellence','Procesos precisos, medibles y sostenidos en el tiempo.','Precise, measurable processes sustained over time.',5),
  ('Compromiso','Commitment','Acompañamiento continuo orientado a resultados.','Continuous, results-oriented support.',6);

-- ---- Servicios + tags ----
insert into spconsultoriaweb.services (icon, title_es, title_en, sort_order) values
  ('target','Consultorías estratégicas','Strategic consulting',1),
  ('activity','Análisis de riesgos','Risk analysis',2),
  ('shield','Seguridad integral','Integral security',3),
  ('graduation','Capacitación','Training',4),
  ('search','Inteligencia corporativa','Corporate intelligence',5);

insert into spconsultoriaweb.service_tags (service_id, label_es, label_en, sort_order)
select s.id, t.es, t.en, t.ord from (values
  ('target','Planificación organizacional','Organizational planning',1),
  ('target','Asesoramiento institucional','Institutional advisory',2),
  ('target','Diagnóstico empresarial','Business diagnostics',3),
  ('target','Gestión estratégica','Strategic management',4),
  ('target','Evaluación operativa','Operational assessment',5),
  ('activity','Evaluación de amenazas','Threat assessment',1),
  ('activity','Identificación de vulnerabilidades','Vulnerability identification',2),
  ('activity','Gestión de riesgos','Risk management',3),
  ('activity','Informes técnicos','Technical reports',4),
  ('activity','Análisis situacional','Situational analysis',5),
  ('shield','Seguridad corporativa','Corporate security',1),
  ('shield','Protocolos','Protocols',2),
  ('shield','Planes de contingencia','Contingency plans',3),
  ('shield','Seguridad institucional','Institutional security',4),
  ('shield','Seguridad para eventos','Event security',5),
  ('shield','Auditorías de seguridad','Security audits',6),
  ('graduation','Cursos de seguridad','Security courses',1),
  ('graduation','Manejo de crisis','Crisis management',2),
  ('graduation','Gestión de riesgos','Risk management',3),
  ('graduation','Liderazgo organizacional','Organizational leadership',4),
  ('graduation','Protección institucional','Institutional protection',5),
  ('search','Recolección y análisis de información','Information gathering and analysis',1),
  ('search','Monitoreo estratégico','Strategic monitoring',2),
  ('search','Evaluación de amenazas','Threat assessment',3),
  ('search','Análisis preventivo','Preventive analysis',4)
) as t(icon, es, en, ord)
join spconsultoriaweb.services s on s.icon = t.icon;

-- ---- Estándares ----
insert into spconsultoriaweb.standards (code, name_es, name_en, sort_order) values
  ('ISO 31000','Gestión del Riesgo','Risk Management',1),
  ('ISO 22301','Continuidad del Negocio','Business Continuity',2),
  ('ISO 45001','Seguridad y Salud en el Trabajo','Occupational Health and Safety',3),
  ('ISO 27001','Seguridad de la Información','Information Security',4),
  ('ASIS Internacional','Buenas prácticas internacionales','International best practices',5);

-- ---- Diferenciales ----
insert into spconsultoriaweb.differentiators (icon, title_es, title_en, sort_order) values
  ('target','Enfoque estratégico','Strategic approach',1),
  ('shield','Gestión preventiva','Preventive management',2),
  ('award','Profesionalismo','Professionalism',3),
  ('globe','Metodologías internacionales','International methodologies',4),
  ('lock','Confidencialidad','Confidentiality',5),
  ('sliders','Soluciones personalizadas','Tailored solutions',6);

-- ---- Proceso ----
insert into spconsultoriaweb.process_phases (title_es, title_en, description_es, description_en, sort_order) values
  ('Diagnóstico y evaluación','Diagnosis and assessment','Relevamiento, identificación de amenazas y vulnerabilidades y evaluación de riesgos. Cierra con informe técnico y recomendaciones priorizadas.','Fieldwork, identification of threats and vulnerabilities and risk assessment. Concludes with a technical report and prioritized recommendations.',1),
  ('Acompañamiento en la implementación','Implementation support','Puesta en marcha de las mejoras recomendadas hasta su aplicación efectiva dentro de la organización.','Rolling out the recommended improvements until they are effectively applied within the organization.',2),
  ('Revisión documental','Documentary review','Políticas, manual de organización y funciones, procedimientos operativos y planes de emergencia, evacuación e incendios.','Policies, organization and functions manual, operating procedures and emergency, evacuation and fire plans.',3),
  ('Seguimiento y mejora continua','Monitoring and continuous improvement','Visitas periódicas de control cada seis meses: verificación, actualización documental y ajuste de medidas.','Periodic control visits every six months: verification, documentary updates and adjustment of measures.',4);

-- ---- Categorías de productos ----
insert into spconsultoriaweb.product_categories (key, name_es, name_en, icon, sort_order) values
  ('videoporteros','Videoporteros y citófonos','Video intercoms','video',1),
  ('camarasIp','Cámaras IP','IP cameras','camera',2),
  ('camarasHd','Cámaras Turbo HD / analógicas','Turbo HD / analog cameras','camera-hd',3),
  ('camarasPtz','Cámaras PTZ, PanoVu y Fisheye','PTZ, PanoVu & Fisheye cameras','ptz',4),
  ('acceso','Control de acceso y perimetral','Access control & perimeter','access',5),
  ('alarmas','Alarmas y sensores','Alarms & sensors','alarm',6),
  ('redes','Grabación y redes','Recording & networking','network',7)
on conflict (key) do nothing;

-- ---- Marcas ----
insert into spconsultoriaweb.product_brands (name) values
  ('HIKVISION'),('HILOOK'),('EZVIZ'),('COMMAX'),('SONOFF'),('SASSIN')
on conflict (name) do nothing;

-- ---- Productos (sin costo; costo va aparte) ----
insert into spconsultoriaweb.products (category_id, brand_id, code, slug, name_es, image_url, sort_order) values
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117808', '117808', 'Distribuidor de piso principal p/ video portero Línea Modum CMD-101BU', '/productos/117808.png', 1),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117809', '117809', 'Distribuidor de piso p/ video portero Línea Modum Full CMD-404FU', '/productos/117809.png', 2),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117167', '117167', 'Citófono secundario para video portero DP-4VHP', '/productos/117167.png', 3),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117171', '117171', 'Distribuidor de piso p/ video portero Línea Modum CMD-404CFU', '/productos/117171.png', 4),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117815', '117815', 'Cámara domo p/ video portero Modum Video Full CAD-I4V7TP', '/productos/117815.png', 5),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117814', '117814', 'Cámara bullet p/ video portero Modum Video Full CAU-D047TP', '/productos/117814.png', 6),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='COMMAX'), '117170', '117170', 'Frente video portero Línea Modum CMP-4BCT', '/productos/117170.png', 7),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '133537', '133537', 'Teclado para video portero (DS-KD9633-WBE6) DS-KDM9633-FKP', '/productos/133537.png', 8),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124929', '124929', 'Kit de videoportero híbrido DS-KIS302-P', '/productos/124929.png', 9),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124928', '124928', 'Kit de videoportero IP DS-KIS603-P(C)', '/productos/124928.png', 10),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130173', '130173', 'Monitor videoportero analógico DS-KH2230T', '/productos/130173.png', 11),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124330', '124330', 'Monitor videoportero Android 10" DS-KH9510-WTE1(B)', '/productos/124330.png', 12),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124329', '124329', 'Monitor videoportero Android 7" DS-KH9310-WTE1', '/productos/124329.png', 13),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130169', '130169', 'Monitor videoportero IP DS-KH6100-E1', '/productos/130169.png', 14),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130170', '130170', 'Monitor videoportero IP DS-KH6110-WE1', '/productos/130170.png', 15),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130166', '130166', 'Kit de videoportero analógico DS-KIS212', '/productos/130166.png', 16),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129543', '129543', 'Estación de conserjería IP DS-KM9503', '/productos/129543.png', 17),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124328', '124328', 'Frente de calle antivandálico DS-KB8113-IME1', '/productos/124328.png', 18),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '133536', '133536', 'Video portero DS-KD9633-WBE6', '/productos/133536.png', 19),
  ((select id from spconsultoriaweb.product_categories where key='videoporteros'), (select id from spconsultoriaweb.product_brands where name='EZVIZ'), '130845', '130845', 'Videoportero Smart CS-HP7-R101-1W2TFC', '/productos/130845.png', 20),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130986', '130986', 'Cámara IP domo varifocal 4MP DS-2CD3746G2T-IZSY 2.7 a 13.5 mm', '/productos/130986.png', 21),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129553', '129553', 'Cámara IP domo varifocal 4MP DS-2CD3748G2T-LIZSU', '/productos/129553.png', 22),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130988', '130988', 'Cámara ColorVu IP PT WiFi 4MP DS-2DE3A400BW-DE/W', '/productos/130988.png', 23),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129520', '129520', 'Cámara IP AcuSense bullet varifocal 2MP DS-2CD2623G2-IZS', '/productos/129520.png', 24),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '131286', '131286', 'Cámara AcuSense IP 4MP bullet varifocal color negro DS-2CD2646G2-IZS/BLACK', '/productos/131286.png', 25),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '132104', '132104', 'Cámara AcuSense IP 4MP bullet varifocal DS-2CD2646G2HT-IZS2U/SL (2.8-12 mm)', '/productos/132104.png', 26),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129114', '129114', 'Cámara AcuSense IP domo c/ mic 6MP DS-2CD2163G2-IU', '/productos/129114.png', 27),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '126536', '126536', 'Cámara AcuSense IP domo mini 2MP DS-2CD2523G2-I 2.8mm', '/productos/126536.png', 28),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '123616', '123616', 'Cámara AcuSense IP mini bullet 6MP DS-2CD2063G2-I', '/productos/123616.png', 29),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '130441', '130441', 'Cámara AcuSense IP tipo cubo 2MP DS-2CD2423G2-I', '/productos/130441.png', 30),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '125168', '125168', 'Cámara AcuSense IP domo 4MP DS-2CD1143G2-I', '/productos/125168.png', 31),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '126917', '126917', 'Cámara AcuSense IP domo 4MP DS-2CD1143G2-LIU', '/productos/126917.png', 32),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '125170', '125170', 'Cámara AcuSense IP bullet 4MP c/ mic/estrobo DS-2CD2T46G2-ISU/SL', '/productos/125170.png', 33),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124089', '124089', 'Cámara AcuSense IP bullet 4MP varifocal DS-2CD2643G2-IZS', '/productos/124089.png', 34),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124927', '124927', 'Cámara AcuSense IP turret 4MP c/ mic DS-2CD3346G2-ISU/SL', '/productos/124927.png', 35),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124031', '124031', 'Cámara IP bullet varifocal 4MP ANPR iDS-2CD7A46G0/P-IZHS', '/productos/124031.png', 36),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '133509', '133509', 'Cámara IP bullet 4MP DS-2XC3T46G0H-LISU(PA) (2.8mm)', '/productos/133509.png', 37),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '133506', '133506', 'Cámara IP bullet 4MP iDS-2CD7A46G2/P-IZHS (2.8-12mm)', '/productos/133506.png', 38),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), null, 'np-39', 'Cámara IP bullet 4MP iDS-2CD7A46G2/V-XZHSY (2.8-12mm)', null, 39),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), null, 'np-40', 'Cámara IP domo varifocal 2MP IPC-D620H-Z 2.8mm a 12mm', null, 40),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124482', '124482', 'Cámara IP bullet varifocal 4MP iDS-2CD7A46G0-IZHSY', '/productos/124482.png', 41),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129519', '129519', 'Cámara IP AcuSense bullet varifocal 6MP DS-2CD3666G2-IZS', '/productos/129519.png', 42),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129579', '129579', 'Cámara IP bullet varifocal luz híbrida 2MP DS-2CD1623G2-LIZU', '/productos/129579.png', 43),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), null, 'np-44', 'Cámara IP mobile mini bullet 2MP DS-2XM6222G1-ID', null, 44),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '125309', '125309', 'Cámara IP mobile mini domo 2MP DS-2XM6122G1-ID', '/productos/125309.png', 45),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129111', '129111', 'Cámara IP mini bullet DS-2CD2021G1-I (2.8mm)', '/productos/129111.png', 46),
  ((select id from spconsultoriaweb.product_categories where key='camarasIp'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129110', '129110', 'Cámara IP turret ColorVu 4MP DS-2CD1347G2-L', '/productos/129110.png', 47),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129455', '129455', 'Cámara Turbo ColorVu bullet 2MP DS-2CE10DF0T-PF (2.8mm)', '/productos/129455.png', 48),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129468', '129468', 'Cámara Turbo ColorVu domo 2MP DS-2CE70DF0T-PF (2.8mm)', '/productos/129468.png', 49),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129465', '129465', 'Cámara Turbo HD bullet 1MP 720P DS-2CE16C0T-IRPF', '/productos/129465.png', 50),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '129466', '129466', 'Cámara Turbo HD domo 1MP DS-2CE56C0T-IRPF', '/productos/129466.png', 51),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), '121712', '121712', 'Cámara Turbo HD bullet mini 1MP 720P THC-B110-P 2.8mm', '/productos/121712.png', 52),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), '120571', '120571', 'Cámara Turbo HD bullet mini 2MP 1080P THC-B120-PC 2.8mm', '/productos/120571.png', 53),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), '120572', '120572', 'Cámara Turbo HD bullet 1MP 720P EXIR 40 THC-B210 2.8mm', '/productos/120572.png', 54),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), '120567', '120567', 'Cámara Turbo HD bullet varifocal 1MP 720P THC-B310-VF 2.8mm a 12mm', '/productos/120567.png', 55),
  ((select id from spconsultoriaweb.product_categories where key='camarasHd'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), '120574', '120574', 'Cámara Turbo HD bullet varifocal 2MP 1080P THC-B320-VF 2.8mm a 12mm', '/productos/120574.png', 56),
  ((select id from spconsultoriaweb.product_categories where key='camarasPtz'), (select id from spconsultoriaweb.product_brands where name='HILOOK'), '121728', '121728', 'Cámara IP mini PanoVu + PTZ 2MP 4X PTZ-P332ZI-DE3', '/productos/121728.png', 57),
  ((select id from spconsultoriaweb.product_categories where key='camarasPtz'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '122236', '122236', 'Cámara IP mini PanoVu DS-2PT3326IZ-DE3', '/productos/122236.png', 58),
  ((select id from spconsultoriaweb.product_categories where key='camarasPtz'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124660', '124660', 'Cámara IP mini PanoVu + PTZ DS-2PT5326IZ-DE c/ acc', '/productos/124660.png', 59),
  ((select id from spconsultoriaweb.product_categories where key='camarasPtz'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '134828', '134828', 'Cámara IP fisheye 12MP IR antivandálica c/ mic DS-2CD63C5G1-IVSUHK', '/productos/134828.png', 60),
  ((select id from spconsultoriaweb.product_categories where key='camarasPtz'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '133812', '133812', 'Cámara IP fisheye 6MP c/ mic y parlante, mapa de calor DS-2CD6365G1-IVS (1.16mm) (O-STD)', '/productos/133812.png', 61),
  ((select id from spconsultoriaweb.product_categories where key='camarasPtz'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124658', '124658', 'Cámara IP PTZ 2MP 25X DS-2DF6A225X-AEL c/ acc', '/productos/124658.png', 62),
  ((select id from spconsultoriaweb.product_categories where key='acceso'), (select id from spconsultoriaweb.product_brands where name='EZVIZ'), '132597', '132597', 'Tag de proximidad CS-DL-IC-CPU-R200-GR', '/productos/132597.png', 63),
  ((select id from spconsultoriaweb.product_categories where key='acceso'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '134447', '134447', 'Arco detector de metales 18 zonas ISD-SMG318L', '/productos/134447.png', 64),
  ((select id from spconsultoriaweb.product_categories where key='acceso'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '133519', '133519', 'Barrera batiente inteligente QR/tarjeta/reconocimiento facial parte medio DS-K3B631TX-M/DPiQL', '/productos/133519.png', 65),
  ((select id from spconsultoriaweb.product_categories where key='alarmas'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '121306', '121306', 'Alarma cableada detector de humo DS-PDSMK-4BAR', '/productos/121306.png', 66),
  ((select id from spconsultoriaweb.product_categories where key='alarmas'), (select id from spconsultoriaweb.product_brands where name='SONOFF'), '127794', '127794', 'Sensor de temperatura y humedad c/ pantalla Zigbee SNZB-02D', '/productos/127794.png', 67),
  ((select id from spconsultoriaweb.product_categories where key='alarmas'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '124336', '124336', 'Alarma cableada teclado DS-PK1-LRT-HWB', '/productos/124336.png', 68),
  ((select id from spconsultoriaweb.product_categories where key='alarmas'), (select id from spconsultoriaweb.product_brands where name='SASSIN'), '110116', '110116', 'Sirena S3 230V 115 dB', '/productos/110116.png', 69),
  ((select id from spconsultoriaweb.product_categories where key='redes'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '136615', '136615', 'DVR AcuSense 16 canales 5MP alarma 16/4 iDS-7216HUHI-M2/XT(STD)/4A+16/4A LM', '/productos/136615.png', 70),
  ((select id from spconsultoriaweb.product_categories where key='redes'), (select id from spconsultoriaweb.product_brands where name='HIKVISION'), '131451', '131451', 'Switch de red 24 puertos Giga Smart DS-3E1524-EI', '/productos/131451.png', 71)
;

-- ---- Costos del proveedor (PRIVADO) ----
insert into spconsultoriaweb.product_costs (product_id, supplier_name, supplier_cost, currency, source_document)
select p.id, 'Electropar', c.cost, 'PYG', 'Cotización Electropar N° 1164279'
from (values
  ('117808', 250000),
  ('117809', 180000),
  ('117167', 50001),
  ('117171', 200000),
  ('117815', 80000),
  ('117814', 80000),
  ('117170', 1100000),
  ('133537', 628594),
  ('124929', 655499),
  ('124928', 1088562),
  ('130173', 292623),
  ('124330', 1256378),
  ('124329', 1036561),
  ('130169', 330399),
  ('130170', 427897),
  ('130166', 468223),
  ('129543', 3502349),
  ('124328', 521569),
  ('133536', 4652042),
  ('130845', 804069),
  ('130986', 1988921),
  ('129553', 2452793),
  ('130988', 1114238),
  ('129520', 1111240),
  ('131286', 1648991),
  ('132104', 1815903),
  ('129114', 850826),
  ('126536', 676720),
  ('123616', 744125),
  ('130441', 554849),
  ('125168', 400574),
  ('126917', 354321),
  ('125170', 1037626),
  ('124089', 1204959),
  ('124927', 1046367),
  ('124031', 3996642),
  ('133509', 2217828),
  ('133506', 4335945),
  ('np-39', 3581881),
  ('np-40', 530276),
  ('124482', 3857151),
  ('129519', 4199147),
  ('129579', 539871),
  ('np-44', 1035421),
  ('125309', 1035421),
  ('129111', 421191),
  ('129110', 411112),
  ('129455', 127206),
  ('129468', 118581),
  ('129465', 70184),
  ('129466', 61326),
  ('121712', 57602),
  ('120571', 63647),
  ('120572', 141892),
  ('120567', 197718),
  ('120574', 187806),
  ('121728', 4935457),
  ('122236', 2964145),
  ('124660', 4950373),
  ('134828', 4675282),
  ('133812', 3204831),
  ('124658', 6022299),
  ('132597', 39804),
  ('134447', 13957848),
  ('133519', 33834527),
  ('121306', 90182),
  ('127794', 78104),
  ('124336', 272826),
  ('110116', 121831),
  ('136615', 2412944),
  ('131451', 591755)
) as c(slug, cost)
join spconsultoriaweb.products p on p.slug = c.slug;

-- ---- Secciones de contenido estructurado ----
insert into spconsultoriaweb.content_sections (section_key, sort_order, content_es, content_en) values
('hero', 1,
 '{"eyebrow":"Estrategia bajo control","line1":"Análisis riguroso.","line2":"Gestión preventiva.","line3":"Confidencialidad absoluta.","sub":"SP Consultoría, Estrategia y Seguridad es una firma especializada en análisis estratégico, gestión de riesgos y seguridad integral para organizaciones públicas y privadas en Paraguay.","cta1":"Solicitar evaluación","cta2":"Conocer servicios"}'::jsonb,
 '{"eyebrow":"Strategy under control","line1":"Rigorous analysis.","line2":"Preventive management.","line3":"Absolute confidentiality.","sub":"SP Consultoría, Estrategia y Seguridad is a firm specialized in strategic analysis, risk management and integral security for public and private organizations in Paraguay.","cta1":"Request an assessment","cta2":"Explore services"}'::jsonb),
('about', 2,
 '{"h1":"Decisiones informadas.","h2":"Riesgos bajo control.","paras":["SP Consultoría, Estrategia y Seguridad es una firma especializada en análisis estratégico, gestión de riesgos y seguridad integral, orientada al entorno organizacional público y privado en Paraguay.","Nos enfocamos en la evaluación y el análisis sistemático de riesgos, el desarrollo de soluciones estratégicas y la implementación de medidas de seguridad orientadas a la toma de decisiones informadas y a la continuidad operativa."],"quote":"Operamos bajo criterios de confidencialidad, rigor técnico y enfoque preventivo, alineando nuestros servicios a estándares profesionales de consultoría y gestión de riesgos."}'::jsonb,
 '{"h1":"Informed decisions.","h2":"Risks under control.","paras":["SP Consultoría, Estrategia y Seguridad is a firm specialized in strategic analysis, risk management and integral security, focused on public and private organizational environments in Paraguay.","We focus on the systematic assessment and analysis of risks, the development of strategic solutions and the implementation of security measures aimed at informed decision-making and operational continuity."],"quote":"We operate under criteria of confidentiality, technical rigor and a preventive approach, aligning our services with professional standards of consulting and risk management."}'::jsonb),
('mission_vision', 3,
 '{"mission":{"kicker":"Misión","text":"Brindar servicios profesionales de consultoría, análisis estratégico y seguridad integral, orientados a la identificación, evaluación y gestión de riesgos en organizaciones públicas y privadas, contribuyendo a la toma de decisiones informadas, la optimización de procesos y la protección de sus recursos humanos, materiales e informacionales, bajo estándares de calidad, confidencialidad y excelencia operativa."},"vision":{"kicker":"Visión","text":"Consolidarnos como una empresa referente en consultoría estratégica, análisis de riesgos y seguridad integral a nivel nacional y regional, reconocida por su profesionalismo, capacidad técnica, innovación metodológica y confianza institucional, contribuyendo al desarrollo sostenible de las organizaciones a las que presta servicio."}}'::jsonb,
 '{"mission":{"kicker":"Mission","text":"To provide professional consulting, strategic analysis and integral security services aimed at the identification, assessment and management of risks in public and private organizations, contributing to informed decision-making, process optimization and the protection of their human, material and informational resources, under standards of quality, confidentiality and operational excellence."},"vision":{"kicker":"Vision","text":"To establish ourselves as a leading company in strategic consulting, risk analysis and integral security at the national and regional level, recognized for our professionalism, technical capability, methodological innovation and institutional trust, contributing to the sustainable development of the organizations we serve."}}'::jsonb),
('services_header', 4,
 '{"eyebrow":"Servicios","title1":"Cinco líneas de trabajo,","title2":"un mismo estándar.","sub":"Pueden contratarse por separado o integrarse en un programa único de gestión de riesgos."}'::jsonb,
 '{"eyebrow":"Services","title1":"Five lines of work,","title2":"one single standard.","sub":"They can be contracted separately or integrated into a single risk management program."}'::jsonb),
('products_header', 5,
 '{"eyebrow":"Productos","title1":"Equipamiento de","title2":"seguridad electrónica.","sub":"Comercializamos e instalamos soluciones de las marcas líderes del mercado — Hikvision, Hilook, EZVIZ, Commax y más. Consultanos por disponibilidad, asesoramiento e instalación.","note":"Precios de referencia en guaraníes (Gs.), IVA incluido. Sujetos a cambio sin previo aviso.","quote":"Consultar","all":"Todos","currency":"Gs.","waPrefix":"Hola, me interesa este producto:"}'::jsonb,
 '{"eyebrow":"Products","title1":"Electronic security","title2":"equipment.","sub":"We supply and install solutions from the market''s leading brands — Hikvision, Hilook, EZVIZ, Commax and more. Contact us for availability, advice and installation.","note":"Reference prices in guaraníes (Gs.), VAT included. Subject to change without notice.","quote":"Ask","all":"All","currency":"Gs.","waPrefix":"Hi, I''m interested in this product:"}'::jsonb),
('methodology_header', 6,
 '{"eyebrow":"Metodología de trabajo","title":"¿Cómo trabajamos?","text":"Nuestros servicios se desarrollan tomando como referencia estándares y buenas prácticas internacionales, adaptándolos a las necesidades y características de cada organización.","caption":"Confianza, método y confidencialidad","badge":"Estándares de referencia"}'::jsonb,
 '{"eyebrow":"Methodology","title":"How do we work?","text":"Our services are developed using international standards and best practices as a reference, adapting them to the needs and characteristics of each organization.","caption":"Trust, method and confidentiality","badge":"Reference standards"}'::jsonb),
('differentiators_header', 7,
 '{"eyebrow":"Por qué elegirnos","title":"Nuestros diferenciales"}'::jsonb,
 '{"eyebrow":"Why choose us","title":"What sets us apart"}'::jsonb),
('process_header', 8,
 '{"eyebrow":"Proceso de trabajo","title":"Un proceso estructurado."}'::jsonb,
 '{"eyebrow":"Our process","title":"A structured process."}'::jsonb),
('contact_cta', 9,
 '{"eyebrow":"Contacto","h":"Una decisión estratégica comienza con una evaluación correcta.","sub":"Conversemos sobre las necesidades de su organización.","button":"Contactar por WhatsApp","note":"Respondemos normalmente el mismo día."}'::jsonb,
 '{"eyebrow":"Contact","h":"A strategic decision begins with a proper assessment.","sub":"Let''s talk about your organization''s needs.","button":"Contact us on WhatsApp","note":"We usually reply the same day."}'::jsonb),
('ui_labels', 10,
 '{"aboutEyebrow":"Quiénes somos","purposeEyebrow":"Nuestro propósito","valuesEyebrow":"Nuestros valores","valuesTitle":"Lo que sostiene cada trabajo.","methodCaption":"Confianza, método y confidencialidad","phase":"Fase","contactPhone":"Teléfono","contactEmail":"Correo","contactLocation":"Ubicación","brandTagline":"Consultoría, Estrategia y Seguridad","headerCta":"Solicitar consultoría","footerNav":"Navegación","footerContact":"Contacto","developedBy":"Desarrollado por","privacy":"Política de Privacidad"}'::jsonb,
 '{"aboutEyebrow":"About us","purposeEyebrow":"Our purpose","valuesEyebrow":"Our values","valuesTitle":"What underpins every engagement.","methodCaption":"Trust, method and confidentiality","phase":"Phase","contactPhone":"Phone","contactEmail":"Email","contactLocation":"Location","brandTagline":"Consulting, Strategy and Security","headerCta":"Request consulting","footerNav":"Navigation","footerContact":"Contact","developedBy":"Developed by","privacy":"Privacy Policy"}'::jsonb)
on conflict (section_key) do nothing;

-- ---- Página de privacidad (la web pública sigue usando su componente como respaldo) ----
insert into spconsultoriaweb.pages (slug, title_es, title_en, content_es, content_en, published) values
  ('politica-de-privacidad','Política de Privacidad','Privacy Policy',
   'El contenido de la política de privacidad se administra desde el panel. (Migrar aquí el texto actual.)',
   'The privacy policy content is managed from the admin panel. (Migrate the current text here.)',
   false)
on conflict (slug) do nothing;

commit;

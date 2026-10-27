# Configuración de Supabase — Panel Admin SP Consultoría

El panel administrador usa **Supabase** (Auth + PostgreSQL + Storage) directamente
desde el frontend. La web sigue siendo **estática** (`output: export`): no hay
backend propio.

Todas las tablas de negocio viven en el schema **`spconsultoriaweb`**
(separado del schema `spconsultoria`, que ya usa otro sistema).

---

## 1. Ejecutar la migración

Archivo: `supabase/migrations/001_spconsultoriaweb.sql`

Opción A — SQL Editor de Supabase: pegar el contenido y ejecutar.

Opción B — psql:
```bash
psql "postgresql://postgres:<PASSWORD>@<HOST>:<PORT>/postgres" \
  -f supabase/migrations/001_spconsultoriaweb.sql
```

> Esta migración crea el schema, 17 tablas, triggers de `updated_at`, funciones
> de seguridad (`is_admin`, `is_superadmin`), RLS + políticas, permisos, y carga
> todo el contenido actual del sitio (navegación, hero, servicios, productos, etc.).
> Los precios del presupuesto se cargan como **costo del proveedor**
> (`product_costs`, privado), nunca como precio de venta.

## 2. Exponer el schema en la Data API

Para que el frontend pueda leer/escribir las tablas, hay que exponer el schema
`spconsultoriaweb`:

- **Supabase Cloud:** Dashboard → Project Settings → API → *Exposed schemas* →
  agregar `spconsultoriaweb` (dejar también `public` y `storage`).
- **Self-hosted:** en la config de PostgREST:
  ```
  PGRST_DB_SCHEMAS="public,storage,spconsultoriaweb"
  ```
  (reiniciar el servicio de la API después).

## 3. Crear el primer usuario administrador

1. Supabase → **Authentication → Users → Add user** → email + contraseña.
   (No habilitar signup público.)
2. Copiar el **UUID** de ese usuario (columna `id` / `User UID`).
3. Insertarlo en `spconsultoriaweb.admin_users`:

```sql
insert into spconsultoriaweb.admin_users (user_id, email, full_name, role, active)
values ('<AUTH_USER_UUID>', '<EMAIL>', '<NOMBRE>', 'superadmin', true);
```

> Reemplazar `<AUTH_USER_UUID>`, `<EMAIL>` y `<NOMBRE>`. El rol `superadmin`
> puede administrar otros administradores; `editor` no.

## 4. Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=https://api.neura.com.py
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
```

> La **anon key** es pública (va en el navegador). **Nunca** poner la
> service_role key ni la contraseña de la base.

Para que el build en la nube (GitHub Actions) genere la web con estas variables,
cargarlas también como *Secrets* del repo (Settings → Secrets and variables →
Actions) y pasarlas al paso de build. *(Pendiente de configurar en el workflow.)*

## 5. Crear el bucket de Storage

Supabase → **Storage → New bucket**:

- Nombre: `spconsultoriaweb-media`
- **Public bucket:** sí (las imágenes de productos se muestran públicamente).

Carpetas sugeridas: `products/`, `content/`, `brand/`, `media/`.

### 5b. Permisos del bucket (para que el admin pueda subir/borrar)

El bucket es **público** (lectura abierta), pero subir y borrar requiere estar
autenticado. Ejecutar una sola vez en el SQL Editor:

```sql
-- Subir / actualizar / borrar archivos: solo usuarios autenticados (admins logueados).
create policy "spconsultoriaweb media insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'spconsultoriaweb-media');

create policy "spconsultoriaweb media update"
  on storage.objects for update to authenticated
  using (bucket_id = 'spconsultoriaweb-media');

create policy "spconsultoriaweb media delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'spconsultoriaweb-media');
```

> La lectura pública ya la cubre el bucket público; no hace falta política de `select`.
> Si el bucket **no** fuera público, agregar además una policy de `select` para `anon`.

## 6. Correr el proyecto

```bash
npm install
npm run dev     # desarrollo
npm run build   # genera /out y /dist (estático)
```

El admin queda en `/admin/login`.

---

## Notas de seguridad

- `spconsultoriaweb.product_costs` (costo del proveedor) **no es accesible por
  `anon`** — está protegido por RLS y permisos. La web pública nunca lo consulta.
- La web pública usa `src/lib/content.ts` como **respaldo**: si Supabase no está
  configurado o falla, el sitio sigue mostrando el contenido actual.

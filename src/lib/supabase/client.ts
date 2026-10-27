// Cliente de Supabase para el navegador (la web es estática: output: export).
// Lee las credenciales PÚBLICAS desde variables de entorno NEXT_PUBLIC_*.
// Nunca pongas acá la service_role key ni la contraseña de la base.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_SCHEMA = "spconsultoriaweb";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true si las variables de entorno están configuradas. */
export const supabaseEnabled = Boolean(url && anonKey);

/**
 * Cliente de Supabase. Es `null` si faltan las variables de entorno,
 * para que la web pública pueda caer en el contenido de respaldo (content.ts)
 * sin romperse.
 */
export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Acceso al schema de negocio (spconsultoriaweb). Lanza si no está configurado. */
export function db() {
  if (!supabase) {
    throw new Error(
      "Supabase no está configurado. Definí NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return supabase.schema(SUPABASE_SCHEMA);
}

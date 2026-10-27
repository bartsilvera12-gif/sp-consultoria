// Helpers de autenticación del admin (Supabase Auth + verificación en admin_users).
import { supabase, db } from "./client";
import type { AdminUser } from "./types";

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function getSessionUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Devuelve el admin activo asociado al user_id, o null si no es admin / inactivo. */
export async function getActiveAdmin(userId: string): Promise<AdminUser | null> {
  const { data, error } = await db()
    .from("admin_users")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    // p.ej. schema aún no expuesto en la Data API
    console.error("getActiveAdmin:", error.message);
    return null;
  }
  return (data as AdminUser) ?? null;
}

/** Registra una acción del admin en audit_logs (no corta si falla). */
export async function logAudit(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    await db().from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata,
    });
  } catch (e) {
    console.error("logAudit:", e);
  }
}

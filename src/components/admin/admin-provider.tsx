"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getActiveAdmin, signOut as doSignOut } from "@/lib/supabase/auth";
import type { AdminUser } from "@/lib/supabase/types";

type Status = "loading" | "unauth" | "notadmin" | "ready";

type Ctx = {
  status: Status;
  admin: AdminUser | null;
  userId: string | null;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<Ctx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const evaluate = useCallback(async () => {
    if (!supabase) {
      setStatus("unauth");
      return;
    }
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id ?? null;
    setUserId(uid);
    if (!uid) {
      setAdmin(null);
      setStatus("unauth");
      return;
    }
    const a = await getActiveAdmin(uid);
    if (!a) {
      setAdmin(null);
      setStatus("notadmin");
      return;
    }
    setAdmin(a);
    setStatus("ready");
  }, []);

  useEffect(() => {
    evaluate();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      evaluate();
    });
    return () => sub.subscription.unsubscribe();
  }, [evaluate]);

  const signOut = useCallback(async () => {
    await doSignOut();
    setAdmin(null);
    setUserId(null);
    setStatus("unauth");
  }, []);

  return (
    <AdminAuthContext.Provider value={{ status, admin, userId, signOut, refresh: evaluate }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth debe usarse dentro de <AdminAuthProvider>");
  return ctx;
}

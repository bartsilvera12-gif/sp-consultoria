"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/admin-provider";
import { AdminShell } from "@/components/admin/admin-shell";

function FullscreenLoader({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f5f9]">
      <div className="flex flex-col items-center gap-3 text-[var(--navy)]">
        <span className="size-7 animate-spin rounded-full border-2 border-[var(--navy)]/20 border-t-[var(--navy)]" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function Guarded({ children }: { children: React.ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauth" || status === "notadmin") router.replace("/admin/login");
  }, [status, router]);

  if (status === "ready") return <AdminShell>{children}</AdminShell>;
  return <FullscreenLoader label={status === "notadmin" ? "Verificando permisos…" : "Cargando…"} />;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // El login no lleva guardia (si no, bucle infinito).
  // Normalizamos la barra final porque trailingSlash:true sirve "/admin/login/".
  if (pathname?.replace(/\/+$/, "") === "/admin/login") return <>{children}</>;

  return (
    <AdminAuthProvider>
      <Guarded>{children}</Guarded>
    </AdminAuthProvider>
  );
}

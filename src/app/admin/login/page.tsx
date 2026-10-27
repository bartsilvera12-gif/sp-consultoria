"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { signIn, signOut, getActiveAdmin } from "@/lib/supabase/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión válida de admin, saltar al panel.
  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id;
      if (uid && (await getActiveAdmin(uid))) router.replace("/admin");
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn(email.trim(), password);
      const uid = res.user?.id;
      const admin = uid ? await getActiveAdmin(uid) : null;
      if (!admin) {
        await signOut();
        setError("Tu cuenta no está autorizada como administrador.");
        return;
      }
      router.replace("/admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/Invalid login credentials/i.test(msg)) setError("Email o contraseña incorrectos.");
      else if (/Email not confirmed/i.test(msg)) setError("El email no está confirmado.");
      else if (/not configured|no está configurado/i.test(msg)) setError("La conexión a Supabase no está configurada.");
      else setError("No se pudo iniciar sesión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca (izquierda) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--navy)] p-10 text-white lg:flex [background-image:linear-gradient(135deg,#1b263b_0%,#0d1b2a_100%)]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[radial-gradient(circle,rgba(119,141,169,0.25),transparent_65%)]" />
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10 font-bold">SP</span>
          <span className="text-sm font-semibold tracking-tight">SP Consultoría, Estrategia y Seguridad</span>
        </div>
        <div className="relative">
          <h1 className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight">Panel Administrativo</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Gestioná el contenido del sitio, los productos y la configuración desde un solo lugar.
          </p>
        </div>
        <p className="relative text-[11px] text-white/40">Acceso restringido · solo personal autorizado</p>
      </div>

      {/* Formulario (derecha) */}
      <div className="flex items-center justify-center bg-[#f3f5f9] px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--navy)] text-sm font-bold text-white">SP</span>
              <span className="text-sm font-semibold text-[var(--navy)]">Panel Administrativo</span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--navy)]">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ingresá con tu cuenta de administrador.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[var(--navy)]">Correo</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--navy-2)] focus:ring-2 focus:ring-[var(--navy-2)]/20"
                  placeholder="admin@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-[var(--navy)]">Contraseña</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-[var(--navy-2)] focus:ring-2 focus:ring-[var(--navy-2)]/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-black/5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
                      {showPw ? (
                        <>
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.4 5.2A9 9 0 0 1 21 12a9.3 9.3 0 0 1-3.2 3.9M6.1 6.1A9.3 9.3 0 0 0 3 12a9 9 0 0 0 11.6 5.3" />
                        </>
                      ) : (
                        <>
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy-2)] disabled:opacity-60"
              >
                {loading && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {loading ? "Ingresando…" : "Iniciar sesión"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            ¿Problemas para ingresar? Contactá al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

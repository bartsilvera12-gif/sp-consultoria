import Image from "next/image";
import { nav, contact } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-[var(--navy)] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto grid max-w-[74rem] gap-12 md:grid-cols-[1.5fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-emblem.png" alt="SP" width={82} height={44} className="h-11 w-auto" />
            <span className="text-xl font-bold tracking-wide">SP</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Consultoría, estrategia y seguridad para organizaciones públicas y privadas.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] tracking-wide text-white/55">
            <span>Análisis Estratégico</span>
            <span>·</span>
            <span>Gestión de Riesgos</span>
            <span>·</span>
            <span>Seguridad Integral</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Navegación</p>
          <div className="mt-5 flex flex-col gap-3">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-white/80 transition-colors hover:text-white">
                {n.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Contacto</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/80">
            <a href={`tel:${contact.phoneRaw}`} className="transition-colors hover:text-white">{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="transition-colors hover:text-white">{contact.email}</a>
            <span className="text-white/60">{contact.place}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[74rem] flex-col gap-3 border-t border-white/12 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} SP Consultoría, Estrategia y Seguridad.</span>
        <span>
          Desarrollado por{" "}
          <a href="https://neura.com.py" target="_blank" rel="noopener" className="font-semibold text-white/85 transition-colors hover:text-white">
            Neura
          </a>
        </span>
      </div>
    </footer>
  );
}

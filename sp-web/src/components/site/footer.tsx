import Image from "next/image";
import { nav, contact } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#070f22]/70 px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-[76rem] gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-emblem.png" alt="SP" width={78} height={42} className="h-11 w-auto" />
            <span className="text-xl font-bold tracking-wide">SP</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Consultoría, estrategia y seguridad para organizaciones públicas y privadas.
          </p>
          <div className="mt-5 flex flex-col gap-1.5 text-[13px] tracking-wide text-muted-foreground/80">
            <span>Análisis Estratégico</span>
            <span>Gestión de Riesgos</span>
            <span>Seguridad Integral</span>
          </div>
        </div>

        <div>
          <p className="eyebrow">Navegación</p>
          <div className="mt-5 flex flex-col gap-3">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                {n.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">Contacto</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-foreground/80">
            <a href={`tel:${contact.phoneRaw}`} className="transition-colors hover:text-foreground">
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="transition-colors hover:text-foreground">
              {contact.email}
            </a>
            <span className="text-muted-foreground">{contact.place}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[76rem] flex-col gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} SP Consultoría, Estrategia y Seguridad.</span>
        <span>
          Desarrollado por{" "}
          <a href="https://neura.com.py" target="_blank" rel="noopener" className="font-semibold text-[var(--silver)] transition-colors hover:text-white">
            Neura
          </a>
        </span>
      </div>
    </footer>
  );
}

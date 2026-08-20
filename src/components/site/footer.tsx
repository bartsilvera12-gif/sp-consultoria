"use client";

import Image from "next/image";
import { contact } from "@/lib/content";
import { useT } from "@/lib/i18n";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.66a5.7 5.7 0 0 0-.78-.05 5.69 5.69 0 1 0 5.69 5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.25-1.48z" />
    </svg>
  );
}

export function Footer() {
  const { nav, feature, ui } = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto bg-[#0a1424] px-5 py-16 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#778da9]/55 to-transparent" />
      <div className="mx-auto grid max-w-[74rem] gap-12 md:grid-cols-[1.5fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-emblem.png" alt="SP" width={82} height={44} className="h-11 w-auto" />
            <span className="text-xl font-bold tracking-wide">SP</span>
          </div>
          <p className="mt-4 text-sm font-medium leading-relaxed text-white/80">
            {ui.brandTagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] tracking-wide text-white/55">
            {feature.pillars.map((p, i) => (
              <span key={p} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden>·</span>}
                {p}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener"
              aria-label="Instagram de SP Consultoría"
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={contact.tiktok}
              target="_blank"
              rel="noopener"
              aria-label="TikTok de SP Consultoría"
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <TikTokIcon className="size-[18px]" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{ui.footerNav}</p>
          <div className="mt-5 flex flex-col gap-3">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-white/80 transition-colors hover:text-white">
                {n.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{ui.footerContact}</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/80">
            <a href={`tel:${contact.phoneRaw}`} className="transition-colors hover:text-white">{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="transition-colors hover:text-white">{contact.email}</a>
            <span className="text-white/60">{contact.place}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[74rem] flex-col gap-3 border-t border-white/12 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>© {year} SP Consultoría, Estrategia y Seguridad.</span>
          <a href="/politica-de-privacidad/" className="text-white/55 transition-colors hover:text-white/90">
            {ui.privacy}
          </a>
        </span>
        <span>
          {ui.developedBy}{" "}
          <a href="https://neura.com.py" target="_blank" rel="noopener" className="font-semibold text-white/85 transition-colors hover:text-white">
            Neura
          </a>
        </span>
      </div>
    </footer>
  );
}

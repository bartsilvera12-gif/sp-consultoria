"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { ProductCatalog } from "@/components/site/product-catalog";
import { contact } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export default function ProductsPage() {
  const { lang, setLang } = useLang();

  const copy =
    lang === "es"
      ? {
          back: "Volver al inicio",
          eyebrow: "Equipamiento profesional",
          title: "Productos para seguridad, control y monitoreo.",
          subtitle:
            "Seleccionamos soluciones profesionales para videovigilancia, videoporteros, alarmas, control de acceso y redes. Consultá precio y disponibilidad directamente con nuestro equipo.",
          whatsapp: "Hablar con un asesor",
          badge: "Cotización personalizada",
        }
      : {
          back: "Back to home",
          eyebrow: "Professional equipment",
          title: "Products for security, control and monitoring.",
          subtitle:
            "Professional solutions for video surveillance, video intercoms, alarms, access control and networking. Ask our team directly about price and availability.",
          whatsapp: "Talk to an advisor",
          badge: "Personalized quote",
        };

  return (
    <main className="min-h-screen bg-[var(--muted)]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-5 px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/logo-emblem.png"
              alt="SP Consultoría, Estrategia y Seguridad"
              width={78}
              height={42}
              className="h-10 w-auto"
              priority
            />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-lg font-bold tracking-wide text-navy">SP</span>
              <span className="mt-1 text-[10px] font-semibold text-muted-foreground">
                Consultoría, Estrategia y Seguridad
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-navy">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={lang === "es" ? "opacity-100" : "opacity-40 hover:opacity-80"}
              >
                ES
              </button>
              <span className="opacity-30">|</span>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={lang === "en" ? "opacity-100" : "opacity-40 hover:opacity-80"}
              >
                EN
              </button>
            </div>
            <a
              href={contact.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full bg-[var(--navy)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--navy-2)] sm:inline-flex"
            >
              <MessageCircle className="size-4" />
              {copy.whatsapp}
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[var(--navy)] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute -right-36 -top-44 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(119,141,169,0.32),transparent_68%)]" />
        <div className="pointer-events-none absolute -bottom-52 -left-36 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(65,90,119,0.35),transparent_68%)]" />
        <div className="relative mx-auto max-w-[74rem]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {copy.back}
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-white/85">
              <ShieldCheck className="size-4" />
              {copy.badge}
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--silver)]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[16ch] text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {copy.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[74rem]">
          <ProductCatalog />
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { nav, contact } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-black/5 bg-white/90 py-3 text-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "border-b border-transparent py-5 text-white",
      )}
    >
      <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <Image
            src="/brand/logo-emblem.png"
            alt="SP Consultoría, Estrategia y Seguridad"
            width={78}
            height={42}
            className={cn("h-10 w-auto transition", !solid && "brightness-0 invert")}
            priority
          />
          <span className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-wide">SP</span>
            <span className={cn("hidden h-5 w-px sm:block", solid ? "bg-black/15" : "bg-white/30")} />
            <span
              className={cn(
                "hidden max-w-[11rem] text-[9px] font-semibold leading-tight tracking-[0.22em] sm:block",
                solid ? "text-muted-foreground" : "text-white/70",
              )}
            >
              CONSULTORÍA, ESTRATEGIA Y SEGURIDAD
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative text-[13px] font-medium opacity-90 transition-opacity hover:opacity-100"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={contact.wa}
            target="_blank"
            rel="noopener"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden h-9 rounded-full px-5 font-semibold sm:inline-flex",
              !solid && "bg-white text-navy hover:bg-white/90",
            )}
          >
            Solicitar consultoría
          </a>
          <button
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-md lg:hidden"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--navy)] px-6 py-6 text-white lg:hidden">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold tracking-wide">SP</span>
            <button aria-label="Cerrar menú" onClick={() => setOpen(false)} className="size-10">
              <X className="size-7" />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-1">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 text-2xl font-semibold tracking-tight"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href={contact.wa}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), "mt-8 h-12 rounded-full bg-white font-semibold text-navy hover:bg-white/90")}
          >
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}

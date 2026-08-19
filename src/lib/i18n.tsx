"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { dict, type Lang } from "@/lib/content";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  // Recupera el idioma guardado (después de la hidratación para evitar mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "es" || saved === "en") setLangState(saved);
      else if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) setLangState("en");
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <LanguageProvider>");
  return ctx;
}

export function useT() {
  const { lang } = useLang();
  return dict[lang];
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spconsultoria.com.py"),
  title: "SP Consultoría, Estrategia y Seguridad",
  description:
    "Firma especializada en análisis estratégico, gestión de riesgos y seguridad integral para organizaciones públicas y privadas.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SP Consultoría, Estrategia y Seguridad",
    description:
      "Análisis estratégico, gestión de riesgos y seguridad integral.",
    type: "website",
    locale: "es_PY",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip">{children}</body>
    </html>
  );
}

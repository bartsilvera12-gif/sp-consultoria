import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

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
  metadataBase: new URL("https://spconsultoriaestrategiayseguridad.com"),
  title: "SP Consultoría, Estrategia y Seguridad",
  description:
    "Firma especializada en análisis estratégico, gestión de riesgos y seguridad integral para organizaciones públicas y privadas.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SP Consultoría, Estrategia y Seguridad",
    description:
      "Análisis estratégico, gestión de riesgos y seguridad integral.",
    url: "https://spconsultoriaestrategiayseguridad.com",
    siteName: "SP Consultoría, Estrategia y Seguridad",
    type: "website",
    locale: "es_PY",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "SP Consultoría, Estrategia y Seguridad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SP Consultoría, Estrategia y Seguridad",
    description:
      "Análisis estratégico, gestión de riesgos y seguridad integral.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-white">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

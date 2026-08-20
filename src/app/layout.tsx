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

const SITE_URL = "https://spconsultoriaestrategiayseguridad.com";
const DESCRIPTION =
  "SP: consultoría de seguridad, gestión de riesgos y seguridad corporativa empresarial en Paraguay. Análisis estratégico y seguridad integral para organizaciones públicas y privadas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Consultoría de Seguridad y Gestión de Riesgos en Paraguay | SP",
    template: "%s | SP Consultoría, Estrategia y Seguridad",
  },
  description: DESCRIPTION,
  applicationName: "SP Consultoría, Estrategia y Seguridad",
  authors: [{ name: "SP Consultoría, Estrategia y Seguridad" }],
  creator: "SP Consultoría, Estrategia y Seguridad",
  publisher: "SP Consultoría, Estrategia y Seguridad",
  category: "Consultoría de seguridad",
  keywords: [
    "consultoría de seguridad Paraguay",
    "gestión de riesgos Paraguay",
    "seguridad corporativa Paraguay",
    "consultoría de seguridad empresarial Paraguay",
    "seguridad integral Paraguay",
    "análisis estratégico",
    "consultoría estratégica",
    "SP Consultoría Estrategia y Seguridad",
    "seguridad institucional",
    "Lambaré",
    "Paraguay",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SP Consultoría, Estrategia y Seguridad — Paraguay",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "SP Consultoría, Estrategia y Seguridad",
    type: "website",
    locale: "es_PY",
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "SP Consultoría, Estrategia y Seguridad — Paraguay" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SP Consultoría, Estrategia y Seguridad — Paraguay",
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
};

// Datos estructurados (JSON-LD) para SEO local — negocio de servicios profesionales
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#business`,
  name: "SP Consultoría, Estrategia y Seguridad",
  alternateName: "SP Consultoría",
  description: DESCRIPTION,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/og.jpg`,
  email: "spconsultoriayseguridad@gmail.com",
  telephone: "+595984868243",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Manuel Gondra 1118",
    addressLocality: "Lambaré",
    addressRegion: "Central",
    addressCountry: "PY",
  },
  areaServed: { "@type": "Country", name: "Paraguay" },
  knowsAbout: [
    "Consultoría de seguridad",
    "Gestión de riesgos",
    "Seguridad corporativa",
    "Consultoría de seguridad empresarial",
    "Análisis estratégico",
    "Seguridad integral",
    "Inteligencia corporativa",
  ],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Consultorías estratégicas" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Análisis de riesgos" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Seguridad integral" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Capacitación" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Inteligencia corporativa" } },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

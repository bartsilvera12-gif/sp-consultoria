import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = "https://spconsultoriaestrategiayseguridad.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/politica-de-privacidad/`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

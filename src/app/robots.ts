import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = "https://spconsultoriaestrategiayseguridad.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

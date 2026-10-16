import type { MetadataRoute } from "next";
import { pfade } from "@/lib/content/pfade";
import { siteUrl } from "@/lib/deploy-ziel";

export const dynamic = "force-static";

/** Sitemap aller Seiten. In der Demo (ohne INDEXIERUNG=1) löscht scripts/export-nachbereiten.mjs die Datei wieder. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [pfade.start, pfade.speisekarte, pfade.restaurant, pfade.kontakt, pfade.impressum, pfade.datenschutz].map((p) => ({ url: `${siteUrl}${p}` }));
}

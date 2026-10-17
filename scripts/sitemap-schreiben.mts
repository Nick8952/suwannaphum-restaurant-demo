// Schreibt public/sitemap.xml VOR «next build», und nur mit INDEXIERUNG=1. Ohne Indexierung wird eine alte Datei entfernt.
//
// Warum nicht app/sitemap.ts? Vercel liefert nicht den Ordner out/ aus, sondern die Build-Ausgabe von Next. Eine Sitemap aus
// app/sitemap.ts erschiene dort auch in der noindex-Demo, obwohl scripts/export-nachbereiten.mjs sie aus out/ löscht
// (so geschehen beim ersten Vercel-Deployment am 17.10.2026). Dateien in public/ liegen dagegen auf beiden Zielen identisch.
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { indexierungErlaubt, siteUrl } from "../lib/deploy-ziel";
import { pfade } from "../lib/content/pfade";

const ziel = path.resolve(import.meta.dirname, "..", "public", "sitemap.xml");
if (!indexierungErlaubt) {
  await rm(ziel, { force: true });
  console.log("✓ Keine Sitemap (Demo ist noindex).");
} else {
  const seiten = [pfade.start, pfade.speisekarte, pfade.restaurant, pfade.kontakt, pfade.impressum, pfade.datenschutz];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${seiten.map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(ziel, xml);
  console.log(`✓ public/sitemap.xml mit ${seiten.length} Seiten geschrieben (${siteUrl}).`);
}

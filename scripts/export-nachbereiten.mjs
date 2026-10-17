// Nach dem statischen Export, nur für GitHub Pages nötig (Vercel liefert die Build-Ausgabe von Next direkt aus):
//  - GitHub Pages liefert bei unbekannten Adressen out/404.html aus. Next schreibt die gestaltete Fehlerseite
//    (app/not-found.tsx) mit trailingSlash nach out/404/index.html; hier zusätzlich als out/404.html ablegen.
//  - .nojekyll setzen (Ordner mit Unterstrich wie _next werden sonst nicht ausgeliefert).
// Die Sitemap entsteht VOR dem Build in public/ (scripts/sitemap-schreiben.mts), nur mit INDEXIERUNG=1.
import { copyFile, access, writeFile } from "node:fs/promises";
import path from "node:path";
const out = path.resolve(import.meta.dirname, "..", "out");
const quelle = path.join(out, "404", "index.html");
try { await access(quelle); } catch { console.error("✗ out/404/index.html fehlt: Export unvollständig."); process.exit(1); }
await copyFile(quelle, path.join(out, "404.html"));
await writeFile(path.join(out, ".nojekyll"), "");
console.log("✓ out/404.html und out/.nojekyll geschrieben.");

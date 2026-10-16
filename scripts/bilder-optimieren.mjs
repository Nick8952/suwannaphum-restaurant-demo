// Erzeugt aus den Originalen in assets/originale/ die Web-Varianten in public/bilder/
// und schreibt das Bildverzeichnis data/bilder.json (Masse, Varianten, Alternativtext, Bildnachweis).
// Aufruf: npm run bilder   (idempotent: public/bilder wird neu aufgebaut)
//
// Zuordnung id → Originaldatei samt Nachweis: scripts/bilder-liste.json. Herkunft jeder Datei: assets/originale/HERKUNFT.md
// Alle Bilder sind Fotos («foto»): festes Seitenverhältnis über "verhaeltnis" (z. B. "3:2"), optional "ausschnitt" (Pixel im Original)
// und "position" für den Bildausschnitt. Es wird nie hochskaliert. Dateinamen tragen einen Inhalts-Hash.
import sharp from "sharp";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..");
const QUELLE = path.join(WURZEL, "assets/originale");
const ZIEL = path.join(WURZEL, "public/bilder");
const BILDER = JSON.parse(await readFile(path.join(WURZEL, "scripts/bilder-liste.json"), "utf8"));

function verhaeltnis(text) {
  const [b, h] = text.split(":").map(Number);
  if (!b || !h) throw new Error(`Seitenverhältnis «${text}» ist ungültig (erwartet z. B. "3:2").`);
  return b / h;
}

// Erst alle Quellen prüfen, in einen temporären Ordner rendern und zum Schluss atomar austauschen (kein halber Bestand bei Fehlern).
for (const [id, cfg] of Object.entries(BILDER)) {
  const meta = await sharp(path.join(QUELLE, cfg.datei)).metadata().catch(() => null);
  if (!meta?.width || !meta?.height) throw new Error(`Bild «${id}»: ${cfg.datei} fehlt oder ist nicht lesbar.`);
  if (typeof cfg.alt !== "string") throw new Error(`Bild «${id}»: Alternativtext fehlt (leer "" nur für rein dekorative Bilder).`);
  if (!cfg.nachweis?.urheber || !cfg.nachweis?.quelle || !cfg.nachweis?.lizenz) throw new Error(`Bild «${id}»: Bildnachweis (urheber, quelle, lizenz) ist unvollständig.`);
}
const TEMP = `${ZIEL}.neu`;
await rm(TEMP, { recursive: true, force: true });
await mkdir(TEMP, { recursive: true });

async function schreiben(id, pipe, format) {
  const fertig = format === "avif" ? pipe.avif({ quality: 52, effort: 6 }) : format === "jpg" ? pipe.jpeg({ quality: 84, mozjpeg: true }) : pipe.webp({ quality: 74 });
  const { data, info } = await fertig.toBuffer({ resolveWithObject: true });
  const endung = format === "avif" ? "avif" : format === "jpg" ? "jpg" : "webp";
  const hash = createHash("sha1").update(data).digest("hex").slice(0, 8);
  const dateiname = `${id}-${info.width}-${hash}.${endung}`;
  await writeFile(path.join(TEMP, dateiname), data);
  return { breite: info.width, hoehe: info.height, url: `/bilder/${dateiname}`, bytes: data.length };
}

const verzeichnis = {};
for (const [id, cfg] of Object.entries(BILDER)) {
  const pfad = path.join(QUELLE, cfg.datei);
  const meta = await sharp(pfad).metadata();
  // rotate() wendet die EXIF-Ausrichtung an; danach stimmen Breite und Höhe mit dem sichtbaren Bild überein.
  let basis = sharp(pfad).rotate();
  const gedreht = (meta.orientation ?? 1) >= 5;
  let quellBreite = gedreht ? meta.height : meta.width;
  let quellHoehe = gedreht ? meta.width : meta.height;
  if (cfg.ausschnitt) {
    basis = sharp(await basis.extract(cfg.ausschnitt).toBuffer());
    quellBreite = cfg.ausschnitt.width;
    quellHoehe = cfg.ausschnitt.height;
  }
  const ratio = cfg.verhaeltnis ? verhaeltnis(cfg.verhaeltnis) : quellBreite / quellHoehe;
  const maxBreite = Math.floor(Math.min(quellBreite, quellHoehe * ratio));
  const breiten = [...new Set(cfg.breiten.map((b) => Math.min(b, maxBreite)))].sort((a, b) => a - b);
  const avif = [];
  const webp = [];
  for (const b of breiten) {
    const h = Math.round(b / ratio);
    const puffer = await basis.clone().resize({ width: b, height: h, fit: "cover", position: cfg.position ?? "centre", withoutEnlargement: true }).png().toBuffer();
    avif.push(await schreiben(id, sharp(puffer), "avif"));
    webp.push(await schreiben(id, sharp(puffer), "webp"));
  }
  const groesste = webp[webp.length - 1];
  verzeichnis[id] = {
    id, art: cfg.art, original: `assets/originale/${cfg.datei}`, breite: groesste.breite, hoehe: groesste.hoehe,
    alt: cfg.alt, legende: cfg.legende ?? null, symbolbild: cfg.symbolbild === true, nachweis: cfg.nachweis, abgerufen: cfg.abgerufen, bearbeitung: cfg.bearbeitung ?? null,
    quellen: { avif: avif.map(({ breite, url }) => ({ breite, url })), webp: webp.map(({ breite, url }) => ({ breite, url })) },
    bytes: { avif: avif.map((v) => v.bytes), webp: webp.map((v) => v.bytes) },
  };
}

// Vorschaubild für geteilte Links (Open Graph, 1200 × 630): Ausschnitt des Gastraumfotos mit dem Holzschild.
{
  const og = sharp(path.join(QUELLE, BILDER["gastraum-schild"].datei)).rotate().resize({ width: 1200, height: 630, fit: "cover", position: "centre" });
  const { breite, hoehe, url, bytes } = await schreiben("og-suwannaphum", og, "jpg");
  verzeichnis["og-suwannaphum"] = {
    id: "og-suwannaphum", art: "foto", original: `assets/originale/${BILDER["gastraum-schild"].datei}`, breite, hoehe,
    alt: BILDER["gastraum-schild"].alt, legende: null, symbolbild: false,
    nachweis: BILDER["gastraum-schild"].nachweis, abgerufen: BILDER["gastraum-schild"].abgerufen, bearbeitung: "Ausschnitt 1200 × 630 für geteilte Links",
    quellen: { avif: [], webp: [{ breite, url }] }, bytes: { avif: [], webp: [bytes] },
  };
}

const ALT = `${ZIEL}.alt`;
await rm(ALT, { recursive: true, force: true });
let hatteAlt = false;
try { await rename(ZIEL, ALT); hatteAlt = true; } catch { /* noch kein Bestand */ }
try {
  await rename(TEMP, ZIEL);
} catch (err) {
  if (hatteAlt) await rename(ALT, ZIEL);
  throw err;
}
await rm(ALT, { recursive: true, force: true });
await mkdir(path.join(WURZEL, "data"), { recursive: true });
await writeFile(path.join(WURZEL, "data/bilder.json"), JSON.stringify(verzeichnis, null, 2) + "\n");
const summe = Object.values(verzeichnis).reduce((s, b) => s + [...b.bytes.avif, ...b.bytes.webp].reduce((a, c) => a + c, 0), 0);
console.log(`${Object.keys(verzeichnis).length} Bilder → data/bilder.json, ${(await readdir(ZIEL)).length} Dateien in public/bilder (${Math.round(summe / 1024)} KB)`);
for (const b of Object.values(verzeichnis)) console.log(`  ${b.id.padEnd(28)} ${b.breite}×${b.hoehe}  avif ${b.bytes.avif.map((x) => Math.round(x / 1024) + "KB").join("/") || "-"}  webp ${b.bytes.webp.map((x) => Math.round(x / 1024) + "KB").join("/")}`);

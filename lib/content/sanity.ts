import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SanityClient } from "@sanity/client";
import { z } from "zod";
import {
  buffetSchema, einstellungenSchema, hinweisSchema, kategorieSchema, kontaktSeiteSchema, oeffnungszeitenSchema, pruefen, rechtSeiteSchema,
  restaurantSeiteSchema, speisekarteSchema, startseiteSchema, texteSchema, type Bild, type Block, type Inhaltsquelle, type Inline,
} from "./modell";

/**
 * Sanity-Inhaltsquelle, VORBEREITET (es existiert noch kein Sanity-Projekt).
 *
 * Wird nur geladen, wenn CONTENT_SOURCE=sanity gesetzt ist. Sie liest beim Build die veröffentlichten Dokumente,
 * überführt sie in das Domainmodell (lib/content/modell.ts) und prüft sie gegen dieselben Schemas wie die lokalen Inhalte.
 * Die Website bleibt ein statischer Export: Änderungen in Sanity werden sichtbar, sobald ein neuer Build gelaufen ist
 * (Webhook → Vercel-Deploy-Hook, siehe docs/SANITY-VERCEL-EINRICHTUNG.md). Zeitlich begrenzte Hinweise werden zusätzlich im Browser
 * gegen das aktuelle Datum geprüft (components/Hinweise.tsx), damit sie auch ohne Build verschwinden; der wöchentliche Build der CI
 * räumt den statischen Stand nach.
 *
 * Bilder kommen nicht vom Sanity-CDN, sondern aus einem lokalen Spiegel (scripts/sanity-bilder.mts), damit die Website
 * weiterhin keine Anfragen an Dritte auslöst. Die Dokumenttypen und Felder entsprechen studio/schemas/. Import: scripts/seed.mts.
 */
let client: SanityClient | null = null;
function sanity(): SanityClient {
  if (client) return client;
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim();
  const dataset = (process.env.SANITY_DATASET ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset) {
    throw new Error("CONTENT_SOURCE=sanity verlangt SANITY_PROJECT_ID und SANITY_DATASET (siehe .env.example). Ohne diese Angaben baut die Website mit den lokalen Inhalten: CONTENT_SOURCE weglassen.");
  }
  const token = process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
  client = createClient({ projectId, dataset, apiVersion: "2025-02-19", useCdn: false, perspective: "published", token });
  return client;
}

// ── Abfragen (GROQ) ────────────────────────────────────────────────────────
const BILD = `{ alt, legende, symbolbild, nachweis, "assetId": asset->_id, "url": asset->url, "breite": asset->metadata.dimensions.width, "hoehe": asset->metadata.dimensions.height }`;
const HERKUNFT = `"herkunft": coalesce(herkunft[]{ quelle, url, abgerufen, art }, [])`;
const BELEGE = `belege{ ${HERKUNFT}, freigabe }`;
const VARIANTE = `{ _key, name, preis }`;
const GERICHT = `{ _key, nummer, name, nameThai, beschreibung, portion, "schaerfe": coalesce(schaerfe, 0), preis, preistabelle, varianten[]${VARIANTE}, hinweis, "kennzeichnungen": coalesce(kennzeichnungen, []), "allergene": coalesce(allergene, []), "bild": bild${BILD} }`;
const ABFRAGEN = {
  einstellungen: `*[_id == "einstellungen"][0]{ name, kurzname, nameThai, claim, adresse, telefon, email, routenlink, reservation, takeaway, "lieferdienste": coalesce(lieferdienste[]{ _key, name, url, hinweis, ${HERKUNFT}, freigabe }, []), "zahlungsmethoden": coalesce(zahlungsmethoden[]{ _key, name }, []), zahlungsmethodenHinweis, "logo": logo${BILD}, "logoSchriftzug": logoSchriftzug${BILD}, "seoBild": seoBild${BILD}, ${HERKUNFT}, freigabe }`,
  oeffnungszeiten: `*[_id == "oeffnungszeiten"][0]{ zeitzone, "tage": coalesce(tage[]{ tag, "zeiten": coalesce(zeiten[]{ _key, von, bis, kuecheBis }, []) }, []), kuechenHinweis, ${HERKUNFT}, freigabe }`,
  hinweise: `*[_type == "hinweis"] | order(anzeigenVon desc){ "_key": _id, art, titel, text, anzeigenVon, anzeigenBis, geschlossenVon, geschlossenBis, geschlossenAb, zeiten[]{ _key, von, bis, kuecheBis }, ${HERKUNFT}, freigabe }`,
  buffet: `*[_id == "buffet"][0]{ titel, untertitel, text, "tage": coalesce(tage, []), von, bis, "abPreis": coalesce(abPreis, false), "angebote": coalesce(angebote[]{ _key, titel, preis, inklusive, hinweis }, []), "bild": bild${BILD}, ${HERKUNFT}, freigabe }`,
  speisekarte: `*[_id == "speisekarte"][0]{ titel, einleitung, schaerfe{ titel, text, "stufen": coalesce(stufen[]{ grad, text }, []) }, deklaration{ titel, einleitung, "eintraege": coalesce(eintraege[]{ _key, produkt, land }, []) }, allergenTitel, allergenHinweis, pdf, ${HERKUNFT}, freigabe, seoTitel, seoBeschreibung }`,
  kategorien: `*[_type == "kategorie"] | order(reihenfolge asc){ "slug": slug.current, titel, titelThai, untertitel, einleitung, "uebersetzungVorlaeufig": coalesce(uebersetzungVorlaeufig, false), "gerichte": coalesce(gerichte[]${GERICHT}, []), "preistabellen": coalesce(preistabellen[]{ _key, titel, text, "varianten": coalesce(varianten[]${VARIANTE}, []) }, []), "zusaetze": coalesce(zusaetze[]${VARIANTE}, []), fussnote, reihenfolge }`,
  texte: `*[_id == "texte"][0]{ demoHinweis, navigation, aufrufe, kopf, mobilLeiste, footer{ ..., "rechtliches": coalesce(rechtliches, []) }, ui, einwilligung{ ..., "kategorien": coalesce(kategorien, []) }, seo, ${BELEGE} }`,
  startseite: `*[_id == "startseite"][0]{ hero{ titel, text, knopf, zweiterKnopf, "bild": bild${BILD} }, heute, buffet, speisekarte{ titel, text, knopf, "kacheln": coalesce(kacheln[]{ _key, titel, text, kategorie, "bild": bild${BILD} }, []) }, specials, restaurant{ titel, text, knopf, "bilder": coalesce(bilder[]${BILD}, []) }, takeaway{ titel, text, "bild": bild${BILD} }, kontakt, ${BELEGE}, seoTitel, seoBeschreibung }`,
  restaurantSeite: `*[_id == "restaurantSeite"][0]{ titel, einleitung, "bild": bild${BILD}, geschichte{ titel, "absaetze": coalesce(absaetze, []) }, name, team{ titel, text, "mitglieder": coalesce(mitglieder[]{ _key, name, rolle, text, "bild": bild${BILD} }, []), "gruppenbild": gruppenbild${BILD} }, einblicke{ titel, text, "bilder": coalesce(bilder[]${BILD}, []) }, aufruf, ${BELEGE}, seoTitel, seoBeschreibung }`,
  kontaktSeite: `*[_id == "kontaktSeite"][0]{ titel, einleitung, reservationTitel, takeawayTitel, lieferdiensteTitel, lieferdiensteText, zahlungTitel, anfahrtTitel, anfahrtText, oeffnungszeitenTitel, ${BELEGE}, seoTitel, seoBeschreibung }`,
  rechtSeite: `*[_id == $id && _type == "rechtSeite"][0]{ "slug": slug.current, titel, einleitung, stand, inhalt, seoTitel, seoBeschreibung }`,
} as const;

// ── Normalisierung ─────────────────────────────────────────────────────────
type RohBild = { assetId?: string | null; url?: string | null; breite?: number | null; hoehe?: number | null; alt?: string | null; legende?: string | null; symbolbild?: boolean | null; nachweis?: Bild["nachweis"] | null };
type Varianten = Pick<Bild, "breite" | "hoehe" | "quellen">;
/** Liefert zu einem Sanity-Bild die Varianten, die die Website ausliefert. */
export type BildAufloeser = (roh: RohBild) => Varianten;
const BREITEN = [480, 960, 1600];

function istRohBild(w: unknown): w is RohBild {
  return typeof w === "object" && w !== null && "url" in w && "breite" in w && "hoehe" in w;
}

/** Varianten direkt vom Sanity-CDN. Nur für den Import-Trockenlauf (scripts/seed.mts), der keine Dateien braucht. */
export const ausCdn: BildAufloeser = (roh) => {
  const breite = roh.breite as number;
  const breiten = [...new Set(BREITEN.map((b) => Math.min(b, breite)))];
  const groesste = breiten[breiten.length - 1];
  return { breite: groesste, hoehe: Math.round((groesste / breite) * (roh.hoehe as number)), quellen: { avif: [], webp: breiten.map((b) => ({ breite: b, url: `${roh.url}?w=${b}&fm=webp&q=75` })) } };
};

/**
 * Varianten aus dem lokalen Spiegel. `npm run sanity:bilder` lädt vor dem Build alle Bilder aus Sanity, erzeugt AVIF und WebP
 * und schreibt das Verzeichnis data/cms-bilder.json. So bleibt die Website auch mit Sanity frei von Anfragen an Dritte.
 */
let spiegel: Record<string, Varianten> | null = null;
const ausSpiegel: BildAufloeser = (roh) => {
  if (!spiegel) {
    const datei = path.join(process.cwd(), "data", "cms-bilder.json");
    if (!existsSync(datei)) throw new Error("data/cms-bilder.json fehlt: Die Bilder aus Sanity sind nicht gespiegelt. Vor dem Build «npm run sanity:bilder» ausführen (die Build-Befehle tun das selbst).");
    spiegel = JSON.parse(readFileSync(datei, "utf8")) as Record<string, Varianten>;
  }
  const eintrag = roh.assetId ? spiegel[roh.assetId] : undefined;
  if (!eintrag) throw new Error(`Bild ${roh.assetId ?? "(ohne Kennung)"} fehlt im Spiegel (data/cms-bilder.json): «npm run sanity:bilder» erneut ausführen.`);
  return eintrag;
};

/** Sanity-Bild → Bild des Domainmodells. */
function bild(roh: RohBild, aufloesen: BildAufloeser): Bild | undefined {
  if (!roh.url || !roh.breite || !roh.hoehe) return undefined;
  // Fehlende Bildbeschreibung oder fehlender Nachweis bleiben undefined: das Domainmodell lehnt das Bild dann ab (Build bricht mit Fundstelle ab).
  return { alt: roh.alt ?? undefined, ...aufloesen(roh), symbolbild: roh.symbolbild === true, legende: roh.legende ?? undefined, nachweis: roh.nachweis ?? undefined } as Bild;
}

/** Geht die Antwort rekursiv durch: wandelt Bilder um und entfernt null (GROQ liefert null, das Domainmodell kennt nur «fehlt»). */
export function normalisieren(wert: unknown, aufloesen: BildAufloeser = ausCdn): unknown {
  if (wert === null) return undefined;
  if (Array.isArray(wert)) return wert.map((v) => normalisieren(v, aufloesen)).filter((v) => v !== undefined);
  if (istRohBild(wert)) return bild(wert, aufloesen);
  if (typeof wert === "object") {
    const aus: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(wert as Record<string, unknown>)) {
      const n = normalisieren(v, aufloesen);
      if (n !== undefined) aus[k] = n;
    }
    return aus;
  }
  return wert;
}

/** Sammelt aus normalisierten Inhalten alle Bilder mit Nachweis ein, egal wie tief sie liegen. */
function nachweiseSammeln(wert: unknown, liste: { titel: string; urheber: string; quelle: string; lizenz: string }[]): void {
  if (Array.isArray(wert)) { wert.forEach((v) => nachweiseSammeln(v, liste)); return; }
  if (!wert || typeof wert !== "object") return;
  const o = wert as Record<string, unknown>;
  if ("quellen" in o && "alt" in o) {
    const n = o.nachweis as Bild["nachweis"];
    if (n) liste.push({ titel: (o.legende as string | undefined) || (o.alt as string), urheber: n.urheber, quelle: n.quelle, lizenz: n.lizenz });
    return;
  }
  for (const v of Object.values(o)) nachweiseSammeln(v, liste);
}

// Portable Text (Sanity) → Fliesstext des Domainmodells
type PtSpan = { _type: "span"; text: string; marks?: string[] };
type PtBlock = { _type: string; style?: string; listItem?: string; children?: PtSpan[]; markDefs?: { _key: string; _type: string; href?: string }[] };

function inlineAusPt(b: PtBlock): Inline[] {
  return (b.children ?? []).filter((c) => c._type === "span" && c.text).map((c) => {
    const marks = c.marks ?? [];
    const link = b.markDefs?.find((d) => d._type === "link" && marks.includes(d._key))?.href;
    if (link) return { text: c.text, link };
    if (marks.includes("strong")) return { text: c.text, fett: true };
    return c.text;
  });
}
const anker = (text: string) => text.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function portableTextZuBloecken(pt: PtBlock[]): Block[] {
  const bloecke: Block[] = [];
  for (const b of pt ?? []) {
    if (b._type !== "block") continue;
    const inhalt = inlineAusPt(b);
    if (!inhalt.length) continue;
    if (b.listItem) {
      const letzter = bloecke[bloecke.length - 1];
      if (letzter?.art === "liste") letzter.punkte.push(inhalt);
      else bloecke.push({ art: "liste", punkte: [inhalt] });
    } else if (b.style === "h2" || b.style === "h3") {
      const text = inhalt.map((t) => (typeof t === "string" ? t : t.text)).join("");
      bloecke.push({ art: "titel", stufe: b.style === "h2" ? 2 : 3, text, anker: anker(text) });
    } else {
      bloecke.push({ art: "absatz", inhalt });
    }
  }
  return bloecke;
}

// ── Quelle ─────────────────────────────────────────────────────────────────
const zwischenspeicher = new Map<string, Promise<unknown>>();
/** Jede Abfrage läuft pro Build höchstens einmal. */
function holen(name: keyof typeof ABFRAGEN, parameter: Record<string, string> = {}, darfLeerSein = false): Promise<unknown> {
  const schluessel = `${name}:${JSON.stringify(parameter)}`;
  let p = zwischenspeicher.get(schluessel);
  if (!p) {
    p = sanity().fetch(ABFRAGEN[name], parameter).then((roh) => {
      if (roh === null && !darfLeerSein) throw new Error(`Sanity: Dokument «${name}» fehlt oder ist nicht veröffentlicht (Import mit npm run seed, dann im Studio veröffentlichen).`);
      return normalisieren(roh ?? [], ausSpiegel);
    });
    zwischenspeicher.set(schluessel, p);
  }
  return p;
}

export const sanityQuelle: Inhaltsquelle = {
  getEinstellungen: async () => pruefen(einstellungenSchema, await holen("einstellungen"), "Sanity: Restaurant und Kontakt"),
  getOeffnungszeiten: async () => pruefen(oeffnungszeitenSchema, await holen("oeffnungszeiten"), "Sanity: Öffnungszeiten"),
  getHinweise: async () => pruefen(z.array(hinweisSchema), await holen("hinweise", {}, true), "Sanity: Hinweise"),
  getBuffet: async () => pruefen(buffetSchema, await holen("buffet"), "Sanity: Mittagsbuffet"),
  getSpeisekarte: async () => {
    const [karte, kategorien] = await Promise.all([holen("speisekarte"), holen("kategorien", {}, true)]);
    return pruefen(speisekarteSchema, { ...(karte as Record<string, unknown>), kategorien: pruefen(z.array(kategorieSchema), kategorien, "Sanity: Kategorien der Speisekarte") }, "Sanity: Speisekarte");
  },
  getTexte: async () => pruefen(texteSchema, await holen("texte"), "Sanity: Texte"),
  getStartseite: async () => pruefen(startseiteSchema, await holen("startseite"), "Sanity: Startseite"),
  getRestaurantSeite: async () => pruefen(restaurantSeiteSchema, await holen("restaurantSeite"), "Sanity: Seite Restaurant und Team"),
  getKontaktSeite: async () => pruefen(kontaktSeiteSchema, await holen("kontaktSeite"), "Sanity: Seite Kontakt"),
  getRechtSeite: async (slug) => {
    const roh = (await holen("rechtSeite", { id: `rechtSeite-${slug}` })) as { inhalt?: PtBlock[] } & Record<string, unknown>;
    const { inhalt, ...rest } = roh;
    return pruefen(rechtSeiteSchema, { ...rest, bloecke: portableTextZuBloecken(inhalt ?? []) }, `Sanity: Rechtsseite «${slug}»`);
  },
  getBildnachweise: async () => {
    const alles = await Promise.all([holen("einstellungen"), holen("buffet"), holen("kategorien", {}, true), holen("startseite"), holen("restaurantSeite")]);
    const liste: { titel: string; urheber: string; quelle: string; lizenz: string }[] = [];
    nachweiseSammeln(alles, liste);
    const gesehen = new Set<string>();
    return liste.filter((n) => (gesehen.has(n.quelle + n.titel) ? false : (gesehen.add(n.quelle + n.titel), true)));
  },
};

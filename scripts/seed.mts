// Import der lokalen Inhalte (data/*.json, public/bilder) nach Sanity.
//
//   npm run seed -- --probe     Trockenlauf ohne Zugang: baut alle Dokumente, prüft sie gegen das Domainmodell und vergleicht
//                               sie mit den lokalen Inhalten (Parität). Schreibt nichts, braucht kein Sanity-Projekt.
//   npm run seed                legt fehlende Dokumente an (bestehende bleiben unangetastet)
//   npm run seed -- --force     überschreibt bestehende Dokumente mit dem lokalen Stand
//
// Der echte Lauf braucht SANITY_PROJECT_ID, SANITY_DATASET und SANITY_API_WRITE_TOKEN (Token mit Schreibrecht, nur lokal in
// .env.local, nie im Repository). Anleitung: docs/SANITY-VERCEL-EINRICHTUNG.md
import { createReadStream, readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { createClient } from "@sanity/client";
import { lokaleQuelle } from "../lib/content/local";
import {
  buffetSchema, einstellungenSchema, hinweisSchema, kategorieSchema, kontaktSeiteSchema, oeffnungszeitenSchema, pruefen, rechtSeiteSchema, restaurantSeiteSchema,
  speisekarteSchema, startseiteSchema, texteSchema,
} from "../lib/content/modell";
import { normalisieren, portableTextZuBloecken } from "../lib/content/sanity";
import { inline, type RohBlock } from "../lib/content/text";

const probe = process.argv.includes("--probe");
const force = process.argv.includes("--force");
const lesen = (datei: string) => JSON.parse(readFileSync(path.join("data", datei), "utf8"));
type Doc = { _id: string; _type: string } & Record<string, unknown>;
type Roh = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- frei geformte JSON-Dateien

const bilder = lesen("bilder.json") as Record<string, { breite: number; hoehe: number; alt: string; legende: string | null; symbolbild: boolean; nachweis: { urheber: string; quelle: string; lizenz: string }; quellen: { webp: { breite: number; url: string }[] } }>;
const assetIds = new Map<string, string>();

let zaehler = 0;
const key = (praefix: string) => `${praefix}${(zaehler++).toString(36)}`;
/** Array-Einträge brauchen in Sanity `_key` und (in gemischten Arrays) `_type`. */
const liste = <T extends Roh>(eintraege: T[] | undefined, typ: string) => (eintraege ?? []).map((e) => ({ _type: typ, _key: e._key ?? key(typ.slice(0, 3)), ...e }));
const verweis = (l: Roh) => ({ _type: "verweis", text: l.text, ziel: l.ziel });
const herkunft = (h: Roh[]) => liste(h, "herkunft");
const belege = (b: Roh) => ({ _type: "belege", herkunft: herkunft(b.herkunft), freigabe: b.freigabe });
const slug = (current: string) => ({ _type: "slug", current });
function bildFeld(id: string) {
  const b = bilder[id];
  if (!b) throw new Error(`Bild «${id}» fehlt in data/bilder.json.`);
  const ref = assetIds.get(id) ?? `image-probe${id.replace(/[^a-z0-9]/g, "")}-${b.breite}x${b.hoehe}-webp`;
  return { _type: "bildMitText", asset: { _type: "reference", _ref: ref }, alt: b.alt, ...(b.legende ? { legende: b.legende } : {}), symbolbild: b.symbolbild, nachweis: { urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz } };
}
const bildOptional = (id: string | undefined) => (id ? { bild: bildFeld(id) } : {});

/** Lokaler Fliesstext → Portable Text */
function portableText(roh: RohBlock[]) {
  const block = (style: string, text: string, extra: Roh = {}) => {
    const markDefs: Roh[] = [];
    const children = inline(text).map((t) => {
      if (typeof t === "string") return { _type: "span", _key: key("s"), text: t, marks: [] };
      if (t.link) { const k = key("l"); markDefs.push({ _key: k, _type: "link", href: t.link }); return { _type: "span", _key: key("s"), text: t.text, marks: [k] }; }
      return { _type: "span", _key: key("s"), text: t.text, marks: t.fett ? ["strong"] : [] };
    });
    return { _type: "block", _key: key("b"), style, markDefs, children, ...extra };
  };
  return roh.flatMap((b) => {
    if (typeof b === "string") return [block("normal", b)];
    if ("liste" in b) return b.liste.map((p) => block("normal", p, { listItem: "bullet", level: 1 }));
    return [block(b.stufe === 3 ? "h3" : "h2", b.titel)];
  });
}

function dokumenteBauen(): Doc[] {
  const e = lesen("einstellungen.json"), o = lesen("oeffnungszeiten.json"), hinweise = lesen("hinweise.json") as Roh[], bf = lesen("buffet.json"), karte = lesen("speisekarte.json");
  const t = lesen("texte.json"), s = lesen("startseite.json"), rs = lesen("seiten/restaurant.json"), ks = lesen("seiten/kontakt.json");
  const docs: Doc[] = [];
  const { logo, logoSchriftzug, seoBild, lieferdienste, zahlungsmethoden, herkunft: eh, ...eRest } = e;
  docs.push({ _id: "einstellungen", _type: "einstellungen", ...eRest, logo: bildFeld(logo), ...(logoSchriftzug ? { logoSchriftzug: bildFeld(logoSchriftzug) } : {}), seoBild: bildFeld(seoBild), lieferdienste: liste(lieferdienste, "lieferdienst").map((l: Roh) => ({ ...l, herkunft: herkunft(l.herkunft) })), zahlungsmethoden: liste(zahlungsmethoden, "zahlungsmethode"), herkunft: herkunft(eh) });
  docs.push({ _id: "oeffnungszeiten", _type: "oeffnungszeiten", ...o, tage: (o.tage as Roh[]).map((tag) => ({ _type: "tagZeiten", _key: `tag${tag.tag}`, tag: tag.tag, zeiten: liste(tag.zeiten, "zeitfenster") })), herkunft: herkunft(o.herkunft) });
  for (const h of hinweise) { const { _key, herkunft: hh, zeiten: hz, ...rest } = h; docs.push({ _id: `hinweis-${_key}`, _type: "hinweis", ...rest, ...(hz ? { zeiten: liste(hz, "zeitfenster") } : {}), herkunft: herkunft(hh) }); }
  docs.push({ _id: "buffet", _type: "buffet", ...bf, angebote: liste(bf.angebote, "buffetAngebot"), ...bildOptional(bf.bild), herkunft: herkunft(bf.herkunft), bild: undefined, ...(bf.bild ? { bild: bildFeld(bf.bild) } : {}) });
  const { kategorien, herkunft: kh, ...karteRest } = karte;
  docs.push({ _id: "speisekarte", _type: "speisekarte", ...karteRest, schaerfe: { ...karte.schaerfe, stufen: liste(karte.schaerfe.stufen, "schaerfeStufe") }, deklaration: { ...karte.deklaration, eintraege: liste(karte.deklaration.eintraege, "deklarationEintrag") }, herkunft: herkunft(kh) });
  for (const k of kategorien as Roh[]) {
    const { slug: s2, gerichte, preistabellen, zusaetze, ...rest } = k;
    docs.push({
      _id: `kategorie-${s2}`, _type: "kategorie", ...rest, slug: slug(s2),
      gerichte: liste(gerichte, "gericht").map((g: Roh) => { const { bild, varianten, ...gr } = g; return { ...gr, ...(varianten ? { varianten: liste(varianten, "gerichtVariante") } : {}), ...(bild ? { bild: bildFeld(bild) } : {}) }; }),
      preistabellen: liste(preistabellen, "preistabelle").map((p: Roh) => ({ ...p, varianten: liste(p.varianten, "gerichtVariante") })),
      zusaetze: liste(zusaetze, "gerichtVariante"),
    });
  }
  docs.push({
    _id: "texte", _type: "texte", demoHinweis: t.demoHinweis, navigation: liste(t.navigation, "verweis"),
    aufrufe: { speisekarte: verweis(t.aufrufe.speisekarte), reservieren: t.aufrufe.reservieren, takeaway: t.aufrufe.takeaway },
    kopf: t.kopf, mobilLeiste: t.mobilLeiste,
    footer: { ...t.footer, rechtliches: liste(t.footer.rechtliches, "verweis"), bildnachweis: verweis(t.footer.bildnachweis) },
    ui: { ...t.ui, nichtGefundenLink: verweis(t.ui.nichtGefundenLink) },
    einwilligung: { ...t.einwilligung, kategorien: liste(t.einwilligung.kategorien, "einwilligungKategorie") },
    seo: t.seo,
    belege: belege(t.belege),
  });
  docs.push({
    _id: "startseite", _type: "startseite", ...s,
    hero: { ...s.hero, knopf: verweis(s.hero.knopf), zweiterKnopf: verweis(s.hero.zweiterKnopf), bild: bildFeld(s.hero.bild) },
    speisekarte: { ...s.speisekarte, knopf: verweis(s.speisekarte.knopf), kacheln: liste(s.speisekarte.kacheln, "kachel").map((k: Roh) => ({ ...k, bild: bildFeld(k.bild) })) },
    specials: { ...s.specials, knopf: verweis(s.specials.knopf) },
    restaurant: { ...s.restaurant, knopf: verweis(s.restaurant.knopf), bilder: (s.restaurant.bilder as string[]).map((b) => ({ _key: key("b"), ...bildFeld(b) })) },
    takeaway: { ...s.takeaway, ...(s.takeaway.bild ? { bild: bildFeld(s.takeaway.bild) } : {}) },
    belege: belege(s.belege),
  });
  docs.push({
    _id: "restaurantSeite", _type: "restaurantSeite", ...rs, bild: bildFeld(rs.bild),
    team: { ...rs.team, mitglieder: liste(rs.team.mitglieder, "teamMitglied").map((m: Roh) => { const { bild, ...mr } = m; return { ...mr, ...(bild ? { bild: bildFeld(bild) } : {}) }; }), ...(rs.team.gruppenbild ? { gruppenbild: bildFeld(rs.team.gruppenbild) } : {}) },
    einblicke: { ...rs.einblicke, bilder: (rs.einblicke.bilder as string[]).map((b) => ({ _key: key("b"), ...bildFeld(b) })) },
    aufruf: { ...rs.aufruf, knopf: verweis(rs.aufruf.knopf) },
    belege: belege(rs.belege),
  });
  docs.push({ _id: "kontaktSeite", _type: "kontaktSeite", ...ks, belege: belege(ks.belege) });
  for (const name of ["impressum", "datenschutz"]) {
    const { bloecke, slug: s2, ...rest } = lesen(`seiten/${name}.json`);
    docs.push({ _id: `rechtSeite-${name}`, _type: "rechtSeite", ...rest, slug: slug(s2), inhalt: portableText(bloecke) });
  }
  return docs.map((d) => JSON.parse(JSON.stringify(d))); // undefined-Felder entfernen
}

// ── Trockenlauf: Dokumente so lesen, wie die Website sie aus Sanity bekäme, und mit dem lokalen Stand vergleichen ──
function projizieren(wert: unknown, docs: Map<string, Doc>): unknown {
  if (Array.isArray(wert)) return wert.map((v) => projizieren(v, docs));
  if (!wert || typeof wert !== "object") return wert;
  const o = wert as Roh;
  if (o._type === "slug") return o.current;
  if (o._type === "block") return o;
  if (o._type === "bildMitText") {
    const m = /-(\d+)x(\d+)-/.exec(o.asset._ref);
    return { assetId: o.asset._ref, url: `https://cdn.sanity.io/images/probe/production/${o.asset._ref}.webp`, breite: Number(m?.[1]), hoehe: Number(m?.[2]), alt: o.alt, legende: o.legende ?? null, symbolbild: o.symbolbild, nachweis: o.nachweis };
  }
  const aus: Roh = {};
  for (const [k, v] of Object.entries(o)) if (k !== "_type" && k !== "_id") aus[k] = projizieren(v, docs);
  return aus;
}
/** Für den Vergleich: Bilder (andere Adressen im CDN) und Sprungmarken ausblenden; Hinweise bekommen in Sanity die Dokument-ID als Schlüssel. */
function vergleichbar(wert: unknown): unknown {
  if (Array.isArray(wert)) return wert.map(vergleichbar);
  if (!wert || typeof wert !== "object") return wert;
  const o = wert as Roh;
  if ("quellen" in o && "breite" in o) return { alt: o.alt, legende: o.legende, symbolbild: o.symbolbild, nachweis: o.nachweis };
  const aus: Roh = {};
  for (const [k, v] of Object.entries(o)) if (k !== "anker" && k !== "_key" && v !== undefined) aus[k] = vergleichbar(v);
  return aus;
}
async function trockenlauf(liste2: Doc[]) {
  const docs = new Map(liste2.map((d) => [d._id, d]));
  const proj = (id: string) => normalisieren(projizieren(docs.get(id), docs));
  const q = lokaleQuelle;
  const unterschiede: string[] = [];
  const gleich = (name: string, ausSanity: unknown, lokal: unknown) => { if (!isDeepStrictEqual(vergleichbar(ausSanity), vergleichbar(lokal))) unterschiede.push(name); };
  gleich("Restaurant und Kontakt", pruefen(einstellungenSchema, proj("einstellungen"), "Import: Einstellungen"), await q.getEinstellungen());
  gleich("Öffnungszeiten", pruefen(oeffnungszeitenSchema, proj("oeffnungszeiten"), "Import: Öffnungszeiten"), await q.getOeffnungszeiten());
  gleich("Hinweise", pruefen(z.array(hinweisSchema), liste2.filter((d) => d._type === "hinweis").map((d) => ({ ...(proj(d._id) as Roh), _key: d._id })), "Import: Hinweise"), await q.getHinweise());
  gleich("Mittagsbuffet", pruefen(buffetSchema, proj("buffet"), "Import: Buffet"), await q.getBuffet());
  const kategorien = liste2.filter((d) => d._type === "kategorie").sort((a, b) => (a.reihenfolge as number) - (b.reihenfolge as number)).map((d) => proj(d._id));
  gleich("Speisekarte", pruefen(speisekarteSchema, { ...(proj("speisekarte") as Roh), kategorien: pruefen(z.array(kategorieSchema), kategorien, "Import: Kategorien") }, "Import: Speisekarte"), await q.getSpeisekarte());
  gleich("Texte", pruefen(texteSchema, proj("texte"), "Import: Texte"), await q.getTexte());
  gleich("Startseite", pruefen(startseiteSchema, proj("startseite"), "Import: Startseite"), await q.getStartseite());
  gleich("Restaurant und Team", pruefen(restaurantSeiteSchema, proj("restaurantSeite"), "Import: Restaurant"), await q.getRestaurantSeite());
  gleich("Kontakt", pruefen(kontaktSeiteSchema, proj("kontaktSeite"), "Import: Kontakt"), await q.getKontaktSeite());
  for (const name of ["impressum", "datenschutz"] as const) {
    const { inhalt, ...rest } = proj(`rechtSeite-${name}`) as Roh;
    gleich(`Rechtsseite ${name}`, pruefen(rechtSeiteSchema, { ...rest, bloecke: portableTextZuBloecken(inhalt) }, `Import: ${name}`), await q.getRechtSeite(name));
  }
  if (unterschiede.length) throw new Error(`Import weicht vom lokalen Stand ab: ${unterschiede.join(", ")}. scripts/seed.mts und lib/content/sanity.ts abgleichen.`);
}

const docs = dokumenteBauen();
const zaehlung = docs.reduce<Record<string, number>>((z2, d) => ((z2[d._type] = (z2[d._type] ?? 0) + 1), z2), {});
const uebersicht = Object.entries(zaehlung).map(([t, n]) => `${n} × ${t}`).join(", ");

if (probe) {
  await trockenlauf(docs);
  console.log(`✓ Trockenlauf: ${docs.length} Dokumente gebaut (${uebersicht}), ${Object.keys(bilder).length} Bilder zugeordnet.`);
  console.log("  Jedes Dokument besteht das Domainmodell und entspricht nach dem Zurücklesen den lokalen Inhalten. Es wurde nichts geschrieben.");
} else {
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim(), dataset = (process.env.SANITY_DATASET ?? "").trim(), token = (process.env.SANITY_API_WRITE_TOKEN ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset || !token) {
    console.error("✗ Für den Import fehlen SANITY_PROJECT_ID, SANITY_DATASET oder SANITY_API_WRITE_TOKEN (siehe .env.example).\n  Ohne Zugang lässt sich der Import mit «npm run seed -- --probe» prüfen.");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false });
  for (const [id, b] of Object.entries(bilder)) {
    const datei = path.join("public", b.quellen.webp[b.quellen.webp.length - 1].url);
    const asset = await client.assets.upload("image", createReadStream(datei), { filename: path.basename(datei) });
    assetIds.set(id, asset._id);
    console.log(`  Bild ${id} → ${asset._id}`);
  }
  zaehler = 0;
  const fertig = dokumenteBauen();
  let tx = client.transaction();
  for (const d of fertig) tx = force ? tx.createOrReplace(d) : tx.createIfNotExists(d);
  await tx.commit();
  console.log(`✓ ${fertig.length} Dokumente ${force ? "geschrieben (bestehende überschrieben)" : "angelegt (bestehende unverändert)"}: ${uebersicht}.`);
}

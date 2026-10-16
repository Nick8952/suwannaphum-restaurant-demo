// Prüft die lokalen Inhalte über das Schema hinaus (das Schema selbst prüft lib/content/local.ts beim Laden):
//  - Schweizer Schreibweise (kein «ß»), keine Gedankenstriche, keine geraden Anführungszeichen als Zitatzeichen
//  - Speisekarte: Nummern lückenlos je Kategorie, keine doppelten Nummern, jedes Gericht hat einen Preisweg, Preise plausibel,
//    Thai-Schrift nur in Feldern dafür, keine abgeleiteten Kennzeichnungen ohne Bestätigung
//  - Öffnungszeiten: Küchenschluss nur am Abend und nie nach dem Restaurantschluss, Buffetzeit innerhalb der Öffnungszeit
//  - Hinweise: Datumsfenster gültig; abgelaufene Hinweise werden genannt (nicht als Fehler)
//  - alle Linkziele erlaubt, interne Ziele und Sprungmarken vorhanden, Lieferdienst-Links sind Restaurantprofile
//  - ein Ziel, eine Beschriftung: Knöpfe zur Speisekarte und zum Telefon heissen überall gleich
//  - Einstieg: Titel kurz, Text höchstens 20 Wörter
//  - Bilder: Alternativtext, Nachweis, Dateien vorhanden, jedes Bild in Gebrauch
//  - mit --live zusätzlich: alles vom Restaurant freigegeben?
// Aufruf: npm run inhalt:pruefen   ·   vor dem Go-Live: npm run inhalt:pruefen -- --live
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { lokaleQuelle } from "../lib/content/local";
import { pfade } from "../lib/content/modell";
import { istErlaubtesLinkziel } from "../lib/assets";
import { offeneFreigaben } from "../lib/content/freigabe";
import { hinweisAktiv, lokal, minuten } from "../lib/content/zeit";

const live = process.argv.includes("--live");
const fehler: string[] = [];
const hinweise: string[] = [];
const q = lokaleQuelle;
const [e, o, hin, buffet, karte, t, start, restaurant, kontakt, impressum, datenschutz] = await Promise.all([
  q.getEinstellungen(), q.getOeffnungszeiten(), q.getHinweise(), q.getBuffet(), q.getSpeisekarte(), q.getTexte(), q.getStartseite(), q.getRestaurantSeite(), q.getKontaktSeite(), q.getRechtSeite("impressum"), q.getRechtSeite("datenschutz"),
]);
const alles = { e, o, hin, buffet, karte, t, start, restaurant, kontakt, impressum, datenschutz };

// ── alle Zeichenketten und Links einsammeln ────────────────────────────────
type Fund = { pfad: string; text: string };
const texte: Fund[] = [];
const links: { pfad: string; ziel: string; text?: string }[] = [];
function gehen(wert: unknown, pfad: string) {
  if (typeof wert === "string") { texte.push({ pfad, text: wert }); return; }
  if (Array.isArray(wert)) { wert.forEach((v, i) => gehen(v, `${pfad}[${i}]`)); return; }
  if (wert && typeof wert === "object") {
    const o2 = wert as Record<string, unknown>;
    if (typeof o2.ziel === "string") links.push({ pfad, ziel: o2.ziel, text: typeof o2.text === "string" ? o2.text : undefined });
    if (typeof o2.link === "string") links.push({ pfad, ziel: o2.link, text: typeof o2.text === "string" ? o2.text : undefined });
    for (const [k, v] of Object.entries(o2)) {
      if (k === "quellen" || k === "nachweis" || k === "url" || k === "herkunft" || k === "routenlink") continue; // Dateipfade und Quellenangaben sind keine Seitentexte
      gehen(v, `${pfad}.${k}`);
    }
  }
}
for (const [name, wert] of Object.entries(alles)) gehen(wert, name);

// ── Schreibweise ───────────────────────────────────────────────────────────
for (const { pfad, text } of texte) {
  if (/nameThai|titelThai/.test(pfad)) continue;
  if (text.includes("ß")) fehler.push(`${pfad}: «ß» gefunden (Schweizer Schreibweise verlangt «ss»): ${text.slice(0, 60)}`);
  if (/[—–]/.test(text)) fehler.push(`${pfad}: Gedankenstrich gefunden (Satz umstellen oder Bindestrich verwenden): ${text.slice(0, 60)}`);
  if (/(^|\s)"[^"]+"/.test(text)) fehler.push(`${pfad}: gerade Anführungszeichen (stattdessen «…»): ${text.slice(0, 60)}`);
  if (/\s{2,}/.test(text.trim())) fehler.push(`${pfad}: doppelte Leerzeichen: ${text.slice(0, 60)}`);
  if (/[฀-๿]/.test(text) && !/name\.text|einleitung|nameThai|titelThai/.test(pfad)) hinweise.push(`${pfad}: Thai-Schrift ausserhalb der Thai-Felder (in Ordnung, wenn gewollt): ${text.slice(0, 40)}`);
}

// ── Unbelegte Behauptungen ─────────────────────────────────────────────────
// Rechtsseiten und technische Texte sind ausgenommen; geprüft werden die Inhalte, die etwas über das Restaurant sagen.
const VERBOTEN: [RegExp, string][] = [
  [/\b(bestes?|beliebtestes?|das beste|die beste|Nr\. ?1|führend|ausgezeichnet|prämiert|Auszeichnung|Sterne)\b/i, "Superlativ, Auszeichnung oder Bewertung"],
  [/\b(kostenlos|gratis)\b/i, "kostenlose Leistung"],
  [/\bgarantier/i, "Garantie"],
  [/\b(hausgemacht|frisch zubereitet|täglich frisch|bio|regional)\b/i, "Qualitätsversprechen ohne Beleg"],
  [/\b(Parkplätze|Parkplatz|Tram|Bus|S-Bahn|Bahnhof)\b/, "Anfahrtsangabe ohne Beleg"],
  [/\bE-Mail\b.*@/i, "E-Mail-Adresse des Restaurants (keine bekannt)"],
];
for (const { pfad, text } of texte) {
  if (/^(impressum|datenschutz|t\.einwilligung)/.test(pfad)) continue;
  for (const [muster, was] of VERBOTEN) if (muster.test(text)) fehler.push(`${pfad}: unbelegte Behauptung (${was}): «${text.slice(0, 80)}»`);
}

// ── Links ──────────────────────────────────────────────────────────────────
const seiten = new Set<string>([pfade.start, pfade.speisekarte, pfade.restaurant, pfade.kontakt, pfade.impressum, pfade.datenschutz]);
const anker: Record<string, Set<string>> = {
  [pfade.speisekarte]: new Set(["mittagsbuffet", "schaerfe", "deklaration", ...karte.kategorien.map((k) => k.slug)]),
  [pfade.kontakt]: new Set(["oeffnungszeiten", "reservation", "take-away", "lieferung", "anfahrt"]),
  [pfade.impressum]: new Set(impressum.bloecke.flatMap((b) => (b.art === "titel" && b.anker ? [b.anker] : []))),
  [pfade.datenschutz]: new Set(datenschutz.bloecke.flatMap((b) => (b.art === "titel" && b.anker ? [b.anker] : []))),
};
for (const l of links) {
  if (!istErlaubtesLinkziel(l.ziel)) { fehler.push(`${l.pfad}: Linkziel nicht erlaubt: ${l.ziel}`); continue; }
  if (!l.ziel.startsWith("/")) continue;
  const [seite, marke] = l.ziel.split("#");
  if (!seiten.has(seite)) fehler.push(`${l.pfad}: interne Seite gibt es nicht: ${l.ziel}`);
  else if (marke && !anker[seite]?.has(marke)) fehler.push(`${l.pfad}: Sprungmarke gibt es nicht: ${l.ziel}`);
}
// Ein Ziel, eine Beschriftung
for (const l of links) {
  if (!l.text) continue;
  if (/^(t\.(navigation|footer)|impressum|datenschutz)/.test(l.pfad)) continue;
  if (/^\d[\d ]+$/.test(l.text)) continue; // die Telefonnummer selbst als Linktext (Kontakt, Fusszeile)
  if (l.ziel === pfade.speisekarte && l.text !== t.aufrufe.speisekarte.text) fehler.push(`${l.pfad}: Knopf zur Speisekarte heisst «${l.text}», überall sonst «${t.aufrufe.speisekarte.text}»`);
  if (l.ziel.startsWith("tel:") && ![t.aufrufe.reservieren.text, t.aufrufe.takeaway.text].includes(l.text)) fehler.push(`${l.pfad}: Telefon-Knopf heisst «${l.text}», erlaubt sind «${t.aufrufe.reservieren.text}» und «${t.aufrufe.takeaway.text}»`);
}
const tel = e.telefon.replace(/\s/g, "").replace("+", "+");
for (const l of links) if (l.ziel.startsWith("tel:") && l.ziel !== `tel:${tel}`) fehler.push(`${l.pfad}: Telefonlink ${l.ziel} entspricht nicht der Restaurantnummer tel:${tel}`);
for (const d of e.lieferdienste) {
  const u = new URL(d.url);
  if (u.pathname === "/" || u.pathname === "") fehler.push(`Lieferdienst «${d.name}»: Link zeigt auf die Startseite der Plattform, nicht auf das Restaurantprofil`);
  if (!/suwannaphum/i.test(d.url)) fehler.push(`Lieferdienst «${d.name}»: Link enthält den Restaurantnamen nicht: ${d.url}`);
}
for (const kachel of start.speisekarte.kacheln) if (!karte.kategorien.some((k) => k.slug === kachel.kategorie)) fehler.push(`start.speisekarte.kacheln: Kategorie «${kachel.kategorie}» gibt es nicht`);
if (!karte.kategorien.some((k) => k.slug === start.specials.kategorie)) fehler.push(`start.specials: Kategorie «${start.specials.kategorie}» gibt es nicht`);

// ── Einstieg ───────────────────────────────────────────────────────────────
const woerter = start.hero.text.trim().split(/\s+/).length;
if (woerter > 20) fehler.push(`start.hero.text: ${woerter} Wörter (höchstens 20, damit der Einstieg auf einen Blick lesbar bleibt)`);
if (start.hero.titel.length > 34) fehler.push(`start.hero.titel: ${start.hero.titel.length} Zeichen (höchstens 34)`);

// ── Speisekarte ────────────────────────────────────────────────────────────
let gerichteGesamt = 0;
for (const k of karte.kategorien) {
  gerichteGesamt += k.gerichte.length;
  const nummern = k.gerichte.map((g) => g.nummer).filter((n): n is string => !!n);
  if (new Set(nummern).size !== nummern.length) fehler.push(`Kategorie «${k.titel}»: doppelte Nummern`);
  const zahlen = nummern.map(Number).filter((n) => !Number.isNaN(n));
  for (let i = 1; i < zahlen.length; i++) if (zahlen[i] !== zahlen[i - 1] + 1) fehler.push(`Kategorie «${k.titel}»: Nummern nicht lückenlos (${zahlen[i - 1]} → ${zahlen[i]})`);
  for (const g of k.gerichte) {
    const preise = [g.preis, ...(g.varianten ?? []).map((v) => v.preis), ...k.preistabellen.filter((p) => p._key === g.preistabelle).flatMap((p) => p.varianten.map((v) => v.preis))].filter((p): p is number => p !== undefined);
    if (!preise.length) fehler.push(`Gericht «${g.name}»: kein Preis`);
    for (const p of preise) if (p < 3 || p > 60) hinweise.push(`Gericht «${g.name}»: ungewöhnlicher Preis ${p}`);
    if (g.kennzeichnungen.length || g.allergene.length) fehler.push(`Gericht «${g.name}»: Kennzeichnungen/Allergene eingetragen, obwohl nichts bestätigt ist (Demo)`);
    if (g.nameThai && !/[฀-๿]/.test(g.nameThai)) fehler.push(`Gericht «${g.name}»: nameThai enthält keine Thai-Schrift`);
    if (k.uebersetzungVorlaeufig && !g.nameThai) fehler.push(`Gericht «${g.name}»: Kategorie mit vorläufiger Übersetzung, aber kein Thai-Name`);
  }
  for (const p of k.preistabellen) if (!k.gerichte.some((g) => g.preistabelle === p._key)) fehler.push(`Kategorie «${k.titel}»: Preistabelle «${p._key}» wird von keinem Gericht benutzt`);
}
// Erwartete Zahl aus der Abschrift der elf Kartenseiten (34 nummerierte Gerichte, 9 Vorspeisen-Positionen, 6 Salate, 4 Suppen, 13 Thai Specials, 2 Specials, 2 Tees)
const ERWARTET = 70;
if (gerichteGesamt !== ERWARTET) fehler.push(`Speisekarte: ${gerichteGesamt} Gerichte, erwartet ${ERWARTET} (Abschrift prüfen oder Erwartung anpassen)`);

// ── Zeiten ─────────────────────────────────────────────────────────────────
for (const tag of o.tage) {
  for (let i = 1; i < tag.zeiten.length; i++) if (minuten(tag.zeiten[i].von) < minuten(tag.zeiten[i - 1].bis)) fehler.push(`Öffnungszeiten Tag ${tag.tag}: Zeitfenster überschneiden sich`);
  for (const z of tag.zeiten) if (z.kuecheBis && minuten(z.bis) < 17 * 60) hinweise.push(`Öffnungszeiten Tag ${tag.tag}: Küchenschluss über Mittag eingetragen (Quelle nennt ihn nur am Abend)`);
}
for (const tagNr of buffet.tage) {
  const zeiten = o.tage.find((x) => x.tag === tagNr)?.zeiten ?? [];
  if (!zeiten.some((z) => minuten(z.von) <= minuten(buffet.von) && minuten(buffet.bis) <= minuten(z.bis))) fehler.push(`Buffet: Zeit ${buffet.von} bis ${buffet.bis} liegt an Tag ${tagNr} ausserhalb der Öffnungszeiten`);
}
const heute = lokal(new Date()).datum;
for (const h of hin) {
  if (!hinweisAktiv(h, heute)) hinweise.push(`Hinweis «${h.titel}» ist ${h.anzeigenBis < heute ? "abgelaufen" : "noch nicht sichtbar"} (${h.anzeigenVon} bis ${h.anzeigenBis}) und erscheint nicht`);
}

// ── Bilder ─────────────────────────────────────────────────────────────────
const verzeichnis = JSON.parse(readFileSync("data/bilder.json", "utf8")) as Record<string, { alt: string; symbolbild: boolean; nachweis?: { urheber?: string; quelle?: string; lizenz?: string }; quellen: { avif: { url: string }[]; webp: { url: string }[] } }>;
const vorhanden = new Set(readdirSync("public/bilder"));
for (const [id, b] of Object.entries(verzeichnis)) {
  if (!b.alt.trim()) fehler.push(`Bild «${id}»: Alternativtext fehlt`);
  if (!b.nachweis?.urheber || !b.nachweis.quelle || !b.nachweis.lizenz) fehler.push(`Bild «${id}»: Bildnachweis unvollständig`);
  for (const v of [...b.quellen.avif, ...b.quellen.webp]) if (!vorhanden.has(path.basename(v.url))) fehler.push(`Bild «${id}»: Datei fehlt in public/bilder: ${v.url} (npm run bilder)`);
}
const rohInhalte = ["einstellungen", "buffet", "speisekarte", "startseite", "seiten/restaurant"].map((d) => readFileSync(`data/${d}.json`, "utf8")).join("\n");
for (const id of Object.keys(verzeichnis)) if (!rohInhalte.includes(`"${id}"`)) fehler.push(`Bild «${id}» wird nirgends verwendet: aus scripts/bilder-liste.json entfernen oder einsetzen`);

// ── Quellen ────────────────────────────────────────────────────────────────
const mitHerkunft = [["Einstellungen", e.herkunft], ["Öffnungszeiten", o.herkunft], ["Buffet", buffet.herkunft], ["Speisekarte", karte.herkunft], ...e.lieferdienste.map((l) => [`Lieferdienst ${l.name}`, l.herkunft] as const), ...hin.map((h) => [`Hinweis ${h.titel}`, h.herkunft] as const), ["Startseite", start.belege.herkunft], ["Restaurant", restaurant.belege.herkunft]] as const;
for (const [wo, liste] of mitHerkunft) for (const h of liste) if (h.art !== "eigene-angabe" && !h.url) fehler.push(`${wo}: Quelle «${h.quelle}» ohne Adresse`);

if (live) for (const offen of await offeneFreigaben(q)) fehler.push(offen);

for (const h of hinweise) console.log(`· ${h}`);
if (fehler.length) {
  console.error(`✗ ${fehler.length} Problem(e) in den Inhalten:\n` + fehler.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Inhalte in Ordnung: ${texte.length} Texte, ${links.length} Links, ${Object.keys(verzeichnis).length} Bilder, ${gerichteGesamt} Gerichte in ${karte.kategorien.length} Kategorien, ${hin.length} Hinweis(e)${live ? ", alle Freigaben erteilt" : ""}.`);

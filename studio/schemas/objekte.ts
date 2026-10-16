import { defineArrayMember, defineField, defineType } from "sanity";

/** Dieselbe Regel wie lib/assets.ts (istErlaubtesLinkziel): interne Seite, Sprungmarke, https, E-Mail oder Telefon. */
export const linkzielErlaubt = (ziel: string | undefined) => {
  if (!ziel) return true;
  const fehler = "Erlaubt sind interne Seiten («/kontakt/»), Sprungmarken («#anker»), https://-Adressen, mailto: und tel:.";
  if (/[\s\\\u0000-\u001f]/.test(ziel)) return fehler;
  if (/^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%\/-]*(#[A-Za-z][\w-]*)?$/.test(ziel) || /^#[A-Za-z][\w-]*$/.test(ziel) || /^mailto:[^\s@]+@[^\s@]+$/.test(ziel) || /^tel:\+?[\d\s()-]+$/.test(ziel)) return true;
  try { const u = new URL(ziel); return u.protocol === "https:" && !!u.hostname && !u.username ? true : fehler; } catch { return fehler; }
};

/** Schweizer Schreibweise und ruhige Satzzeichen: gilt für alle sichtbaren Texte. */
export const schreibweise = (text: string | undefined) => {
  if (!text) return true;
  if (text.includes("ß")) return "Bitte «ss» statt «ß» schreiben (Schweizer Schreibweise).";
  if (/[—–]/.test(text)) return "Bitte keinen Gedankenstrich verwenden: Satz umstellen oder einen Punkt setzen.";
  return true;
};

/** Uhrzeit «HH:MM» (24 Stunden) */
export const uhrzeit = (wert: string | undefined) => (!wert || /^([01]\d|2[0-3]):[0-5]\d$/.test(wert) ? true : "Uhrzeit als HH:MM, zum Beispiel 16:30");
/** Preis mit höchstens zwei Nachkommastellen */
export const preis = (wert: number | undefined) => (wert === undefined || (wert >= 0 && Math.round(wert * 100) === wert * 100) ? true : "Preis in Franken mit höchstens zwei Nachkommastellen, zum Beispiel 22.5");

export const FREIGABE = defineField({
  name: "freigabe", title: "Freigabe", type: "string",
  description: "«Demo»: von der bisherigen Website übernommen, vom Restaurant noch nicht bestätigt. «Live»: vom Restaurant bestätigt. Erst wenn alles «Live» ist, lässt sich die Website für Suchmaschinen freigeben.",
  options: { list: [{ title: "Demo (übernommen, nicht bestätigt)", value: "demo" }, { title: "Live (vom Restaurant bestätigt)", value: "live" }], layout: "radio" },
  initialValue: "demo", validation: (r) => r.required(),
});

export const verweis = defineType({
  name: "verweis",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "text", title: "Beschriftung", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "ziel", title: "Ziel", type: "string", description: "Interne Seite («/speisekarte/»), Sprungmarke («/speisekarte/#suppen»), https://-Adresse, mailto: oder tel:", validation: (r) => r.required().custom(linkzielErlaubt) }),
  ],
  preview: { select: { title: "text", subtitle: "ziel" } },
});

export const bildMitText = defineType({
  name: "bildMitText",
  title: "Bild",
  type: "image",
  // Kein Hotspot: Die Website rendert Bilder aus dem lokalen Spiegel ohne Ausschnittwahl; ein Hotspot hätte keine Wirkung.
  options: { hotspot: false },
  fields: [
    defineField({ name: "alt", title: "Bildbeschreibung (Alternativtext)", type: "string", description: "Beschreibt, was auf dem Bild zu sehen ist, für Menschen, die es nicht sehen. Zum Beispiel «Grüner Curry mit Poulet in einer blau-weissen Schale».", validation: (r) => r.required().min(5).custom(schreibweise) }),
    defineField({ name: "legende", title: "Bildlegende", type: "string", description: "Kurzer Text unter dem Bild (optional), zum Beispiel die Namen auf einem Gruppenbild.", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "symbolbild", title: "Symbolbild (kein eigenes Foto)", type: "boolean", description: "Nur einschalten, wenn das Bild NICHT aus dem Restaurant stammt (Stock- oder KI-Bild). Es wird dann sichtbar gekennzeichnet.", initialValue: false }),
    defineField({
      name: "nachweis",
      title: "Bildnachweis",
      type: "object",
      description: "Erscheint im Impressum. Bei eigenen Fotos: «Thai Restaurant Suwannaphum», «eigenes Bild», «Alle Rechte vorbehalten».",
      fields: [
        defineField({ name: "urheber", title: "Urheberin oder Urheber", type: "string", validation: (r) => r.required() }),
        defineField({ name: "quelle", title: "Quelle", type: "string", description: "Adresse der Bildquelle oder «eigenes Bild»", validation: (r) => r.required() }),
        defineField({ name: "lizenz", title: "Lizenz oder Nutzungsrecht", type: "string", validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
  ],
});

export const herkunft = defineType({
  name: "herkunft",
  title: "Quelle",
  type: "object",
  fields: [
    defineField({ name: "quelle", title: "Bezeichnung der Quelle", type: "string", description: "Zum Beispiel «Speisekarte, Stand Juli 2026» oder «Bestätigung von Frau Schmied, Telefon vom 3. März»", validation: (r) => r.required().min(3) }),
    defineField({
      name: "url", title: "Adresse der Quelle", type: "url",
      description: "Pflicht bei Website, Speisekarte, Aushang und Plattformprofil. Bei eigenen Angaben des Restaurants darf sie fehlen; dann steht in der Bezeichnung, wer wann bestätigt hat.",
      validation: (r) => r.uri({ scheme: ["https"] }).custom((url, kontext) => (url || (kontext.parent as { art?: string } | undefined)?.art === "eigene-angabe" ? true : "Bitte die Adresse der Quelle angeben.")),
    }),
    defineField({ name: "abgerufen", title: "Abgerufen oder bestätigt am", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "art", title: "Art der Quelle", type: "string",
      description: "Verzeichniseinträge und Bewertungsplattformen sind keine Quelle für Angaben über das Restaurant.",
      options: { list: [{ title: "Bisherige Website des Restaurants", value: "eigene-website" }, { title: "Speisekarte", value: "speisekarte" }, { title: "Aushang oder Plakat", value: "aushang" }, { title: "Profil bei einem Lieferdienst", value: "plattformprofil" }, { title: "Eigene Angabe des Restaurants", value: "eigene-angabe" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "quelle", subtitle: "abgerufen" } },
});

export const belege = defineType({
  name: "belege",
  title: "Belege für die Texte dieser Seite",
  type: "object",
  description: "Die Texte dieser Seite sagen etwas über das Restaurant. Hier steht, worauf sie sich stützen und ob das Restaurant sie bestätigt hat.",
  fields: [
    defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1).error("Mindestens eine Quelle angeben.") }),
    FREIGABE,
  ],
});

export const zeitfenster = defineType({
  name: "zeitfenster",
  title: "Zeitfenster",
  type: "object",
  fields: [
    defineField({ name: "von", title: "Von", type: "string", description: "HH:MM, zum Beispiel 11:00", validation: (r) => r.required().custom(uhrzeit) }),
    defineField({ name: "bis", title: "Bis (Restaurant)", type: "string", description: "HH:MM, zum Beispiel 21:00", validation: (r) => r.required().custom(uhrzeit) }),
    defineField({ name: "kuecheBis", title: "Küche bis (optional)", type: "string", description: "Wenn die Küche früher schliesst als das Restaurant, zum Beispiel 20:30. Leer = gleich wie das Restaurant.", validation: (r) => r.custom(uhrzeit) }),
  ],
  preview: { select: { von: "von", bis: "bis", kueche: "kuecheBis" }, prepare: ({ von, bis, kueche }) => ({ title: `${von ?? "?"} bis ${bis ?? "?"} Uhr`, subtitle: kueche ? `Küche bis ${kueche}` : undefined }) },
});

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
export const tagZeiten = defineType({
  name: "tagZeiten",
  title: "Wochentag",
  type: "object",
  fields: [
    defineField({ name: "tag", title: "Wochentag", type: "number", options: { list: WOCHENTAGE.map((t, i) => ({ title: t, value: i + 1 })) }, validation: (r) => r.required().integer().min(1).max(7) }),
    defineField({ name: "zeiten", title: "Zeitfenster", type: "array", description: "Leer lassen, wenn an diesem Tag geschlossen ist.", of: [defineArrayMember({ type: "zeitfenster" })] }),
  ],
  preview: { select: { tag: "tag", zeiten: "zeiten" }, prepare: ({ tag, zeiten }) => ({ title: WOCHENTAGE[(tag ?? 1) - 1], subtitle: zeiten?.length ? zeiten.map((z: { von: string; bis: string }) => `${z.von} bis ${z.bis}`).join(", ") : "geschlossen" }) },
});

export const gerichtVariante = defineType({
  name: "gerichtVariante",
  title: "Variante mit Preis",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Bezeichnung", type: "string", description: "Zum Beispiel «mit Poulet»", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "preis", title: "Preis in Franken", type: "number", validation: (r) => r.required().custom(preis) }),
  ],
  preview: { select: { title: "name", preis: "preis" }, prepare: ({ title, preis: p }) => ({ title, subtitle: p !== undefined ? `CHF ${Number(p).toFixed(2)}` : "" }) },
});

export const gericht = defineType({
  name: "gericht",
  title: "Gericht",
  type: "object",
  fields: [
    defineField({ name: "nummer", title: "Nummer auf der Karte", type: "string", description: "Wie gedruckt, zum Beispiel «12». Leer lassen, wenn die Karte keine Nummern hat." }),
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "nameThai", title: "Name in Thai-Schrift (optional)", type: "string" }),
    defineField({ name: "beschreibung", title: "Beschreibung oder Zutaten", type: "text", rows: 2, validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "portion", title: "Portionsangabe (optional)", type: "string", description: "Zum Beispiel «4 Stück»" }),
    defineField({ name: "schaerfe", title: "Schärfe (Anzahl Chilis)", type: "number", description: "0 = keine Angabe, 1 bis 3 wie auf der Karte", options: { list: [{ title: "keine Angabe", value: 0 }, { title: "1 Chili", value: 1 }, { title: "2 Chilis", value: 2 }, { title: "3 Chilis", value: 3 }] }, initialValue: 0, validation: (r) => r.required().integer().min(0).max(3) }),
    defineField({ name: "preis", title: "Preis in Franken", type: "number", description: "Leer lassen, wenn der Preis aus einer Preistabelle der Kategorie kommt (zum Beispiel Currys mit Fleisch nach Wahl).", validation: (r) => r.custom(preis) }),
    defineField({ name: "preistabelle", title: "Preistabelle der Kategorie (Schlüssel)", type: "string", description: "Schlüssel der Preistabelle in dieser Kategorie, zum Beispiel «currys». Nur wenn das Gericht keinen eigenen Preis hat." }),
    defineField({ name: "varianten", title: "Varianten mit eigenem Preis", type: "array", description: "Zum Beispiel «mit Poulet CHF 23.00»", of: [defineArrayMember({ type: "gerichtVariante" })] }),
    defineField({ name: "hinweis", title: "Hinweis", type: "string", description: "Zum Beispiel «Telefonische Vorbestellung 3 bis 4 Stunden im Voraus»", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "kennzeichnungen", title: "Bestätigte Kennzeichnungen", type: "array", description: "Nur eintragen, was das Restaurant ausdrücklich bestätigt. Nichts aus den Zutaten ableiten.", of: [defineArrayMember({ type: "string" })], options: { list: [{ title: "vegetarisch", value: "vegetarisch" }, { title: "vegan", value: "vegan" }, { title: "glutenfrei", value: "glutenfrei" }, { title: "laktosefrei", value: "laktosefrei" }] } }),
    defineField({ name: "allergene", title: "Bestätigte Allergene", type: "array", description: "Nur eintragen, was das Restaurant ausdrücklich bestätigt.", of: [defineArrayMember({ type: "string" })], options: { list: ["gluten", "krebstiere", "eier", "fisch", "erdnuesse", "soja", "milch", "schalenfruechte", "sellerie", "senf", "sesam", "sulfite", "lupinen", "weichtiere"].map((a) => ({ title: a, value: a })) } }),
    defineField({ name: "bild", title: "Foto (optional)", type: "bildMitText" }),
  ],
  validation: (r) => r.custom((g: { preis?: number; preistabelle?: string; varianten?: unknown[] } | undefined) => (g && g.preis === undefined && !g.preistabelle && !(g.varianten && g.varianten.length) ? "Ein Gericht braucht einen Preis, eine Preistabelle oder Varianten mit Preis." : true)),
  preview: { select: { nummer: "nummer", title: "name", preis: "preis", media: "bild" }, prepare: ({ nummer, title, preis: p, media }) => ({ title: `${nummer ? nummer + ". " : ""}${title}`, subtitle: p !== undefined ? `CHF ${Number(p).toFixed(2)}` : "Preis laut Tabelle oder Varianten", media }) },
});

export const preistabelle = defineType({
  name: "preistabelle",
  title: "Preistabelle",
  type: "object",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", description: "Zum Beispiel «Preise der Currys 1 bis 5»", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "text", title: "Text (optional)", type: "string", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "varianten", title: "Varianten mit Preis", type: "array", of: [defineArrayMember({ type: "gerichtVariante" })], validation: (r) => r.required().min(1) }),
  ],
  preview: { select: { title: "titel" } },
});

export const lieferdienst = defineType({
  name: "lieferdienst",
  title: "Lieferdienst",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "url", title: "Adresse des Restaurantprofils", type: "url", description: "Die Seite des Restaurants beim Lieferdienst, nie die Startseite der Plattform.", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "hinweis", title: "Hinweis (optional)", type: "string", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1) }),
    FREIGABE,
  ],
  preview: { select: { title: "name", subtitle: "url" } },
});

export const teamMitglied = defineType({
  name: "teamMitglied",
  title: "Teammitglied",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "rolle", title: "Rolle", type: "string", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "text", title: "Text (optional)", type: "text", rows: 3, validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "bild", title: "Foto (optional)", type: "bildMitText" }),
  ],
  preview: { select: { title: "name", subtitle: "rolle", media: "bild" } },
});

/** Kurzform für ein einfaches Pflicht-Textfeld mit Schreibweise-Prüfung (einzeilig, mit `zeilen` mehrzeilig). */
export function text(name: string, title: string, description?: string, zeilen?: number) {
  return zeilen
    ? defineField({ name, title, description, type: "text", rows: zeilen, validation: (r) => r.required().custom(schreibweise) })
    : defineField({ name, title, description, type: "string", validation: (r) => r.required().custom(schreibweise) });
}

export const seoFelder = [
  defineField({ name: "seoTitel", title: "Seitentitel für Suchmaschinen", type: "string", description: "Erscheint im Browser-Tab und in Suchergebnissen. Der Restaurantname wird automatisch angehängt.", group: "seo", validation: (r) => r.max(50).custom(schreibweise) }),
  defineField({ name: "seoBeschreibung", title: "Beschreibung für Suchmaschinen", type: "text", rows: 3, description: "Ein bis zwei Sätze, 50 bis 170 Zeichen.", group: "seo", validation: (r) => r.min(50).max(170).custom(schreibweise) }),
];
export const seoGruppe = [{ name: "inhalt", title: "Inhalt", default: true }, { name: "seo", title: "Suchmaschinen" }];

import { z } from "zod";
import { WOCHENTAGE } from "./konstanten";
import { istErlaubtesLinkziel } from "../assets";

export { WOCHENTAGE };

/**
 * Das eine Domainmodell der Website. Komponenten kennen nur diese Typen.
 * Beide Inhaltsquellen (lokale JSON-Dateien, später Sanity) normalisieren in dieses Modell und werden beim Build
 * gegen diese Schemas geprüft: fehlerhafte Inhalte brechen den Build mit einer klaren Meldung ab.
 *
 * Geschäftsinhalte (Preise, Öffnungszeiten, Küchenzeiten, Buffet, Lieferdienste, Zahlungsmethoden, Hinweise) stehen
 * ausschliesslich hier beschriebenen Inhalten, nie in Komponenten. Jede Angabe über das Restaurant trägt ihre Herkunft
 * (Quelle, Abrufdatum) und einen Freigabestand: «demo» = für die Verkaufs-Demo belegt, «live» = vom Restaurant bestätigt.
 */

// ── Herkunft und Freigabe ──────────────────────────────────────────────────
/** Zugelassene Herkunftsarten. Verzeichniseinträge und Bewertungsplattformen sind keine Quelle für Angaben über das Restaurant. */
export const HERKUNFT_ARTEN = ["eigene-website", "speisekarte", "aushang", "plattformprofil", "eigene-angabe"] as const;
export const herkunftSchema = z
  .object({
    quelle: z.string().min(3),
    /** Adresse der Quelle. Pflicht, ausser bei eigenen Angaben des Restaurants (dann nennt `quelle`, wer wann bestätigt hat). */
    url: z.url().optional(),
    abgerufen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum als JJJJ-MM-TT"),
    art: z.enum(HERKUNFT_ARTEN),
  })
  .refine((h) => h.art === "eigene-angabe" || !!h.url, { message: "Die Quelle braucht eine Adresse (nur bei eigenen Angaben des Restaurants darf sie fehlen).", path: ["url"] });
export type Herkunft = z.infer<typeof herkunftSchema>;

export const freigabeSchema = z.enum(["demo", "live"]);
export type Freigabe = z.infer<typeof freigabeSchema>;

/** Belege für die freien Texte einer Seite oder eines Bereichs: Quellen und Freigabe als Ganzes. */
export const belegeSchema = z.object({ herkunft: z.array(herkunftSchema).min(1, "Mindestens eine Quelle angeben."), freigabe: freigabeSchema });
export type Belege = z.infer<typeof belegeSchema>;

// ── Grundbausteine ─────────────────────────────────────────────────────────
export const linkSchema = z.object({ text: z.string().min(1), ziel: z.string().min(1).refine(istErlaubtesLinkziel, "Linkziel nicht erlaubt (interne Seite, Sprungmarke, https://, mailto: oder tel:)") });
export type Link = z.infer<typeof linkSchema>;

const varianteSchema = z.object({ breite: z.number().int().positive(), url: z.string().min(1) });
export const bildSchema = z.object({
  /** Alternativtext (Pflicht: jedes Bild der Website zeigt etwas) */
  alt: z.string().min(5),
  breite: z.number().int().positive(),
  hoehe: z.number().int().positive(),
  quellen: z.object({ avif: z.array(varianteSchema), webp: z.array(varianteSchema).min(1) }),
  /** true = Symbolbild (Stock- oder KI-Bild), kein Foto des Restaurants. Wird sichtbar gekennzeichnet. Alle Bilder der Demo sind Originale. */
  symbolbild: z.boolean(),
  legende: z.string().optional(),
  nachweis: z.object({ urheber: z.string().min(1), quelle: z.string().min(1), lizenz: z.string().min(1) }),
});
export type Bild = z.infer<typeof bildSchema>;

// Fliesstext (Rechtsseiten, längere Texte)
const inlineSchema = z.union([z.string(), z.object({ text: z.string(), fett: z.boolean().optional(), link: z.string().optional() })]);
export type Inline = z.infer<typeof inlineSchema>;
export const blockSchema = z.discriminatedUnion("art", [
  z.object({ art: z.literal("absatz"), inhalt: z.array(inlineSchema) }),
  z.object({ art: z.literal("titel"), stufe: z.union([z.literal(2), z.literal(3)]), text: z.string().min(1), anker: z.string().optional() }),
  z.object({ art: z.literal("liste"), punkte: z.array(z.array(inlineSchema)).min(1) }),
]);
export type Block = z.infer<typeof blockSchema>;

/** Uhrzeit «HH:MM» (24 Stunden) */
const uhrzeitSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Uhrzeit als HH:MM");
/** Datum «JJJJ-MM-TT», als echter Kalendertag geprüft (kein 31. Februar) */
const datumSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum als JJJJ-MM-TT").refine((d) => { const t = new Date(`${d}T00:00:00Z`); return !Number.isNaN(t.getTime()) && t.toISOString().startsWith(d); }, "Kein gültiger Kalendertag");
/** Preis in Franken mit höchstens zwei Nachkommastellen (als Zahl, formatiert wird in der Oberfläche) */
const preisSchema = z.number().nonnegative().refine((p) => Math.round(p * 100) === p * 100, "Preis mit höchstens zwei Nachkommastellen");

// ── Restaurant (Einstellungen) ─────────────────────────────────────────────
export const lieferdienstSchema = z.object({
  _key: z.string().min(1),
  name: z.string().min(1),
  /** Bestätigtes Restaurantprofil beim Lieferdienst, nie die Startseite der Plattform */
  url: z.string().startsWith("https://"),
  hinweis: z.string().optional(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Lieferdienst = z.infer<typeof lieferdienstSchema>;

export const einstellungenSchema = z.object({
  name: z.string().min(1),
  kurzname: z.string().min(1),
  /** Name in thailändischer Schrift, wie auf dem Holzschild im Restaurant */
  nameThai: z.string().optional(),
  claim: z.string().min(1),
  adresse: z.object({ strasse: z.string(), plz: z.string(), ort: z.string(), land: z.string() }),
  /** Internationales Format «+41 44 555 82 99» */
  telefon: z.string().regex(/^\+41 \d{2} \d{3} \d{2} \d{2}$/, "Telefon als +41 44 555 82 99"),
  /** Keine E-Mail-Adresse bekannt: Kontakt und Reservation laufen telefonisch. Erst eintragen, wenn das Restaurant eine bestätigt. */
  email: z.email().optional(),
  /** Externer Kartenlink (Google Maps). Es wird keine Karte eingebettet. */
  routenlink: z.string().startsWith("https://"),
  reservation: z.object({ text: z.string() }),
  takeaway: z.object({ text: z.string() }),
  lieferdienste: z.array(lieferdienstSchema),
  zahlungsmethoden: z.array(z.object({ _key: z.string(), name: z.string().min(1) })),
  zahlungsmethodenHinweis: z.string().optional(),
  logo: bildSchema,
  /** Ausschnitt der Wortmarke nur mit dem Schriftzug, für die Kopfzeile (optional; sonst steht der Name als Text) */
  logoSchriftzug: bildSchema.optional(),
  seoBild: bildSchema,
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Einstellungen = z.infer<typeof einstellungenSchema>;

// ── Öffnungszeiten und Küchenzeiten ────────────────────────────────────────
/** Ein Zeitfenster; `kuecheBis` ist die separate Küchenzeit (fehlt sie, gilt die Restaurantzeit) */
export const zeitfensterSchema = z
  .object({ _key: z.string(), von: uhrzeitSchema, bis: uhrzeitSchema, kuecheBis: uhrzeitSchema.optional() })
  .refine((z2) => z2.von < z2.bis, { message: "«von» muss vor «bis» liegen", path: ["bis"] })
  .refine((z2) => !z2.kuecheBis || (z2.kuecheBis > z2.von && z2.kuecheBis <= z2.bis), { message: "Küchenschluss liegt ausserhalb des Zeitfensters", path: ["kuecheBis"] });
export type Zeitfenster = z.infer<typeof zeitfensterSchema>;

export const tagSchema = z.object({ tag: z.number().int().min(1).max(7), zeiten: z.array(zeitfensterSchema) });
export type Tag = z.infer<typeof tagSchema>;

export const oeffnungszeitenSchema = z.object({
  zeitzone: z.literal("Europe/Zurich"),
  /** Genau sieben Einträge, Montag bis Sonntag; ein Tag ohne Zeitfenster ist geschlossen */
  tage: z.array(tagSchema).length(7).refine((t) => t.every((x, i) => x.tag === i + 1), "Die Tage müssen von Montag (1) bis Sonntag (7) geordnet sein"),
  /** Regel in Worten, wie sie das Restaurant formuliert («Die Küche schliesst am Abend eine halbe Stunde früher») */
  kuechenHinweis: z.string().optional(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Oeffnungszeiten = z.infer<typeof oeffnungszeitenSchema>;

// ── Zeitlich begrenzte Hinweise (Betriebsferien, Sonderöffnungszeiten, Mitteilungen) ──
export const HINWEIS_ARTEN = ["betriebsferien", "sonderoeffnungszeiten", "mitteilung"] as const;
export const hinweisSchema = z
  .object({
    _key: z.string().min(1),
    art: z.enum(HINWEIS_ARTEN),
    titel: z.string().min(1),
    text: z.string().min(1),
    /** Anzeigefenster: ab wann und bis wann der Hinweis auf der Website erscheint */
    anzeigenVon: datumSchema,
    anzeigenBis: datumSchema,
    /** Nur Betriebsferien und Sonderöffnungszeiten: der betroffene Zeitraum (an diesen Tagen gelten die regulären Zeiten nicht) */
    geschlossenVon: datumSchema.optional(),
    geschlossenBis: datumSchema.optional(),
    /** Nur Betriebsferien: Uhrzeit, ab der das Restaurant am ersten Tag schliesst (davor gelten die regulären Zeiten) */
    geschlossenAb: uhrzeitSchema.optional(),
    /** Nur Sonderöffnungszeiten: die Zeitfenster, die an den betroffenen Tagen gelten (leer = geschlossen) */
    zeiten: z.array(zeitfensterSchema).optional(),
    herkunft: z.array(herkunftSchema).min(1),
    freigabe: freigabeSchema,
  })
  .refine((h) => h.anzeigenVon <= h.anzeigenBis, { message: "«anzeigenBis» liegt vor «anzeigenVon»", path: ["anzeigenBis"] })
  .refine((h) => !h.geschlossenAb || h.art === "betriebsferien", { message: "«geschlossenAb» gibt es nur bei Betriebsferien", path: ["geschlossenAb"] })
  .refine((h) => !h.zeiten || h.art === "sonderoeffnungszeiten", { message: "«zeiten» gibt es nur bei Sonderöffnungszeiten", path: ["zeiten"] })
  .refine((h) => !h.geschlossenVon || !h.geschlossenBis || h.geschlossenVon <= h.geschlossenBis, { message: "«geschlossenBis» liegt vor «geschlossenVon»", path: ["geschlossenBis"] })
  .refine((h) => h.art === "mitteilung" || (!!h.geschlossenVon && !!h.geschlossenBis), { message: "Betriebsferien und Sonderöffnungszeiten brauchen den betroffenen Zeitraum", path: ["geschlossenVon"] });
export type Hinweis = z.infer<typeof hinweisSchema>;

// ── Mittagsbuffet ──────────────────────────────────────────────────────────
export const buffetSchema = z.object({
  titel: z.string().min(1),
  untertitel: z.string().optional(),
  text: z.string().min(1),
  /** Wochentage (ISO 1 bis 7), an denen das Buffet steht */
  tage: z.array(z.number().int().min(1).max(7)).min(1),
  von: uhrzeitSchema,
  bis: uhrzeitSchema,
  angebote: z.array(z.object({ _key: z.string(), titel: z.string().min(1), preis: preisSchema, inklusive: z.string().optional(), hinweis: z.string().optional() })).min(1),
  /** «ab»: der Grundpreis ist der tiefste Preis, weitere Angebote sind möglich */
  abPreis: z.boolean(),
  bild: bildSchema.optional(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Buffet = z.infer<typeof buffetSchema>;

// ── Speisekarte ────────────────────────────────────────────────────────────
/** Nur ausdrücklich vom Restaurant bestätigte Kennzeichnungen. Aus Zutatenlisten wird nichts abgeleitet. */
export const KENNZEICHNUNGEN = ["vegetarisch", "vegan", "glutenfrei", "laktosefrei"] as const;
export const ALLERGENE = ["gluten", "krebstiere", "eier", "fisch", "erdnuesse", "soja", "milch", "schalenfruechte", "sellerie", "senf", "sesam", "sulfite", "lupinen", "weichtiere"] as const;

export const gerichtVarianteSchema = z.object({ _key: z.string(), name: z.string().min(1), preis: preisSchema });
export type GerichtVariante = z.infer<typeof gerichtVarianteSchema>;

export const gerichtSchema = z.object({
  _key: z.string().min(1),
  /** Nummer auf der Karte, wie gedruckt (Zeichenkette, damit «6a» möglich bleibt) */
  nummer: z.string().optional(),
  name: z.string().min(1),
  /** Name in thailändischer Schrift (Thai Specials, Thai-Tee) */
  nameThai: z.string().optional(),
  beschreibung: z.string().optional(),
  /** Portionsangabe, wie gedruckt («4 St.») */
  portion: z.string().optional(),
  /** 0 = keine Angabe, 1 bis 3 = Anzahl Chilis auf der Karte */
  schaerfe: z.number().int().min(0).max(3),
  /** Grundpreis. Fehlt er, gilt eine Preistabelle der Kategorie (`preistabelle`) oder nur `varianten`. */
  preis: preisSchema.optional(),
  /** Schlüssel einer Preistabelle der Kategorie (z. B. Currys mit Fleisch oder Gemüse nach Wahl) */
  preistabelle: z.string().optional(),
  /** Zusätzliche Varianten mit eigenem Preis («mit Poulet», «mit Crevetten») */
  varianten: z.array(gerichtVarianteSchema).optional(),
  /** Hinweis, wie gedruckt («telefonische Vorbestellung 3 bis 4 Stunden im Voraus») */
  hinweis: z.string().optional(),
  /** Vom Restaurant bestätigte Kennzeichnungen und Allergene (Demo: leer) */
  kennzeichnungen: z.array(z.enum(KENNZEICHNUNGEN)),
  allergene: z.array(z.enum(ALLERGENE)),
  bild: bildSchema.optional(),
}).refine((g) => g.preis !== undefined || g.preistabelle || (g.varianten && g.varianten.length > 0), { message: "Ein Gericht braucht einen Preis, eine Preistabelle oder Varianten mit Preis", path: ["preis"] });
export type Gericht = z.infer<typeof gerichtSchema>;

export const preistabelleSchema = z.object({
  _key: z.string().min(1),
  titel: z.string().min(1),
  text: z.string().optional(),
  varianten: z.array(gerichtVarianteSchema).min(1),
});
export type Preistabelle = z.infer<typeof preistabelleSchema>;

export const kategorieSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string().min(1),
  titelThai: z.string().optional(),
  untertitel: z.string().optional(),
  /** Hinweis am Kopf der Kategorie (z. B. Verfügbarkeit des Special Menu) */
  einleitung: z.string().optional(),
  /** true = die Karte liegt im Original nur in thailändischer Schrift vor; Umschrift und Erklärung sind eine Arbeitsübersetzung */
  uebersetzungVorlaeufig: z.boolean(),
  gerichte: z.array(gerichtSchema).min(1),
  preistabellen: z.array(preistabelleSchema),
  /** Zusätze mit Aufpreis (andere Beilagen) */
  zusaetze: z.array(gerichtVarianteSchema),
  /** Fussnote, wie gedruckt (Beilagen, Zutaten der Tamarindensauce) */
  fussnote: z.string().optional(),
  reihenfolge: z.number(),
}).refine((k) => k.gerichte.every((g) => !g.preistabelle || k.preistabellen.some((p) => p._key === g.preistabelle)), { message: "Ein Gericht verweist auf eine Preistabelle, die es in dieser Kategorie nicht gibt", path: ["gerichte"] });
export type Kategorie = z.infer<typeof kategorieSchema>;

export const speisekarteSchema = z.object({
  titel: z.string().min(1),
  einleitung: z.string().min(1),
  kategorien: z.array(kategorieSchema).min(1),
  schaerfe: z.object({ titel: z.string(), text: z.string(), stufen: z.array(z.object({ grad: z.number().int().min(1).max(3), text: z.string() })).length(3) }),
  deklaration: z.object({ titel: z.string(), einleitung: z.string().optional(), eintraege: z.array(z.object({ _key: z.string(), produkt: z.string().min(1), land: z.string().min(1) })) }),
  /** Hinweis zu Kennzeichnungen und Allergenen (ehrlich: nichts abgeleitet, Auskunft im Restaurant) */
  allergenTitel: z.string(),
  allergenHinweis: z.string(),
  /** Original-PDF zum Download, falls vorhanden (die Quelle hat nur Bilder: leer) */
  pdf: z.object({ url: z.string().min(1), titel: z.string() }).optional(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
  seoTitel: z.string().optional(),
  seoBeschreibung: z.string().optional(),
});
export type Speisekarte = z.infer<typeof speisekarteSchema>;

// ── Seiten ─────────────────────────────────────────────────────────────────
const seoSchema = { seoTitel: z.string().max(50).optional(), seoBeschreibung: z.string().min(50).max(170).optional() };

export const startseiteSchema = z.object({
  hero: z.object({ titel: z.string().min(1), text: z.string().min(1), knopf: linkSchema, zweiterKnopf: linkSchema, bild: bildSchema }),
  heute: z.object({ titel: z.string(), geschlossen: z.string(), kueche: z.string() }),
  buffet: z.object({ titel: z.string() }),
  speisekarte: z.object({ titel: z.string(), text: z.string(), knopf: linkSchema, kacheln: z.array(z.object({ _key: z.string(), titel: z.string(), text: z.string(), kategorie: z.string(), bild: bildSchema })).min(1) }),
  specials: z.object({ titel: z.string(), text: z.string(), kategorie: z.string(), knopf: linkSchema }),
  restaurant: z.object({ titel: z.string(), text: z.string(), knopf: linkSchema, bilder: z.array(bildSchema).min(1) }),
  takeaway: z.object({ titel: z.string(), text: z.string(), bild: bildSchema.optional() }),
  kontakt: z.object({ titel: z.string(), text: z.string() }),
  belege: belegeSchema,
  ...seoSchema,
});
export type Startseite = z.infer<typeof startseiteSchema>;

export const teamMitgliedSchema = z.object({
  _key: z.string(),
  name: z.string().min(1),
  rolle: z.string().optional(),
  text: z.string().optional(),
  bild: bildSchema.optional(),
});
export type TeamMitglied = z.infer<typeof teamMitgliedSchema>;

export const restaurantSeiteSchema = z.object({
  titel: z.string().min(1),
  einleitung: z.string().min(1),
  bild: bildSchema,
  geschichte: z.object({ titel: z.string(), absaetze: z.array(z.string().min(1)).min(1) }),
  name: z.object({ titel: z.string(), text: z.string() }).optional(),
  team: z.object({ titel: z.string(), text: z.string().optional(), mitglieder: z.array(teamMitgliedSchema).min(1), gruppenbild: bildSchema.optional() }),
  einblicke: z.object({ titel: z.string(), text: z.string().optional(), bilder: z.array(bildSchema).min(1) }),
  aufruf: z.object({ titel: z.string(), text: z.string(), knopf: linkSchema }),
  belege: belegeSchema,
  ...seoSchema,
});
export type RestaurantSeite = z.infer<typeof restaurantSeiteSchema>;

export const kontaktSeiteSchema = z.object({
  titel: z.string().min(1),
  einleitung: z.string().min(1),
  reservationTitel: z.string(),
  takeawayTitel: z.string(),
  lieferdiensteTitel: z.string(),
  lieferdiensteText: z.string(),
  zahlungTitel: z.string(),
  anfahrtTitel: z.string(),
  anfahrtText: z.string(),
  oeffnungszeitenTitel: z.string(),
  belege: belegeSchema,
  ...seoSchema,
});
export type KontaktSeite = z.infer<typeof kontaktSeiteSchema>;

export const rechtSeiteSchema = z.object({
  slug: z.enum(["impressum", "datenschutz"]),
  titel: z.string().min(1),
  einleitung: z.string().optional(),
  stand: z.string().min(1),
  bloecke: z.array(blockSchema).min(1),
  ...seoSchema,
});
export type RechtSeite = z.infer<typeof rechtSeiteSchema>;

// ── Wiederkehrende Texte (Navigation, Kopf, Fuss, Oberfläche, Einwilligung) ──
export const texteSchema = z.object({
  demoHinweis: z.string(),
  navigation: z.array(linkSchema).min(1),
  /** Ein Ziel, eine Beschriftung: die drei Aufrufe der Website */
  aufrufe: z.object({ speisekarte: linkSchema, reservieren: z.object({ text: z.string() }), takeaway: z.object({ text: z.string() }) }),
  kopf: z.object({ zusatz: z.string(), navTitel: z.string(), startseite: z.string(), telefonLabel: z.string(), menueKnopf: z.string(), menueTitel: z.string(), schliessen: z.string() }),
  mobilLeiste: z.object({ titel: z.string(), speisekarte: z.string(), anrufen: z.string() }),
  footer: z.object({ leitsatz: z.string(), kontaktTitel: z.string(), zeitenTitel: z.string(), seitenTitel: z.string(), rechtlichesTitel: z.string(), rechtliches: z.array(linkSchema), route: z.string(), bildnachweis: linkSchema, copyright: z.string(), demoHinweis: z.string() }),
  ui: z.object({
    zumInhalt: z.string(), symbolbild: z.string(), telefon: z.string(), adresse: z.string(), route: z.string(),
    preisWaehrung: z.string(), preisAb: z.string(), schaerfeLabel: z.string(), nummerLabel: z.string(), kategorienTitel: z.string(),
    geschlossen: z.string(), kuecheBis: z.string(), heuteLabel: z.string(), uhr: z.string(), bestellenBei: z.string(),
    nichtGefundenTitel: z.string(), nichtGefundenText: z.string(), nichtGefundenLink: linkSchema, fehler404: z.string(),
    quellenTitel: z.string(), uebersetzungHinweis: z.string(), wann: z.string(), hinweiseTitel: z.string(), allergeneLabel: z.string(),
  }),
  einwilligung: z.object({
    fussLink: z.string(), ruhendTitel: z.string(), ruhendText: z.string(),
    bannerTitel: z.string(), bannerText: z.string(), alleAkzeptieren: z.string(), nurNotwendige: z.string(), einstellungen: z.string(),
    auswahlSpeichern: z.string(), widerrufen: z.string(), notwendigTitel: z.string(), notwendigText: z.string(), datenschutzerklaerung: z.string(),
    /** Leer = keine einwilligungspflichtigen Dienste: kein Banner. Mit Einträgen wird der Banner aktiv. */
    kategorien: z.array(z.object({ kennung: z.string().regex(/^[a-z]+$/), titel: z.string(), beschreibung: z.string() })),
  }),
  seo: z.object({ titelZusatz: z.string(), beschreibung: z.string().min(50).max(170) }),
  /** Belege für die Texte, die etwas über das Restaurant sagen (Leitsatz, Standardbeschreibung) */
  belege: belegeSchema,
});
export type Texte = z.infer<typeof texteSchema>;

// ── Schnittstelle der Inhaltsquellen ───────────────────────────────────────
export interface Inhaltsquelle {
  getEinstellungen(): Promise<Einstellungen>;
  getOeffnungszeiten(): Promise<Oeffnungszeiten>;
  getHinweise(): Promise<Hinweis[]>;
  getBuffet(): Promise<Buffet>;
  getSpeisekarte(): Promise<Speisekarte>;
  getTexte(): Promise<Texte>;
  getStartseite(): Promise<Startseite>;
  getRestaurantSeite(): Promise<RestaurantSeite>;
  getKontaktSeite(): Promise<KontaktSeite>;
  getRechtSeite(slug: "impressum" | "datenschutz"): Promise<RechtSeite>;
  /** Alle Bilder mit Nachweis, für den Bildnachweis im Impressum */
  getBildnachweise(): Promise<{ titel: string; urheber: string; quelle: string; lizenz: string }[]>;
}

export { pfade } from "./pfade";

/** Prüft Daten gegen ein Schema und meldet Fehler mit Fundstelle, damit der Build verständlich abbricht. */
export function pruefen<T>(schema: z.ZodType<T>, daten: unknown, wo: string): T {
  const ergebnis = schema.safeParse(daten);
  if (ergebnis.success) return ergebnis.data;
  const zeilen = ergebnis.error.issues.slice(0, 12).map((i) => `  - ${i.path.join(".") || "(Wurzel)"}: ${i.message}`);
  throw new Error(`Inhalt ungültig (${wo}):\n${zeilen.join("\n")}`);
}

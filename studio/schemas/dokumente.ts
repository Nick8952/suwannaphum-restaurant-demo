import { defineArrayMember, defineField, defineType } from "sanity";
import { FREIGABE, preis, schreibweise, seoFelder, seoGruppe, text, uhrzeit } from "./objekte";

const quellen = defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1).error("Mindestens eine Quelle angeben.") });
const reihenfolge = defineField({ name: "reihenfolge", title: "Reihenfolge", type: "number", description: "Kleinere Zahlen stehen weiter vorne (10, 20, 30 lässt Platz für Einschübe).", initialValue: 100, validation: (r) => r.required() });
const datum = (name: string, title: string, description?: string) => defineField({ name, title, description, type: "date", options: { dateFormat: "DD.MM.YYYY" } });

// ── Restaurant und Kontakt ─────────────────────────────────────────────────
export const einstellungen = defineType({
  name: "einstellungen",
  title: "Restaurant und Kontakt",
  type: "document",
  groups: [{ name: "restaurant", title: "Restaurant", default: true }, { name: "kontakt", title: "Kontakt und Reservation" }, { name: "dienste", title: "Lieferdienste und Zahlung" }, { name: "bilder", title: "Logo und Vorschaubild" }, { name: "quellen", title: "Quellen und Freigabe" }],
  fields: [
    defineField({ name: "name", title: "Name des Restaurants", type: "string", group: "restaurant", validation: (r) => r.required() }),
    defineField({ name: "kurzname", title: "Kurzname", type: "string", group: "restaurant", validation: (r) => r.required() }),
    defineField({ name: "nameThai", title: "Name in Thai-Schrift (optional)", type: "string", group: "restaurant" }),
    defineField({ name: "claim", title: "Leitzeile", type: "string", description: "Erscheint im Titel der Startseite, zum Beispiel «Thai-Küche in Schlieren».", group: "restaurant", validation: (r) => r.required().custom(schreibweise) }),
    defineField({
      name: "adresse", title: "Adresse", type: "object", group: "kontakt",
      fields: [
        defineField({ name: "strasse", title: "Strasse und Nummer", type: "string", validation: (r) => r.required() }),
        defineField({ name: "plz", title: "Postleitzahl", type: "string", validation: (r) => r.required().regex(/^\d{4}$/, { name: "vierstellige Postleitzahl" }) }),
        defineField({ name: "ort", title: "Ort", type: "string", validation: (r) => r.required() }),
        defineField({ name: "land", title: "Land", type: "string", initialValue: "Schweiz", validation: (r) => r.required() }),
      ],
    }),
    defineField({ name: "telefon", title: "Telefon", type: "string", description: "Im internationalen Format: +41 44 555 82 99. Die Website zeigt daraus «044 555 82 99».", group: "kontakt", validation: (r) => r.required().regex(/^\+41 \d{2} \d{3} \d{2} \d{2}$/, { name: "Format +41 44 123 45 67" }) }),
    defineField({ name: "email", title: "E-Mail (optional)", type: "string", description: "Nur eintragen, wenn das Restaurant Anfragen per E-Mail wünscht. Leer = Kontakt nur telefonisch.", group: "kontakt", validation: (r) => r.email() }),
    defineField({ name: "routenlink", title: "Link zur Route (Google Maps)", type: "url", description: "Öffnet sich in einem neuen Fenster. Es wird keine Karte eingebettet.", group: "kontakt", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "reservation", title: "Reservation", type: "object", group: "kontakt", fields: [text("text", "Text", "Wie reserviert man? Die Website bietet keine Online-Reservation.", 2)] }),
    defineField({ name: "takeaway", title: "Take-away", type: "object", group: "kontakt", fields: [text("text", "Text", undefined, 2)] }),
    defineField({ name: "lieferdienste", title: "Lieferdienste", type: "array", group: "dienste", description: "Nur bestätigte Restaurantprofile, nie die Startseite einer Plattform.", of: [defineArrayMember({ type: "lieferdienst" })] }),
    defineField({ name: "zahlungsmethoden", title: "Zahlungsmethoden", type: "array", group: "dienste", of: [defineArrayMember({ type: "object", name: "zahlungsmethode", fields: [defineField({ name: "name", title: "Bezeichnung", type: "string", validation: (r) => r.required() })], preview: { select: { title: "name" } } })] }),
    defineField({ name: "zahlungsmethodenHinweis", title: "Hinweis zu den Zahlungsmethoden (optional)", type: "string", group: "dienste", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "logo", title: "Logo oder Wortmarke", type: "bildMitText", group: "bilder", validation: (r) => r.required() }),
    defineField({ name: "logoSchriftzug", title: "Schriftzug für die Kopfzeile (optional)", type: "bildMitText", description: "Schmaler Ausschnitt mit dem Schriftzug. Fehlt er, steht der Name als Text in der Kopfzeile.", group: "bilder" }),
    defineField({ name: "seoBild", title: "Vorschaubild für geteilte Links", type: "bildMitText", description: "1200 × 630 Pixel. Erscheint, wenn die Website in WhatsApp, LinkedIn usw. geteilt wird.", group: "bilder", validation: (r) => r.required() }),
    { ...quellen, group: "quellen" },
    { ...FREIGABE, group: "quellen" },
  ],
  preview: { select: { title: "name", subtitle: "telefon", media: "logo" } },
});

// ── Öffnungszeiten ─────────────────────────────────────────────────────────
export const oeffnungszeiten = defineType({
  name: "oeffnungszeiten",
  title: "Öffnungszeiten und Küchenzeiten",
  type: "document",
  description: "Ein Eintrag je Wochentag, Montag bis Sonntag. Ein Tag ohne Zeitfenster ist geschlossen. Die Küchenzeit steht im Zeitfenster.",
  fields: [
    defineField({ name: "zeitzone", title: "Zeitzone", type: "string", initialValue: "Europe/Zurich", readOnly: true, validation: (r) => r.required() }),
    defineField({ name: "tage", title: "Wochentage", type: "array", of: [defineArrayMember({ type: "tagZeiten" })], validation: (r) => r.required().length(7).custom((tage: { tag?: number }[] | undefined) => (tage && tage.every((t, i) => t.tag === i + 1) ? true : "Bitte genau sieben Einträge, geordnet von Montag (1) bis Sonntag (7).")) }),
    defineField({ name: "kuechenHinweis", title: "Hinweis zur Küche (optional)", type: "string", description: "Zum Beispiel «Die Küche schliesst am Abend eine halbe Stunde früher als das Restaurant.»", validation: (r) => r.custom(schreibweise) }),
    quellen,
    FREIGABE,
  ],
  preview: { prepare: () => ({ title: "Öffnungszeiten und Küchenzeiten" }) },
});

// ── Zeitlich begrenzte Hinweise ────────────────────────────────────────────
export const hinweis = defineType({
  name: "hinweis",
  title: "Hinweis (befristet)",
  type: "document",
  description: "Betriebsferien, Sonderöffnungszeiten oder Mitteilungen mit Anfangs- und Enddatum. Nach dem Enddatum verschwindet der Hinweis von selbst.",
  fields: [
    defineField({ name: "art", title: "Art", type: "string", options: { list: [{ title: "Betriebsferien", value: "betriebsferien" }, { title: "Sonderöffnungszeiten", value: "sonderoeffnungszeiten" }, { title: "Mitteilung", value: "mitteilung" }], layout: "radio" }, initialValue: "mitteilung", validation: (r) => r.required() }),
    text("titel", "Titel"),
    text("text", "Text", "Zum Beispiel «Vom 30. April bis 16. Mai bleibt das Restaurant geschlossen. Ab 18. Mai sind wir wieder da.»", 3),
    { ...datum("anzeigenVon", "Anzeigen ab", "Ab diesem Tag erscheint der Hinweis auf der Website."), validation: (r) => r.required() },
    { ...datum("anzeigenBis", "Anzeigen bis", "Letzter Tag, an dem der Hinweis erscheint."), validation: (r) => r.required() },
    datum("geschlossenVon", "Betroffen von", "Nur Betriebsferien und Sonderöffnungszeiten: erster betroffener Tag."),
    datum("geschlossenBis", "Betroffen bis", "Nur Betriebsferien und Sonderöffnungszeiten: letzter betroffener Tag."),
    defineField({ name: "geschlossenAb", title: "Am ersten Tag geschlossen ab (optional)", type: "string", description: "Nur Betriebsferien: Uhrzeit HH:MM, ab der das Restaurant am ersten Tag schliesst. Leer = der ganze Tag.", validation: (r) => r.custom(uhrzeit) }),
    defineField({ name: "zeiten", title: "Zeitfenster an diesen Tagen", type: "array", description: "Nur Sonderöffnungszeiten: die Zeiten, die an den betroffenen Tagen gelten. Leer = geschlossen.", of: [defineArrayMember({ type: "zeitfenster" })] }),
    quellen,
    FREIGABE,
  ],
  validation: (r) => r.custom((dok) => {
    const h = dok as { art?: string; anzeigenVon?: string; anzeigenBis?: string; geschlossenVon?: string; geschlossenBis?: string; geschlossenAb?: string; zeiten?: unknown[] } | undefined;
    if (!h) return true;
    if (h.geschlossenAb && h.art !== "betriebsferien") return "«Am ersten Tag geschlossen ab» gibt es nur bei Betriebsferien.";
    if (h.zeiten?.length && h.art !== "sonderoeffnungszeiten") return "Zeitfenster gibt es nur bei Sonderöffnungszeiten (bei anderen Arten alle Einträge entfernen).";
    if (h.anzeigenVon && h.anzeigenBis && h.anzeigenVon > h.anzeigenBis) return "«Anzeigen bis» liegt vor «Anzeigen ab».";
    if (h.art !== "mitteilung" && (!h.geschlossenVon || !h.geschlossenBis)) return "Betriebsferien und Sonderöffnungszeiten brauchen «Geschlossen von» und «Geschlossen bis».";
    if (h.geschlossenVon && h.geschlossenBis && h.geschlossenVon > h.geschlossenBis) return "«Geschlossen bis» liegt vor «Geschlossen von».";
    return true;
  }),
  preview: { select: { title: "titel", von: "anzeigenVon", bis: "anzeigenBis" }, prepare: ({ title, von, bis }) => ({ title, subtitle: `sichtbar ${von ?? "?"} bis ${bis ?? "?"}` }) },
});

// ── Mittagsbuffet ──────────────────────────────────────────────────────────
export const buffet = defineType({
  name: "buffet",
  title: "Mittagsbuffet",
  type: "document",
  fields: [
    text("titel", "Titel"),
    defineField({ name: "untertitel", title: "Untertitel (optional)", type: "string", validation: (r) => r.custom(schreibweise) }),
    text("text", "Text", undefined, 3),
    defineField({ name: "tage", title: "Wochentage", type: "array", of: [defineArrayMember({ type: "number" })], options: { list: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"].map((t, i) => ({ title: t, value: i + 1 })) }, validation: (r) => r.required().min(1) }),
    defineField({ name: "von", title: "Von", type: "string", description: "HH:MM", validation: (r) => r.required().custom(uhrzeit) }),
    defineField({ name: "bis", title: "Bis", type: "string", description: "HH:MM", validation: (r) => r.required().custom(uhrzeit) }),
    defineField({ name: "abPreis", title: "Preis als «ab»-Preis anzeigen", type: "boolean", description: "Einschalten, wenn der Grundpreis der tiefste Preis ist und weitere Angebote möglich sind.", initialValue: false }),
    defineField({ name: "angebote", title: "Angebote und Preise", type: "array", of: [defineArrayMember({ type: "object", name: "buffetAngebot", fields: [text("titel", "Bezeichnung", "Zum Beispiel «pro Person»"), defineField({ name: "preis", title: "Preis in Franken", type: "number", validation: (r) => r.required().custom(preis) }), defineField({ name: "inklusive", title: "Inbegriffen (optional)", type: "string", description: "Zum Beispiel «inklusive eines alkoholfreien Getränks»", validation: (r) => r.custom(schreibweise) }), defineField({ name: "hinweis", title: "Hinweis (optional)", type: "string", validation: (r) => r.custom(schreibweise) })], preview: { select: { title: "titel", preis: "preis" }, prepare: ({ title, preis: p }) => ({ title, subtitle: p !== undefined ? `CHF ${Number(p).toFixed(2)}` : "" }) } })], validation: (r) => r.required().min(1) }),
    defineField({ name: "bild", title: "Foto (optional)", type: "bildMitText" }),
    quellen,
    FREIGABE,
  ],
  preview: { select: { title: "titel", media: "bild" } },
});

// ── Speisekarte ────────────────────────────────────────────────────────────
export const speisekarte = defineType({
  name: "speisekarte",
  title: "Speisekarte (Allgemeines)",
  type: "document",
  description: "Einleitung, Schärfe, Deklaration und Hinweise. Die Gerichte stehen in den Kategorien.",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("einleitung", "Einleitung", undefined, 2), group: "inhalt" },
    defineField({ name: "schaerfe", title: "Schärfe", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 2), defineField({ name: "stufen", title: "Stufen", type: "array", of: [defineArrayMember({ type: "object", name: "schaerfeStufe", fields: [defineField({ name: "grad", title: "Chilis", type: "number", validation: (r) => r.required().integer().min(1).max(3) }), text("text", "Bedeutung")], preview: { select: { grad: "grad", text: "text" }, prepare: ({ grad, text: t }) => ({ title: `${grad} Chili(s): ${t}` }) } })], validation: (r) => r.required().length(3) })] }),
    defineField({ name: "deklaration", title: "Deklaration Fleisch, Fisch, Eier", type: "object", group: "inhalt", fields: [text("titel", "Titel"), defineField({ name: "einleitung", title: "Einleitung (optional)", type: "string", validation: (r) => r.custom(schreibweise) }), defineField({ name: "eintraege", title: "Einträge", type: "array", of: [defineArrayMember({ type: "object", name: "deklarationEintrag", fields: [text("produkt", "Produkt"), text("land", "Herkunftsland")], preview: { select: { title: "produkt", subtitle: "land" } } })] })] }),
    { ...text("allergenTitel", "Titel «Allergene und Ernährung»"), group: "inhalt" },
    { ...text("allergenHinweis", "Hinweis zu Allergenen", "Ehrlich formulieren: Die Karte kennzeichnet keine Allergene; Auskunft gibt das Restaurant.", 2), group: "inhalt" },
    defineField({ name: "pdf", title: "Speisekarte als PDF (optional)", type: "object", group: "inhalt", fields: [defineField({ name: "url", title: "Adresse der PDF-Datei", type: "string", validation: (r) => r.required() }), text("titel", "Beschriftung des Links")] }),
    { ...quellen, group: "inhalt" },
    { ...FREIGABE, group: "inhalt" },
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Speisekarte (Allgemeines)" }) },
});

export const kategorie = defineType({
  name: "kategorie",
  title: "Kategorie der Speisekarte",
  type: "document",
  fields: [
    text("titel", "Titel", "Zum Beispiel «Hauptgerichte»"),
    defineField({ name: "slug", title: "Adresse (Sprungmarke)", type: "slug", description: "Wird aus dem Titel erzeugt. Nach der Veröffentlichung nicht mehr ändern, sonst brechen Links.", options: { source: "titel", maxLength: 40 }, validation: (r) => r.required() }),
    defineField({ name: "titelThai", title: "Titel in Thai-Schrift (optional)", type: "string" }),
    defineField({ name: "untertitel", title: "Untertitel (optional)", type: "string", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "einleitung", title: "Einleitung (optional)", type: "text", rows: 2, description: "Zum Beispiel die Verfügbarkeit des Special Menu.", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "uebersetzungVorlaeufig", title: "Übersetzung vorläufig", type: "boolean", description: "Einschalten, wenn die Karte im Original in Thai-Schrift vorliegt und Umschrift und Erklärung noch zu bestätigen sind. Die Website zeigt dann einen Hinweis.", initialValue: false }),
    defineField({ name: "gerichte", title: "Gerichte", type: "array", of: [defineArrayMember({ type: "gericht" })], validation: (r) => r.required().min(1) }),
    defineField({ name: "preistabellen", title: "Preistabellen", type: "array", description: "Für Gerichte ohne eigenen Preis (zum Beispiel Currys mit Fleisch nach Wahl). Der Schlüssel steht nach dem Speichern in der Adressleiste des Eintrags.", of: [defineArrayMember({ type: "preistabelle" })] }),
    defineField({ name: "zusaetze", title: "Zusätze mit Aufpreis", type: "array", description: "Zum Beispiel «gebratener Reis + CHF 3.00»", of: [defineArrayMember({ type: "gerichtVariante" })] }),
    defineField({ name: "fussnote", title: "Fussnote (optional)", type: "text", rows: 2, description: "Zum Beispiel die Beilage oder die Zutaten einer Sauce.", validation: (r) => r.custom(schreibweise) }),
    reihenfolge,
  ],
  preview: { select: { title: "titel", gerichte: "gerichte", reihenfolge: "reihenfolge" }, prepare: ({ title, gerichte, reihenfolge: r }) => ({ title, subtitle: `${gerichte?.length ?? 0} Gerichte · Reihenfolge ${r ?? ""}` }) },
});

// ── Navigation, Fusszeile und kleine Texte ─────────────────────────────────
export const texte = defineType({
  name: "texte",
  title: "Navigation, Fusszeile und kleine Texte",
  type: "document",
  groups: [{ name: "navigation", title: "Navigation", default: true }, { name: "fuss", title: "Fusszeile" }, { name: "ui", title: "Kleine Texte" }, { name: "einwilligung", title: "Datenschutz-Einstellungen" }, { name: "seo", title: "Suchmaschinen" }],
  fields: [
    defineField({ name: "demoHinweis", title: "Hinweis «Entwurf»", type: "string", description: "Schmale Zeile über der Kopfzeile. Sie erscheint nur, solange die Website nicht für Suchmaschinen freigegeben ist.", group: "navigation" }),
    defineField({ name: "navigation", title: "Seiten in der Navigation", type: "array", of: [defineArrayMember({ type: "verweis" })], group: "navigation", validation: (r) => r.required().min(1).max(5) }),
    defineField({
      name: "aufrufe", title: "Die drei Aufrufe", type: "object", group: "navigation", description: "Ein Ziel, eine Beschriftung: Diese Texte stehen überall gleich.",
      fields: [
        defineField({ name: "speisekarte", title: "Zur Speisekarte", type: "verweis", validation: (r) => r.required() }),
        defineField({ name: "reservieren", title: "Reservieren (Telefon)", type: "object", fields: [text("text", "Beschriftung")] }),
        defineField({ name: "takeaway", title: "Take-away (Telefon)", type: "object", fields: [text("text", "Beschriftung")] }),
      ],
    }),
    defineField({ name: "kopf", title: "Kopfzeile", type: "object", group: "navigation", fields: [text("zusatz", "Zusatz neben dem Schriftzug", "Zum Beispiel «Thai Restaurant»; der Ort kommt aus der Adresse."), text("navTitel", "Name der Navigation (für Screenreader)"), text("startseite", "Beschriftung «Startseite»"), text("telefonLabel", "Beschriftung des Telefon-Links"), text("menueKnopf", "Knopf «Menü» (Handy)"), text("menueTitel", "Titel des Menüs"), text("schliessen", "Knopf «Schliessen»")] }),
    defineField({ name: "mobilLeiste", title: "Mobile Leiste", type: "object", group: "navigation", fields: [text("titel", "Name der Leiste (für Screenreader)"), text("speisekarte", "Beschriftung «Speisekarte»"), text("anrufen", "Beschriftung «Anrufen»")] }),
    defineField({
      name: "footer", title: "Fusszeile", type: "object", group: "fuss",
      fields: [
        text("leitsatz", "Leitsatz"), text("kontaktTitel", "Titel «Kontakt»"), text("zeitenTitel", "Titel «Öffnungszeiten»"), text("seitenTitel", "Titel «Seiten»"), text("rechtlichesTitel", "Titel «Rechtliches»"),
        defineField({ name: "rechtliches", title: "Rechtliche Seiten", type: "array", of: [defineArrayMember({ type: "verweis" })], validation: (r) => r.required().min(1) }),
        text("route", "Beschriftung des Routenlinks"),
        defineField({ name: "bildnachweis", title: "Link zum Bildnachweis", type: "verweis", validation: (r) => r.required() }),
        text("copyright", "Copyright-Inhaber"), text("demoHinweis", "Hinweis in der Fusszeile, solange die Website ein Entwurf ist", undefined, 2),
      ],
    }),
    defineField({
      name: "ui", title: "Kleine Texte", type: "object", group: "ui",
      fields: [
        text("zumInhalt", "Sprunglink"), text("symbolbild", "Kennzeichnung von Symbolbildern"), text("telefon", "«Telefon»"), text("adresse", "«Adresse»"), text("route", "«Route anzeigen»"),
        text("preisWaehrung", "Währung", "Zum Beispiel «CHF»"), text("preisAb", "«ab»"), text("schaerfeLabel", "«Schärfe»"), text("nummerLabel", "«Nr.»"), text("kategorienTitel", "Titel der Kategorien-Navigation"),
        text("geschlossen", "«geschlossen»"), text("kuecheBis", "«Küche bis»"), text("heuteLabel", "«Heute»"), text("uhr", "«Uhr»"), text("bestellenBei", "«Bestellen bei»"),
        text("nichtGefundenTitel", "Fehlerseite: Titel"), text("nichtGefundenText", "Fehlerseite: Text", undefined, 2),
        defineField({ name: "nichtGefundenLink", title: "Fehlerseite: Link", type: "verweis", validation: (r) => r.required() }),
        text("fehler404", "Fehlerseite: Etikett"), text("quellenTitel", "«Quellen»"), text("uebersetzungHinweis", "Hinweis bei vorläufiger Übersetzung"),
        text("wann", "«Wann» (Buffet)"), text("hinweiseTitel", "Name des Hinweisbereichs (für Screenreader)"), text("allergeneLabel", "«Allergene»"),
      ],
    }),
    defineField({
      name: "einwilligung", title: "Datenschutz-Einstellungen", type: "object", group: "einwilligung",
      description: "Solange keine Kategorie eingetragen ist, erscheint kein Banner. Eine Kategorie nur eintragen, wenn die Website tatsächlich einen einwilligungspflichtigen Dienst einbindet (das braucht eine Entwicklerin oder einen Entwickler).",
      fields: [
        text("fussLink", "Link in der Fusszeile"), text("ruhendTitel", "Titel, wenn nichts einzustellen ist"), text("ruhendText", "Text, wenn nichts einzustellen ist", undefined, 3),
        text("bannerTitel", "Banner: Titel"), text("bannerText", "Banner: Text", undefined, 3), text("alleAkzeptieren", "Knopf «Alle akzeptieren»"), text("nurNotwendige", "Knopf «Nur notwendige»"), text("einstellungen", "Knopf «Einstellungen»"),
        text("auswahlSpeichern", "Knopf «Auswahl speichern»"), text("widerrufen", "Knopf «Einwilligung widerrufen»"), text("notwendigTitel", "Kategorie «Notwendig»: Titel"), text("notwendigText", "Kategorie «Notwendig»: Text"), text("datenschutzerklaerung", "Link «Datenschutzerklärung»"),
        defineField({ name: "kategorien", title: "Optionale Kategorien", type: "array", of: [defineArrayMember({ type: "object", name: "einwilligungKategorie", fields: [defineField({ name: "kennung", title: "Kennung (Kleinbuchstaben)", type: "string", validation: (r) => r.required().regex(/^[a-z]+$/, { name: "nur Kleinbuchstaben" }) }), defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }), defineField({ name: "beschreibung", title: "Beschreibung", type: "text", rows: 2, validation: (r) => r.required() })], preview: { select: { title: "titel", subtitle: "kennung" } } })] }),
      ],
    }),
    defineField({ name: "seo", title: "Suchmaschinen (Standard)", type: "object", group: "seo", fields: [text("titelZusatz", "Zusatz im Seitentitel"), defineField({ name: "beschreibung", title: "Standardbeschreibung", type: "text", rows: 3, description: "Gilt für Seiten ohne eigene Beschreibung, 50 bis 170 Zeichen.", validation: (r) => r.required().min(50).max(170).custom(schreibweise) })] }),
    defineField({ name: "belege", title: "Belege für Leitsatz und Standardbeschreibung", type: "belege", group: "fuss", validation: (r) => r.required() }),
  ],
  preview: { prepare: () => ({ title: "Navigation, Fusszeile und kleine Texte" }) },
});

// ── Seiten ─────────────────────────────────────────────────────────────────
const abschnittText = (name: string, title: string) => defineField({ name, title, type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3)] });

export const startseite = defineType({
  name: "startseite",
  title: "Startseite",
  type: "document",
  groups: seoGruppe,
  fields: [
    defineField({
      name: "hero", title: "Einstieg", type: "object", group: "inhalt",
      fields: [
        defineField({ name: "titel", title: "Titel", type: "string", description: "Höchstens 34 Zeichen, damit er auf zwei Zeilen passt.", validation: (r) => r.required().max(34).custom(schreibweise) }),
        defineField({ name: "text", title: "Text", type: "text", rows: 3, description: "Höchstens 20 Wörter.", validation: (r) => r.required().custom((t: string | undefined) => (t && t.trim().split(/\s+/).length > 20 ? "Bitte auf höchstens 20 Wörter kürzen." : schreibweise(t))) }),
        defineField({ name: "knopf", title: "Hauptknopf", type: "verweis", validation: (r) => r.required() }),
        defineField({ name: "zweiterKnopf", title: "Zweiter Knopf", type: "verweis", validation: (r) => r.required() }),
        defineField({ name: "bild", title: "Bild", type: "bildMitText", validation: (r) => r.required() }),
      ],
    }),
    defineField({ name: "heute", title: "Anzeige «Heute»", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("geschlossen", "Text, wenn heute geschlossen"), text("kueche", "«Küche bis»")] }),
    defineField({ name: "buffet", title: "Abschnitt «Mittagsbuffet»", type: "object", group: "inhalt", description: "Text, Zeiten und Preis kommen aus dem Dokument Mittagsbuffet.", fields: [text("titel", "Titel auf der Startseite")] }),
    defineField({ name: "speisekarte", title: "Abschnitt «Speisekarte»", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), defineField({ name: "knopf", title: "Knopf", type: "verweis", validation: (r) => r.required() }), defineField({ name: "kacheln", title: "Kacheln", type: "array", of: [defineArrayMember({ type: "object", name: "kachel", fields: [text("titel", "Titel"), text("text", "Text", undefined, 2), defineField({ name: "kategorie", title: "Sprungmarke der Kategorie", type: "string", description: "Adresse der Kategorie, zum Beispiel «suppen»", validation: (r) => r.required() }), defineField({ name: "bild", title: "Bild", type: "bildMitText", validation: (r) => r.required() })], preview: { select: { title: "titel", media: "bild" } } })], validation: (r) => r.required().min(1).max(4) })] }),
    defineField({ name: "specials", title: "Abschnitt «Special Menu»", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 2), defineField({ name: "kategorie", title: "Sprungmarke der Kategorie", type: "string", validation: (r) => r.required() }), defineField({ name: "knopf", title: "Link", type: "verweis", validation: (r) => r.required() })] }),
    defineField({ name: "restaurant", title: "Abschnitt «Das Restaurant»", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), defineField({ name: "knopf", title: "Knopf", type: "verweis", validation: (r) => r.required() }), defineField({ name: "bilder", title: "Bilder", type: "array", of: [defineArrayMember({ type: "bildMitText" })], validation: (r) => r.required().min(1).max(4) })] }),
    defineField({ name: "takeaway", title: "Abschnitt «Take-away und Lieferung»", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), defineField({ name: "bild", title: "Bild (optional)", type: "bildMitText" })] }),
    abschnittText("kontakt", "Abschnitt «Reservation und Anfahrt»"),
    defineField({ name: "belege", title: "Belege für die Texte dieser Seite", type: "belege", group: "inhalt", validation: (r) => r.required() }),
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Startseite" }) },
});

export const restaurantSeite = defineType({
  name: "restaurantSeite",
  title: "Restaurant und Team",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" }, { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" },
    defineField({ name: "bild", title: "Bild im Seitenkopf", type: "bildMitText", group: "inhalt", validation: (r) => r.required() }),
    defineField({ name: "geschichte", title: "Geschichte", type: "object", group: "inhalt", fields: [text("titel", "Titel"), defineField({ name: "absaetze", title: "Absätze", type: "array", of: [defineArrayMember({ type: "text", rows: 4 })], validation: (r) => r.required().min(1) })] }),
    defineField({ name: "name", title: "Der Name (optional)", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 2)] }),
    defineField({ name: "team", title: "Team", type: "object", group: "inhalt", fields: [text("titel", "Titel"), defineField({ name: "text", title: "Text (optional)", type: "text", rows: 2, validation: (r) => r.custom(schreibweise) }), defineField({ name: "mitglieder", title: "Teammitglieder", type: "array", of: [defineArrayMember({ type: "teamMitglied" })], validation: (r) => r.required().min(1) }), defineField({ name: "gruppenbild", title: "Gruppenbild (optional)", type: "bildMitText", description: "Die Legende nennt die Personen von links nach rechts." })] }),
    defineField({ name: "einblicke", title: "Einblicke", type: "object", group: "inhalt", fields: [text("titel", "Titel"), defineField({ name: "text", title: "Text (optional)", type: "string", validation: (r) => r.custom(schreibweise) }), defineField({ name: "bilder", title: "Bilder", type: "array", of: [defineArrayMember({ type: "bildMitText" })], validation: (r) => r.required().min(1) })] }),
    defineField({ name: "aufruf", title: "Aufruf am Seitenende", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 2), defineField({ name: "knopf", title: "Knopf", type: "verweis", validation: (r) => r.required() })] }),
    defineField({ name: "belege", title: "Belege für die Texte dieser Seite", type: "belege", group: "inhalt", validation: (r) => r.required() }),
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Restaurant und Team" }) },
});

export const kontaktSeite = defineType({
  name: "kontaktSeite",
  title: "Kontakt, Reservation und Anfahrt",
  type: "document",
  groups: seoGruppe,
  description: "Telefon, Adresse, Lieferdienste und Zahlungsmethoden stehen unter «Restaurant und Kontakt», die Zeiten unter «Öffnungszeiten».",
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" }, { ...text("einleitung", "Einleitung", undefined, 2), group: "inhalt" },
    { ...text("reservationTitel", "Titel «Reservation»"), group: "inhalt" }, { ...text("takeawayTitel", "Titel «Take-away»"), group: "inhalt" },
    { ...text("lieferdiensteTitel", "Titel «Lieferung»"), group: "inhalt" }, { ...text("lieferdiensteText", "Text zu den Lieferdiensten", undefined, 2), group: "inhalt" },
    { ...text("zahlungTitel", "Titel «Zahlungsmethoden»"), group: "inhalt" },
    { ...text("anfahrtTitel", "Titel «Anfahrt»"), group: "inhalt" }, { ...text("anfahrtText", "Text zur Anfahrt", undefined, 3), group: "inhalt" },
    { ...text("oeffnungszeitenTitel", "Titel «Öffnungszeiten»"), group: "inhalt" },
    defineField({ name: "belege", title: "Belege für die Texte dieser Seite", type: "belege", group: "inhalt", validation: (r) => r.required() }),
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Kontakt, Reservation und Anfahrt" }) },
});

export const rechtSeite = defineType({
  name: "rechtSeite",
  title: "Rechtsseite",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    defineField({ name: "slug", title: "Adresse", type: "slug", group: "inhalt", description: "«impressum» oder «datenschutz». Nicht ändern.", options: { source: "titel" }, validation: (r) => r.required().custom((s: { current?: string } | undefined) => (s?.current === "impressum" || s?.current === "datenschutz" ? true : "Erlaubt sind nur «impressum» und «datenschutz».")) }),
    defineField({ name: "einleitung", title: "Einleitung (optional)", type: "text", rows: 2, group: "inhalt", validation: (r) => r.custom(schreibweise) }),
    { ...text("stand", "Stand", "Zum Beispiel «16. Oktober 2026»"), group: "inhalt" },
    defineField({
      name: "inhalt", title: "Text", type: "array", group: "inhalt",
      description: "Im Impressum fügt die Website unter dem Zwischentitel «Bildnachweis» die Liste der Bildnachweise ein; diesen Zwischentitel nicht umbenennen.",
      of: [defineArrayMember({ type: "block", styles: [{ title: "Absatz", value: "normal" }, { title: "Zwischentitel", value: "h2" }, { title: "Untertitel", value: "h3" }], lists: [{ title: "Aufzählung", value: "bullet" }], marks: { decorators: [{ title: "Fett", value: "strong" }], annotations: [{ name: "link", type: "object", title: "Link", fields: [defineField({ name: "href", title: "Ziel", type: "string", validation: (r) => r.required() })] }] } })],
      validation: (r) => r.required().min(1),
    }),
    ...seoFelder,
  ],
  preview: { select: { title: "titel", subtitle: "stand" } },
});

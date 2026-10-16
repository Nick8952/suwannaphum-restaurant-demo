import type { Block, Inhaltsquelle } from "./modell";

const blockText = (b: Block): string => (b.art === "titel" ? b.text : b.art === "liste" ? b.punkte.flat().map((t) => (typeof t === "string" ? t : t.text)).join(" ") : b.inhalt.map((t) => (typeof t === "string" ? t : t.text)).join(""));

/**
 * Was vor dem Go-Live noch offen ist, gelesen aus der Inhaltsquelle, die der Build tatsächlich verwendet (lokal oder Sanity):
 *  - Angaben über das Restaurant, die es noch nicht bestätigt hat (`freigabe` ist nicht «live»): Kontaktdaten, Öffnungszeiten,
 *    Buffet, Speisekarte, Lieferdienste, Hinweise, Seitentexte
 *  - Kategorien der Karte, deren Übersetzung noch vorläufig ist
 *  - Rechtstexte, die noch die Demo beschreiben
 * Die Liste benutzt `npm run inhalt:pruefen -- --live`, und der Build bricht mit ihr ab, sobald INDEXIERUNG=1 für eine echte
 * Domain gesetzt ist: Eine indexierbare Website mit unbestätigten Preisen oder Öffnungszeiten kann so nicht entstehen.
 */
export async function offeneFreigaben(q: Inhaltsquelle): Promise<string[]> {
  const [e, o, hinweise, buffet, karte, start, restaurant, kontakt, texte, impressum, datenschutz] = await Promise.all([
    q.getEinstellungen(), q.getOeffnungszeiten(), q.getHinweise(), q.getBuffet(), q.getSpeisekarte(), q.getStartseite(), q.getRestaurantSeite(), q.getKontaktSeite(), q.getTexte(), q.getRechtSeite("impressum"), q.getRechtSeite("datenschutz"),
  ]);
  const offen: string[] = [];
  const pruefe = (wo: string, freigabe: string) => { if (freigabe !== "live") offen.push(`Noch nicht vom Restaurant bestätigt: ${wo}`); };
  pruefe("Adresse, Telefon, Reservation, Take-away, Zahlungsmethoden (Einstellungen)", e.freigabe);
  for (const l of e.lieferdienste) pruefe(`Lieferdienst «${l.name}»`, l.freigabe);
  pruefe("Öffnungszeiten und Küchenzeiten", o.freigabe);
  pruefe("Mittagsbuffet (Zeiten, Preis, enthaltenes Getränk)", buffet.freigabe);
  pruefe("Speisekarte (Gerichte und Preise)", karte.freigabe);
  for (const k of karte.kategorien) if (k.uebersetzungVorlaeufig) offen.push(`Übersetzung der Kategorie «${k.titel}» ist vorläufig (Umschrift und Erklärungen bestätigen)`);
  for (const h of hinweise) pruefe(`Hinweis «${h.titel}» (${h.anzeigenVon} bis ${h.anzeigenBis})`, h.freigabe);
  pruefe("Texte der Startseite", start.belege.freigabe);
  pruefe("Texte der Seite «Restaurant und Team»", restaurant.belege.freigabe);
  pruefe("Texte der Seite «Kontakt, Reservation und Anfahrt»", kontakt.belege.freigabe);
  pruefe("Leitsatz und Standardbeschreibung (Navigation, Fusszeile, Suchmaschinen)", texte.belege.freigabe);
  const datenschutzText = datenschutz.bloecke.map(blockText).join(" ");
  for (const k of texte.einwilligung.kategorien) if (!datenschutzText.includes(k.titel)) offen.push(`Die Datenschutzerklärung beschreibt die Einwilligungskategorie «${k.titel}» nicht.`);
  if (impressum.bloecke.some((b) => /\bDemo\b/.test(blockText(b)))) offen.push("Das Impressum beschreibt noch die Demo (Betreiber, Zweck): für den Produktivbetrieb neu schreiben.");
  if (datenschutz.bloecke.some((b) => /\bDemo\b|GitHub Pages/.test(blockText(b)))) offen.push("Die Datenschutzerklärung beschreibt noch die Demo auf GitHub Pages: an das produktive Hosting anpassen.");
  return offen;
}

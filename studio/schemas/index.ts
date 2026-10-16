import { belege, bildMitText, gericht, gerichtVariante, herkunft, lieferdienst, preistabelle, tagZeiten, teamMitglied, verweis, zeitfenster } from "./objekte";
import { buffet, einstellungen, hinweis, kategorie, kontaktSeite, oeffnungszeiten, rechtSeite, restaurantSeite, speisekarte, startseite, texte } from "./dokumente";

/** Dokumente, die es genau einmal gibt (feste Kennung, kein «Neu anlegen», kein Löschen). */
export const EINZELDOKUMENTE = ["einstellungen", "oeffnungszeiten", "buffet", "speisekarte", "texte", "startseite", "restaurantSeite", "kontaktSeite", "rechtSeite"];

export const schemaTypes = [
  // Objekte
  verweis, bildMitText, herkunft, belege, zeitfenster, tagZeiten, gerichtVariante, gericht, preistabelle, lieferdienst, teamMitglied,
  // Dokumente
  einstellungen, oeffnungszeiten, hinweis, buffet, speisekarte, kategorie, texte, startseite, restaurantSeite, kontaktSeite, rechtSeite,
];

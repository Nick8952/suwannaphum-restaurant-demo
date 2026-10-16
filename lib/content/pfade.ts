/**
 * Adressen der Seiten (ohne Unterpfad; den setzt next/link bzw. assetUrl).
 * Bewusst ohne Abhängigkeiten: Diese Datei darf in Client-Komponenten landen.
 */
export const pfade = {
  start: "/",
  speisekarte: "/speisekarte/",
  /** Sprungmarke zu einer Kategorie der Speisekarte */
  kategorie: (slug: string) => `/speisekarte/#${slug}`,
  buffet: "/speisekarte/#mittagsbuffet",
  restaurant: "/restaurant/",
  kontakt: "/kontakt/",
  oeffnungszeiten: "/kontakt/#oeffnungszeiten",
  impressum: "/impressum/",
  datenschutz: "/datenschutz/",
} as const;

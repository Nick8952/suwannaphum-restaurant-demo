/**
 * Konstanten ohne Abhängigkeiten (kein zod), damit Client-Komponenten sie einbinden können, ohne die Schemas
 * und damit zod in das Browser-Bundle zu ziehen.
 */
/** Wochentag 1 = Montag … 7 = Sonntag (ISO) */
export const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"] as const;
export const ZEITZONE = "Europe/Zurich";
/** Lesbare Bezeichnungen bestätigter Kennzeichnungen und Allergene (Schlüssel wie im Domainmodell) */
export const KENNZEICHNUNG_TEXTE: Record<string, string> = { vegetarisch: "vegetarisch", vegan: "vegan", glutenfrei: "glutenfrei", laktosefrei: "laktosefrei" };
export const ALLERGEN_TEXTE: Record<string, string> = { gluten: "Gluten", krebstiere: "Krebstiere", eier: "Eier", fisch: "Fisch", erdnuesse: "Erdnüsse", soja: "Soja", milch: "Milch", schalenfruechte: "Schalenfrüchte", sellerie: "Sellerie", senf: "Senf", sesam: "Sesam", sulfite: "Sulfite", lupinen: "Lupinen", weichtiere: "Weichtiere" };
/** Ländercodes für strukturierte Daten */
export const LAENDERCODES: Record<string, string> = { Schweiz: "CH", Deutschland: "DE", Österreich: "AT", Liechtenstein: "LI" };

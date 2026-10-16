/** «+41 44 555 82 99» → «044 555 82 99» (Anzeige für Gäste in der Schweiz) */
export function telefonAnzeige(telefon: string): string {
  return telefon.replace(/^\+41\s?/, "0");
}

/** 22.5 → «22.50» (Schweizer Schreibweise mit Punkt, immer zwei Nachkommastellen) */
export function preisText(preis: number): string {
  return preis.toFixed(2);
}

/** «2026-05-16» → «16. Mai 2026» */
export function datumText(iso: string): string {
  const [j, m, t] = iso.split("-").map(Number);
  const monate = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${t}. ${monate[m - 1]} ${j}`;
}

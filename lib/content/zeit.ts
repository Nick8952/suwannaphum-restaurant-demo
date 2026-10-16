import type { Hinweis, Oeffnungszeiten, Tag, Zeitfenster } from "./modell";
import { WOCHENTAGE, ZEITZONE } from "./konstanten";

export { ZEITZONE };

/**
 * Zeitlogik der Website, ohne Abhängigkeiten und ohne Zugriff auf die Inhaltsquelle: läuft beim Build (Server) und im Browser
 * (Client-Komponenten «Heute» und «Hinweise»). Alle Entscheidungen beziehen sich auf die Zeitzone des Restaurants (Europe/Zurich),
 * egal wo die Besucherin oder der Build sitzt.
 */

/** Datum «JJJJ-MM-TT» und ISO-Wochentag (1 = Montag) eines Zeitpunkts in der Zeitzone des Restaurants */
export function lokal(jetzt: Date): { datum: string; wochentag: number; minuten: number } {
  const teile = new Intl.DateTimeFormat("en-CA", { timeZone: ZEITZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(jetzt);
  const wert = (typ: string) => teile.find((t) => t.type === typ)?.value ?? "";
  const tage: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { datum: `${wert("year")}-${wert("month")}-${wert("day")}`, wochentag: tage[wert("weekday")] ?? 1, minuten: Number(wert("hour")) * 60 + Number(wert("minute")) };
}

/** «11:00» → 660 */
export const minuten = (uhrzeit: string): number => Number(uhrzeit.slice(0, 2)) * 60 + Number(uhrzeit.slice(3, 5));
/** «11:00» → «11.00» (Schweizer Schreibweise für die Anzeige) */
export const uhrzeit = (hhmm: string): string => hhmm.replace(":", ".");

/** Ein Hinweis ist aktiv, wenn das Datum im Anzeigefenster liegt (inklusive Randtage). */
export function hinweisAktiv(h: Pick<Hinweis, "anzeigenVon" | "anzeigenBis">, datum: string): boolean {
  return h.anzeigenVon <= datum && datum <= h.anzeigenBis;
}

/**
 * Betriebsferien oder Sonderöffnungszeiten, die ein Datum betreffen. Rangfolge: Betriebsferien vor Sonderöffnungszeiten,
 * damit eine Schliessung nie von einer gleichzeitig erfassten Sonderöffnung verdeckt wird.
 */
export function betroffenerHinweis(hinweise: Hinweis[], datum: string): Hinweis | undefined {
  const treffer = hinweise.filter((h) => h.art !== "mitteilung" && h.geschlossenVon && h.geschlossenBis && h.geschlossenVon <= datum && datum <= h.geschlossenBis);
  return treffer.find((h) => h.art === "betriebsferien") ?? treffer[0];
}

/** Die an einem Datum geltenden Zeitfenster: Betriebsferien (ganz oder ab einer Uhrzeit am ersten Tag), Sonderzeiten, sonst Wochenplan. */
export function geltendeZeiten(o: Pick<Oeffnungszeiten, "tage">, hinweise: Hinweis[], datum: string, wochentag: number): { zeiten: Zeitfenster[]; sonder?: Hinweis } {
  const sonder = betroffenerHinweis(hinweise, datum);
  const regulaer = zeitenAmTag(o, wochentag);
  if (!sonder) return { zeiten: regulaer };
  if (sonder.art === "betriebsferien") {
    if (sonder.geschlossenAb && datum === sonder.geschlossenVon) {
      const ab = minuten(sonder.geschlossenAb);
      return { zeiten: regulaer.filter((z) => minuten(z.bis) <= ab).map((z) => (minuten(z.bis) <= ab ? z : z)), sonder };
    }
    return { zeiten: [], sonder };
  }
  return { zeiten: sonder.zeiten ?? [], sonder };
}

/** Zeitfenster eines Wochentags (leer = geschlossen) */
export function zeitenAmTag(o: Pick<Oeffnungszeiten, "tage">, wochentag: number): Zeitfenster[] {
  return o.tage.find((t) => t.tag === wochentag)?.zeiten ?? [];
}

/** Fasst gleiche Tage zu Zeilen zusammen («Montag und Dienstag», «Montag bis Freitag»), damit die Tabelle kurz bleibt. */
export function zeitenZeilen(o: Pick<Oeffnungszeiten, "tage">): { tage: string; zeiten: Zeitfenster[] }[] {
  const zeilen: { von: number; bis: number; zeiten: Zeitfenster[] }[] = [];
  const schluessel = (t: Tag) => t.zeiten.map((z) => `${z.von}-${z.bis}-${z.kuecheBis ?? ""}`).join("|");
  for (const t of o.tage) {
    const letzte = zeilen[zeilen.length - 1];
    if (letzte && letzte.bis === t.tag - 1 && schluessel(o.tage[letzte.bis - 1]) === schluessel(t)) letzte.bis = t.tag;
    else zeilen.push({ von: t.tag, bis: t.tag, zeiten: t.zeiten });
  }
  return zeilen.map((z) => ({
    tage: z.von === z.bis ? WOCHENTAGE[z.von - 1] : z.bis === z.von + 1 ? `${WOCHENTAGE[z.von - 1]} und ${WOCHENTAGE[z.bis - 1]}` : `${WOCHENTAGE[z.von - 1]} bis ${WOCHENTAGE[z.bis - 1]}`,
    zeiten: z.zeiten,
  }));
}

/** Tage als Text: [1,2,3,4,5] → «Montag bis Freitag», [6] → «Samstag», [1,3] → «Montag und Mittwoch» */
export function tageText(tage: number[]): string {
  const sortiert = [...tage].sort((a, b) => a - b);
  const lueckenlos = sortiert.every((t, i) => i === 0 || t === sortiert[i - 1] + 1);
  if (sortiert.length === 1) return WOCHENTAGE[sortiert[0] - 1];
  if (lueckenlos && sortiert.length > 2) return `${WOCHENTAGE[sortiert[0] - 1]} bis ${WOCHENTAGE[sortiert[sortiert.length - 1] - 1]}`;
  return sortiert.map((t) => WOCHENTAGE[t - 1]).join(" und ");
}

/** «11.00 bis 14.00 und 16.30 bis 21.00 Uhr» */
export function zeitenText(zeiten: Zeitfenster[], geschlossen: string, uhr = "Uhr"): string {
  if (!zeiten.length) return geschlossen;
  return `${zeiten.map((z) => `${uhrzeit(z.von)} bis ${uhrzeit(z.bis)}`).join(" und ")} ${uhr}`.trim();
}

/** Küchenschluss-Zeiten eines Tages, die von der Restaurantzeit abweichen (für «Küche bis 20.30») */
export function kuechenschluss(zeiten: Zeitfenster[]): string[] {
  return zeiten.filter((z) => z.kuecheBis && z.kuecheBis !== z.bis).map((z) => uhrzeit(z.kuecheBis as string));
}

/** Zustand des Restaurants zu einem Zeitpunkt (für die Anzeige «Heute»): offen, Küche offen, nächster Schluss */
export function zustand(o: Oeffnungszeiten, hinweise: Hinweis[], jetzt: Date) {
  const { datum, wochentag, minuten: m } = lokal(jetzt);
  const { zeiten, sonder } = geltendeZeiten(o, hinweise, datum, wochentag);
  const offen = zeiten.find((z) => minuten(z.von) <= m && m < minuten(z.bis));
  const kuecheOffen = !!offen && m < minuten(offen.kuecheBis ?? offen.bis);
  return { datum, wochentag, zeiten, sonder, offen: !!offen, kuecheOffen, aktuellesFenster: offen };
}

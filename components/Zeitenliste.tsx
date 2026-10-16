"use client";

import type { Oeffnungszeiten, Texte } from "@/lib/content/modell";
import { kuechenschluss, lokal, zeitenText, zeitenZeilen } from "@/lib/content/zeit";
import { useJetzt } from "@/lib/uhr";

/**
 * Öffnungszeiten als Liste, gleiche Tage zusammengefasst, Küchenschluss je Zeile. Der heutige Wochentag wird nach dem Laden
 * hervorgehoben (im Browser gerechnet); ohne JavaScript ist die Liste dieselbe, nur ohne Hervorhebung.
 */
export function Zeitenliste({ oeffnungszeiten: o, texte: t, hinweis }: { oeffnungszeiten: Oeffnungszeiten; texte: Texte["ui"]; hinweis?: string }) {
  const jetzt = useJetzt();
  const heute = jetzt ? lokal(jetzt).wochentag : null;
  const zeilen = zeitenZeilen(o);
  return (
    <div>
      <ul className="zeiten">
        {zeilen.map((z) => {
          const istHeute = heute !== null && zeilenTage(z.tage).includes(heute);
          const kueche = kuechenschluss(z.zeiten);
          return (
            <li key={z.tage} className={istHeute ? "heute" : undefined} aria-current={istHeute ? "date" : undefined}>
              <span>{z.tage}{istHeute ? <span className="nur-sr"> ({t.heuteLabel})</span> : null}</span>
              <span>
                {zeitenText(z.zeiten, t.geschlossen, t.uhr)}
                {kueche.length ? <span className="kueche">{t.kuecheBis} {kueche.join(` ${t.uhr} und `)} {t.uhr}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
      {hinweis ? <p className="klein mt-3 opacity-90">{hinweis}</p> : null}
    </div>
  );
}

const NAMEN = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
/** «Montag bis Freitag» → [1,2,3,4,5]; «Montag und Dienstag» → [1,2]; «Mittwoch» → [3] */
function zeilenTage(text: string): number[] {
  const bis = text.match(/^(\w+) bis (\w+)$/);
  if (bis) { const a = NAMEN.indexOf(bis[1]) + 1, b = NAMEN.indexOf(bis[2]) + 1; return Array.from({ length: b - a + 1 }, (_, i) => a + i); }
  const und = text.match(/^(\w+) und (\w+)$/);
  if (und) return [NAMEN.indexOf(und[1]) + 1, NAMEN.indexOf(und[2]) + 1];
  return [NAMEN.indexOf(text) + 1];
}

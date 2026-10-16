"use client";

import type { Hinweis } from "@/lib/content/modell";
import { hinweisAktiv, lokal } from "@/lib/content/zeit";
import { useJetzt } from "@/lib/uhr";
import { datumText } from "@/lib/format";

/**
 * Zeitlich begrenzte Hinweise (Betriebsferien, Sonderöffnungszeiten, Mitteilungen).
 * Beim Build werden alle Hinweise gerendert, deren Anzeigefenster noch nicht abgelaufen ist; sichtbar sind zunächst die am
 * Build-Datum aktiven (so auch ohne JavaScript). Im Browser entscheidet dann das heutige Datum in der Zeitzone des Restaurants:
 * Abgelaufene verschwinden auch in einem veralteten statischen Stand, bevorstehende erscheinen pünktlich.
 */
export function Hinweise({ hinweise, buildDatum, titel }: { hinweise: Hinweis[]; buildDatum: string; titel: string }) {
  const jetzt = useJetzt();
  const datum = jetzt ? lokal(jetzt).datum : buildDatum;
  const liste = hinweise.filter((h) => h.anzeigenBis >= buildDatum);
  if (!liste.length) return null;
  return (
    <div className="grid gap-3" role="region" aria-label={titel}>
      {liste.map((h) => (
        <div key={h._key} className="hinweis" hidden={!hinweisAktiv(h, datum)} data-von={h.anzeigenVon} data-bis={h.anzeigenBis}>
          <p className="titel-4">{h.titel}</p>
          <p className="klein mt-1 text-tinte-2">{h.text}</p>
          {h.geschlossenVon && h.geschlossenBis ? <p className="klein mt-1 font-semibold">{datumText(h.geschlossenVon)} bis {datumText(h.geschlossenBis)}</p> : null}
        </div>
      ))}
    </div>
  );
}

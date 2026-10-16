import { preisText } from "@/lib/format";

/** Preis mit kleiner Währungsangabe davor («CHF 22.50»), tabellarische Ziffern. */
export function Preis({ wert, waehrung, ab, abLabel }: { wert: number; waehrung: string; ab?: boolean; abLabel?: string }) {
  return (
    <span className="preis">
      <small>{ab && abLabel ? `${abLabel} ` : ""}{waehrung}</small>
      {preisText(wert)}
    </span>
  );
}

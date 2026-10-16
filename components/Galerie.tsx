import type { Bild as BildTyp } from "@/lib/content/modell";
import { Bild } from "./Bild";

/** Bildraster mit festen Seitenverhältnissen (kein Layoutsprung); Hochformate bekommen ihre eigene Höhe. */
export function Galerie({ bilder, symbolbildText }: { bilder: BildTyp[]; symbolbildText: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {bilder.map((b, i) => {
        const hoch = b.hoehe > b.breite;
        return (
          <li key={i} className={hoch ? "row-span-2" : undefined}>
            <figure>
              <div className={`bild-flaeche ${hoch ? "hoch" : "quer"}`}>
                <Bild bild={b} sizes="(min-width: 64rem) 33vw, 50vw" />
              </div>
              {b.legende || b.symbolbild ? <figcaption className="legende">{b.legende}{b.symbolbild ? ` (${symbolbildText})` : ""}</figcaption> : null}
            </figure>
          </li>
        );
      })}
    </ul>
  );
}

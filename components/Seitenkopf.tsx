import type { Bild as BildTyp } from "@/lib/content/modell";
import { Bild } from "./Bild";

/** Seitenkopf der Unterseiten: Titel und Einleitung, wahlweise mit breitem Bild darunter. */
export function Seitenkopf({ titel, einleitung, bild }: { titel: string; einleitung: string; bild?: BildTyp }) {
  return (
    <header className="behaelter einstieg pt-10 lg:pt-16">
      <h1 className="titel-1 max-w-[18ch]">{titel}</h1>
      <p className="vorspann mt-5">{einleitung}</p>
      {bild ? (
        <div className="bild-flaeche mt-8 aspect-[16/9] lg:aspect-[21/9]">
          <Bild bild={bild} sizes="(min-width: 78rem) 1200px, 100vw" prio />
        </div>
      ) : null}
    </header>
  );
}

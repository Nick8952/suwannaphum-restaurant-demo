import type { Kategorie as KategorieTyp, Speisekarte, Texte } from "@/lib/content/modell";
import { GerichtZeile } from "./GerichtZeile";
import { Preis } from "./Preis";

/**
 * Eine Kategorie der Speisekarte als eigener Abschnitt mit Sprungmarke. Gerichte ohne eigenen Preis zeigen keine
 * Punktlinie; ihre Preise stehen in der Preistabelle, die nach dem letzten dieser Gerichte folgt.
 */
export function Kategorie({ kategorie: k, karte, texte: t }: { kategorie: KategorieTyp; karte: Speisekarte; texte: Texte }) {
  const u = t.ui;
  // Preistabellen werden nach dem letzten Gericht ausgegeben, das sie benutzt
  const letztesMit = new Map<string, number>();
  k.gerichte.forEach((g, i) => { if (g.preistabelle) letztesMit.set(g.preistabelle, i); });
  return (
    <section className="kategorie" id={k.slug} aria-labelledby={`${k.slug}-titel`}>
      <header className="mb-5">
        <h2 id={`${k.slug}-titel`} className="titel-2">
          {k.titel}
          {k.titelThai ? <span className="ml-3 text-[0.6em] font-semibold text-tinte-2" lang="th">{k.titelThai}</span> : null}
        </h2>
        {k.untertitel ? <p className="klein mt-1 text-tinte-2">{k.untertitel}</p> : null}
        {k.einleitung ? <p className="lauftext mt-3">{k.einleitung}</p> : null}
        {k.uebersetzungVorlaeufig ? <p className="etikett mt-2">{u.uebersetzungHinweis}</p> : null}
      </header>
      <ul className="gerichte">
        {k.gerichte.map((g) => (
          <GerichtZeile key={g._key} gericht={g} kategorie={k.slug} karte={karte} texte={t} />
        )).flatMap((zeile, i) => {
          const g = k.gerichte[i];
          const tabelle = g.preistabelle && letztesMit.get(g.preistabelle) === i ? k.preistabellen.find((p) => p._key === g.preistabelle) : undefined;
          return tabelle
            ? [zeile, (
                <li key={`tabelle-${tabelle._key}`} className="preistabelle list-none" aria-labelledby={`${k.slug}-${tabelle._key}`}>
                  <p id={`${k.slug}-${tabelle._key}`} className="titel-4">{tabelle.titel}</p>
                  {tabelle.text ? <p className="klein mt-1 text-tinte-2">{tabelle.text}</p> : null}
                  <ul className="mt-3">
                    {tabelle.varianten.map((v) => (
                      <li key={v._key}>
                        <span>{v.name}</span>
                        <span className="punkte" aria-hidden="true" />
                        <Preis wert={v.preis} waehrung={u.preisWaehrung} />
                      </li>
                    ))}
                  </ul>
                </li>
              )]
            : [zeile];
        })}
      </ul>
      {k.zusaetze.length || k.fussnote ? (
        <div className="mt-4 grid gap-2">
          {k.fussnote ? <p className="fussnote">{k.fussnote}</p> : null}
          {k.zusaetze.length ? (
            <ul className="fussnote flex flex-wrap gap-x-6 gap-y-1">
              {k.zusaetze.map((z) => (
                <li key={z._key}>{z.name}: + <Preis wert={z.preis} waehrung={u.preisWaehrung} /></li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

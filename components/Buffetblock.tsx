import type { Buffet, Texte } from "@/lib/content/modell";
import { tageText, uhrzeit } from "@/lib/content/zeit";
import { Bild } from "./Bild";
import { Preis } from "./Preis";

/**
 * Mittagsbuffet: Zeiten, Preis und enthaltenes Getränk aus den Inhalten, dazu das Foto der Buffettheke.
 * Auf der Speisekarte steht der Block oben mit der Sprungmarke «mittagsbuffet».
 */
export function Buffetblock({ buffet: b, texte: t, id, titel }: { buffet: Buffet; texte: Texte; id?: string; titel?: string }) {
  const u = t.ui;
  return (
    <section id={id} className="laeufer rounded-(--radius-flaeche) overflow-hidden" aria-labelledby={`${id ?? "buffet"}-titel`}>
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid content-center gap-4 p-6 sm:p-8 lg:p-10">
          <h2 id={`${id ?? "buffet"}-titel`} className="titel-2">{titel ?? b.titel}</h2>
          {b.untertitel ? <p className="titel-4">{b.untertitel}</p> : null}
          <p className="lauftext">{b.text}</p>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="etikett text-tinte-2">{u.wann}</dt>
              <dd className="titel-4">{tageText(b.tage)}, {uhrzeit(b.von)} bis {uhrzeit(b.bis)} {u.uhr}</dd>
            </div>
            {b.angebote.map((a) => (
              <div key={a._key}>
                <dt className="etikett text-tinte-2">{a.titel}</dt>
                <dd className="titel-4"><Preis wert={a.preis} waehrung={u.preisWaehrung} ab={b.abPreis} abLabel={u.preisAb} />{a.inklusive ? <span className="block text-base font-normal">{a.inklusive}</span> : null}{a.hinweis ? <span className="block text-base font-normal">{a.hinweis}</span> : null}</dd>
              </div>
            ))}
          </dl>
        </div>
        {b.bild ? (
          <div className="relative min-h-56 lg:min-h-full">
            <Bild bild={b.bild} sizes="(min-width: 64rem) 40vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

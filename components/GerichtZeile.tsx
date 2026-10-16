import type { Gericht, Speisekarte, Texte } from "@/lib/content/modell";
import { ALLERGEN_TEXTE, KENNZEICHNUNG_TEXTE } from "@/lib/content/konstanten";
import { Bild } from "./Bild";
import { Chilis } from "./Chilis";
import { Preis } from "./Preis";

/**
 * Eine Zeile der Speisekarte: Nummer, Name, Chilis, Punktlinie, Preis; darunter Thai-Name, Beschreibung, Hinweis, Varianten.
 * Die Punktlinie verbindet Name und Preis optisch; für Screenreader steht der Preis direkt nach dem Namen.
 */
export function GerichtZeile({ gericht: g, kategorie, karte, texte: t }: { gericht: Gericht; kategorie: string; karte: Speisekarte; texte: Texte }) {
  const u = t.ui;
  const kennzeichnungen = g.kennzeichnungen.map((k) => KENNZEICHNUNG_TEXTE[k] ?? k);
  const allergene = g.allergene.map((a) => ALLERGEN_TEXTE[a] ?? a);
  return (
    <li className={`gericht${g.bild ? " mit-bild" : ""}`} id={`${kategorie}-${g.nummer ? g.nummer.replace(/[^A-Za-z0-9]/g, "") : g._key}`}>
      {g.bild ? <div className="gericht-bild"><Bild bild={g.bild} sizes="88px" /></div> : null}
      <div className="kopf">
        {g.nummer ? <span className="nummer zahl"><span className="nur-sr">{u.nummerLabel} </span>{g.nummer}</span> : null}
        <span className="name">
          {g.name}
          {g.portion ? <span className="font-normal text-tinte-2"> ({g.portion})</span> : null}
          {g.schaerfe > 0 ? <> <Chilis grad={g.schaerfe} stufen={karte.schaerfe.stufen} label={u.schaerfeLabel} /></> : null}
        </span>
        <span className="punkte" aria-hidden="true" />
        {g.preis !== undefined ? <Preis wert={g.preis} waehrung={u.preisWaehrung} /> : null}
      </div>
      {g.nameThai ? <p className="thai" lang="th">{g.nameThai}</p> : null}
      {g.beschreibung ? <p className="beschreibung">{g.beschreibung}</p> : null}
      {g.hinweis ? <p className="beschreibung font-semibold">{g.hinweis}</p> : null}
      {kennzeichnungen.length || allergene.length ? (
        <p className="beschreibung">
          {kennzeichnungen.length ? <span className="font-semibold">{kennzeichnungen.join(", ")}</span> : null}
          {kennzeichnungen.length && allergene.length ? ". " : ""}
          {allergene.length ? <>{u.allergeneLabel}: {allergene.join(", ")}</> : null}
        </p>
      ) : null}
      {g.varianten?.length ? (
        <ul className="varianten">
          {g.varianten.map((v) => (
            <li key={v._key}>
              <span>{v.name}</span>
              <span className="punkte" aria-hidden="true" />
              <Preis wert={v.preis} waehrung={u.preisWaehrung} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

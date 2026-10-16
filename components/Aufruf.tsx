import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { SmartLink } from "./SmartLink";

/** Abschluss einer Seite: Titel, Satz, ein Knopf (meist das Telefon). */
export function Aufruf({ titel, text, knopf, telefonAnzeige }: { titel: string; text: string; knopf: { text: string; ziel: string }; telefonAnzeige?: string }) {
  return (
    <section className="behaelter abschnitt-knapp" aria-labelledby="aufruf-titel">
      <div className="nacht rounded-(--radius-flaeche) px-6 py-8 sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div>
          <h2 id="aufruf-titel" className="titel-2">{titel}</h2>
          <p className="mt-2 max-w-[48ch]">{text}</p>
        </div>
        <SmartLink ziel={knopf.ziel} className="knopf knopf-gold mt-5 lg:mt-0">
          <PhoneIcon size={20} weight="bold" aria-hidden="true" />
          {knopf.text}{telefonAnzeige ? <span className="nur-sr">: {telefonAnzeige}</span> : null}
        </SmartLink>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { ArrowUpRightIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "@/lib/format";
import { Lieferdienste } from "@/components/Lieferdienste";
import { Seitenkopf } from "@/components/Seitenkopf";
import { SmartLink } from "@/components/SmartLink";
import { Zahlungsmethoden } from "@/components/Zahlungsmethoden";
import { Zeitenliste } from "@/components/Zeitenliste";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, k] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getKontaktSeite()]);
  return seitenMetadaten({ titel: k.seoTitel ?? k.titel, beschreibung: k.seoBeschreibung, pfad: pfade.kontakt, einstellungen: e, texte: t });
}

export default async function Kontakt() {
  const q = await inhaltsquelle();
  const [e, t, k, o] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getKontaktSeite(), q.getOeffnungszeiten()]);
  const anzeige = telefonAnzeige(e.telefon);
  const tel = telLink(e.telefon);
  return (
    <>
      <Seitenkopf titel={k.titel} einleitung={k.einleitung} />

      <div className="behaelter abschnitt grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid gap-10">
          <section id="reservation" aria-labelledby="reservation-titel">
            <h2 id="reservation-titel" className="titel-2">{k.reservationTitel}</h2>
            <p className="lauftext mt-3">{e.reservation.text}</p>
            <a href={tel} className="knopf knopf-primaer mt-5">
              <PhoneIcon size={18} weight="bold" aria-hidden="true" />
              {t.aufrufe.reservieren.text}<span className="nur-sr">: {anzeige}</span>
            </a>
          </section>
          <section id="take-away" aria-labelledby="takeaway-titel">
            <h2 id="takeaway-titel" className="titel-2">{k.takeawayTitel}</h2>
            <p className="lauftext mt-3">{e.takeaway.text}</p>
            <a href={tel} className="knopf knopf-sekundaer mt-5">
              <PhoneIcon size={18} weight="bold" aria-hidden="true" />
              {t.aufrufe.takeaway.text}<span className="nur-sr">: {anzeige}</span>
            </a>
          </section>
          <section id="lieferung" aria-labelledby="lieferung-titel">
            <h2 id="lieferung-titel" className="titel-2">{k.lieferdiensteTitel}</h2>
            <p className="lauftext mt-3">{k.lieferdiensteText}</p>
            <div className="mt-5"><Lieferdienste einstellungen={e} texte={t} /></div>
          </section>
          <section aria-labelledby="zahlung-titel">
            <h2 id="zahlung-titel" className="titel-3">{k.zahlungTitel}</h2>
            <div className="mt-3"><Zahlungsmethoden einstellungen={e} /></div>
            {e.zahlungsmethodenHinweis ? <p className="klein mt-2 text-tinte-2">{e.zahlungsmethodenHinweis}</p> : null}
          </section>
        </div>

        <div className="grid content-start gap-8">
          <section className="nacht rounded-(--radius-flaeche) p-6 sm:p-8" id="oeffnungszeiten" aria-labelledby="zeiten-titel">
            <h2 id="zeiten-titel" className="titel-3">{k.oeffnungszeitenTitel}</h2>
            <div className="mt-4"><Zeitenliste oeffnungszeiten={o} texte={t.ui} hinweis={o.kuechenHinweis} /></div>
          </section>
          <section id="anfahrt" aria-labelledby="anfahrt-titel">
            <h2 id="anfahrt-titel" className="titel-3">{k.anfahrtTitel}</h2>
            <address className="mt-3 not-italic">
              <p className="titel-4">{e.name}</p>
              <p>{e.adresse.strasse}<br />{e.adresse.plz} {e.adresse.ort}</p>
              <p className="mt-2"><span className="etikett">{t.ui.telefon}</span> <a href={tel} className="textlink zahl">{anzeige}</a></p>
            </address>
            <p className="klein mt-3 text-tinte-2">{k.anfahrtText}</p>
            <SmartLink ziel={e.routenlink} className="knopf knopf-sekundaer mt-4">
              <MapPinIcon size={18} weight="bold" aria-hidden="true" />
              {t.ui.route}
              <ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
            </SmartLink>
          </section>
        </div>
      </div>
    </>
  );
}

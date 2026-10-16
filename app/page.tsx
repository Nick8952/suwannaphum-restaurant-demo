import type { Metadata } from "next";
import { ArrowRightIcon, ArrowUpRightIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { inhaltsquelle, pfade } from "@/lib/content";
import { lokal, zustand } from "@/lib/content/zeit";
import { seitenMetadaten } from "@/lib/seo";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "@/lib/format";
import { Bild } from "@/components/Bild";
import { Buffetblock } from "@/components/Buffetblock";
import { Heute } from "@/components/Heute";
import { Hinweise } from "@/components/Hinweise";
import { Lieferdienste } from "@/components/Lieferdienste";
import { Preis } from "@/components/Preis";
import { SmartLink } from "@/components/SmartLink";
import { Zeitenliste } from "@/components/Zeitenliste";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getStartseite()]);
  return seitenMetadaten({ titel: e.claim, beschreibung: s.seoBeschreibung, pfad: pfade.start, einstellungen: e, texte: t, istStart: true });
}

export default async function Startseite() {
  const q = await inhaltsquelle();
  const [e, t, s, o, hinweise, buffet, karte] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getStartseite(), q.getOeffnungszeiten(), q.getHinweise(), q.getBuffet(), q.getSpeisekarte()]);
  const jetzt = new Date();
  const buildStand = zustand(o, hinweise, jetzt);
  const specials = karte.kategorien.find((k) => k.slug === s.specials.kategorie);
  const anzeige = telefonAnzeige(e.telefon);
  return (
    <>
      {/* Einstieg: Text links, Foto rechts; darunter der goldene Läufer mit den heutigen Zeiten */}
      <section className="held" aria-labelledby="hero-titel">
        <div className="held-text einstieg">
          <h1 id="hero-titel" className="titel-1">{s.hero.titel}</h1>
          <p className="vorspann">{s.hero.text}</p>
          <div className="flex flex-wrap gap-3">
            <SmartLink ziel={s.hero.knopf.ziel} className="knopf knopf-primaer">
              {s.hero.knopf.text}
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
            </SmartLink>
            <SmartLink ziel={s.hero.zweiterKnopf.ziel} className="knopf knopf-sekundaer">
              <PhoneIcon size={18} weight="bold" aria-hidden="true" />
              {s.hero.zweiterKnopf.text}<span className="nur-sr">: {anzeige}</span>
            </SmartLink>
          </div>
          <p className="klein text-tinte-2"><MapPinIcon size={16} className="mr-1 inline-block align-[-3px]" aria-hidden="true" />{e.adresse.strasse}, {e.adresse.plz} {e.adresse.ort}</p>
        </div>
        <div className="held-bild">
          <Bild bild={s.hero.bild} sizes="(min-width: 64rem) 55vw, 100vw" prio />
        </div>
      </section>
      <div className="laeufer">
        <div className="behaelter">
          <Heute oeffnungszeiten={o} hinweise={hinweise} texte={t.ui} start={s.heute} buildStand={buildStand} />
        </div>
      </div>
      <div className="behaelter mt-6 empty:hidden">
        <Hinweise hinweise={hinweise} buildDatum={lokal(jetzt).datum} titel={t.ui.hinweiseTitel} />
      </div>

      {/* Mittagsbuffet */}
      <section className="behaelter abschnitt" aria-labelledby="buffet-titel">
        <Buffetblock buffet={buffet} texte={t} id="buffet" titel={s.buffet.titel} />
      </section>

      {/* Speisekarte: drei Kacheln mit echten Gerichtfotos */}
      <section className="behaelter abschnitt pt-0" aria-labelledby="karte-titel">
        <div className="max-w-[60ch]">
          <h2 id="karte-titel" className="titel-2">{s.speisekarte.titel}</h2>
          <p className="vorspann mt-3">{s.speisekarte.text}</p>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {s.speisekarte.kacheln.map((k) => (
            <li key={k._key}>
              <SmartLink ziel={pfade.kategorie(k.kategorie)} className="kachel">
                <div className="bild-flaeche quer"><Bild bild={k.bild} sizes="(min-width: 40rem) 33vw, 100vw" /></div>
                <span className="titel-3 inline-flex items-center gap-2">{k.titel}<ArrowRightIcon size={18} weight="bold" className="pfeil" aria-hidden="true" /></span>
                <span className="klein text-tinte-2">{k.text}</span>
              </SmartLink>
            </li>
          ))}
        </ul>
        <SmartLink ziel={s.speisekarte.knopf.ziel} className="knopf knopf-primaer mt-8">
          {s.speisekarte.knopf.text}
          <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
        </SmartLink>
      </section>

      {/* Special Menu */}
      {specials ? (
        <section className="behaelter abschnitt pt-0" aria-labelledby="specials-titel">
          <div className="grid gap-6 rounded-(--radius-flaeche) bg-sand p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10 lg:p-10">
            <div>
              <h2 id="specials-titel" className="titel-2">{s.specials.titel}</h2>
              <p className="lauftext mt-3">{s.specials.text}</p>
              {specials.einleitung ? <p className="klein mt-3 font-semibold">{specials.einleitung}</p> : null}
              <SmartLink ziel={s.specials.knopf.ziel} className="textlink mt-4 inline-flex min-h-11 items-center gap-1 font-semibold">
                {s.specials.knopf.text}
                <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
              </SmartLink>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {specials.gerichte.map((g) => (
                <li key={g._key} className="grid gap-2">
                  {g.bild ? <div className="bild-flaeche quer"><Bild bild={g.bild} sizes="(min-width: 40rem) 30vw, 100vw" /></div> : null}
                  <p className="flex items-baseline justify-between gap-3"><span className="titel-4">{g.name}</span>{g.preis !== undefined ? <Preis wert={g.preis} waehrung={t.ui.preisWaehrung} /> : null}</p>
                  {g.beschreibung ? <p className="klein text-tinte-2">{g.beschreibung}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Restaurant */}
      <section className="behaelter abschnitt pt-0" aria-labelledby="restaurant-titel">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
          <div>
            <h2 id="restaurant-titel" className="titel-2">{s.restaurant.titel}</h2>
            <p className="lauftext mt-3">{s.restaurant.text}</p>
            <SmartLink ziel={s.restaurant.knopf.ziel} className="knopf knopf-sekundaer mt-6">
              {s.restaurant.knopf.text}
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
            </SmartLink>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {s.restaurant.bilder.map((b, i) => (
              <li key={i} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <div className={`bild-flaeche ${i === 0 ? "h-full" : "quer"}`}><Bild bild={b} sizes="(min-width: 64rem) 30vw, 60vw" className={i === 0 ? "h-full w-full object-cover" : undefined} /></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Take-away und Lieferung */}
      <section className="behaelter abschnitt pt-0" aria-labelledby="takeaway-titel">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          {s.takeaway.bild ? <div className="bild-flaeche quer lg:order-2"><Bild bild={s.takeaway.bild} sizes="(min-width: 64rem) 50vw, 100vw" /></div> : null}
          <div>
            <h2 id="takeaway-titel" className="titel-2">{s.takeaway.titel}</h2>
            <p className="lauftext mt-3">{s.takeaway.text}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={telLink(e.telefon)} className="knopf knopf-primaer">
                <PhoneIcon size={18} weight="bold" aria-hidden="true" />
                {t.aufrufe.takeaway.text}<span className="nur-sr">: {anzeige}</span>
              </a>
            </div>
            <div className="mt-4"><Lieferdienste einstellungen={e} texte={t} /></div>
          </div>
        </div>
      </section>

      {/* Reservation, Öffnungszeiten, Anfahrt */}
      <section className="nacht" aria-labelledby="kontakt-titel">
        <div className="laeufer-schmal" />
        <div className="behaelter abschnitt grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="kontakt-titel" className="titel-2">{s.kontakt.titel}</h2>
            <p className="mt-3 max-w-[48ch]">{s.kontakt.text}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={telLink(e.telefon)} className="knopf knopf-gold">
                <PhoneIcon size={18} weight="bold" aria-hidden="true" />
                {t.aufrufe.reservieren.text}<span className="nur-sr">: {anzeige}</span>
              </a>
              <SmartLink ziel={e.routenlink} className="knopf knopf-hell">
                <MapPinIcon size={18} weight="bold" aria-hidden="true" />
                {t.ui.route}
                <ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
              </SmartLink>
            </div>
            <address className="mt-6 not-italic">
              <p className="titel-4">{e.name}</p>
              <p>{e.adresse.strasse}, {e.adresse.plz} {e.adresse.ort}</p>
              <p className="zahl"><a href={telLink(e.telefon)} className="textlink">{anzeige}</a></p>
            </address>
          </div>
          <div>
            <h3 className="etikett">{t.footer.zeitenTitel}</h3>
            <div className="mt-3"><Zeitenliste oeffnungszeiten={o} texte={t.ui} hinweis={o.kuechenHinweis} /></div>
          </div>
        </div>
      </section>
    </>
  );
}

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Oeffnungszeiten, Texte } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "@/lib/format";
import { kuechenschluss, zeitenText, zeitenZeilen } from "@/lib/content/zeit";
import { Bild } from "./Bild";
import { EinwilligungFussLink } from "./Einwilligung";
import { SmartLink } from "./SmartLink";

const zeile = "inline-flex min-h-11 items-center underline-offset-4 hover:text-gold-hell hover:underline";

/**
 * Fusszeile in Petrol-Nacht: Wortmarke, Leitsatz, Kontakt, Öffnungszeiten, Seiten, Rechtliches. Der Demo-Hinweis steht am
 * Schluss, solange die Seite nicht indexiert werden darf.
 */
export function Fusszeile({ einstellungen: e, oeffnungszeiten: o, texte: t, zeigeDemoHinweis }: { einstellungen: Einstellungen; oeffnungszeiten: Oeffnungszeiten; texte: Texte; zeigeDemoHinweis: boolean }) {
  const f = t.footer;
  return (
    <footer className="nacht mt-16 lg:mt-24">
      <div className="laeufer-schmal" />
      <div className="behaelter pb-10 pt-12 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <p className="titel-2 max-w-[16ch]">{f.leitsatz}</p>
          <div className="w-[200px] overflow-hidden rounded-(--radius-flaeche) lg:w-[240px]">
            <Bild bild={e.logo} sizes="240px" />
          </div>
        </div>

        <div className="klein mt-10 grid gap-8 border-t border-elfenbein/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="etikett">{f.kontaktTitel}</h2>
            <address className="mt-3 not-italic">
              <p className="titel-4">{e.name}</p>
              <p>{e.adresse.strasse}<br />{e.adresse.plz} {e.adresse.ort}</p>
              <ul className="mt-2 grid">
                <li><a href={telLink(e.telefon)} className={`${zeile} zahl`}>{telefonAnzeige(e.telefon)}</a></li>
                <li>
                  <SmartLink ziel={e.routenlink} className={`${zeile} gap-1.5`}>
                    {f.route}
                    <ArrowUpRightIcon size={16} aria-hidden="true" />
                  </SmartLink>
                </li>
              </ul>
            </address>
          </div>
          <div>
            <h2 className="etikett">{f.zeitenTitel}</h2>
            <ul className="mt-3 grid gap-1">
              {zeitenZeilen(o).map((z) => {
                const kueche = kuechenschluss(z.zeiten);
                return (
                  <li key={z.tage}>
                    <span className="block font-semibold">{z.tage}</span>
                    <span className="block">{zeitenText(z.zeiten, t.ui.geschlossen, t.ui.uhr)}{kueche.length ? `, ${t.ui.kuecheBis} ${kueche.join(" und ")} ${t.ui.uhr}` : ""}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <nav aria-label={f.seitenTitel}>
            <h2 className="etikett">{f.seitenTitel}</h2>
            <ul className="mt-3 grid">
              <li><SmartLink ziel="/" className={zeile}>{t.kopf.startseite}</SmartLink></li>
              {t.navigation.map((n) => (
                <li key={n.ziel}><SmartLink ziel={n.ziel} className={zeile}>{n.text}</SmartLink></li>
              ))}
            </ul>
          </nav>
          <nav aria-label={f.rechtlichesTitel}>
            <h2 className="etikett">{f.rechtlichesTitel}</h2>
            <ul className="mt-3 grid">
              {f.rechtliches.map((n) => (
                <li key={n.ziel}><SmartLink ziel={n.ziel} className={zeile}>{n.text}</SmartLink></li>
              ))}
              <li><SmartLink ziel={f.bildnachweis.ziel} className={zeile}>{f.bildnachweis.text}</SmartLink></li>
              <li><EinwilligungFussLink titel={t.einwilligung.fussLink} /></li>
            </ul>
          </nav>
        </div>

        <p className="klein mt-10 border-t border-elfenbein/20 pt-6 opacity-85">{zeigeDemoHinweis ? f.demoHinweis : `© ${new Date().getFullYear()} ${f.copyright}`}</p>
      </div>
    </footer>
  );
}

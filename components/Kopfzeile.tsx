import Link from "next/link";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Texte } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "@/lib/format";
import { Bild } from "./Bild";
import { Menue } from "./Menue";
import { NavLink } from "./NavLink";

/**
 * Kopfzeile: Schriftzug des Restaurants (Ausschnitt der Wortmarke) mit Zusatz, drei Seitenlinks, Telefon, Menüknopf (schmal).
 * Die Speisekarte steht in der Navigation an erster Stelle und ist zusätzlich in der mobilen Leiste erreichbar.
 */
export function Kopfzeile({ einstellungen: e, texte: t }: { einstellungen: Einstellungen; texte: Texte }) {
  const anzeige = telefonAnzeige(e.telefon);
  return (
    <header className="kopfzeile">
      <div className="behaelter flex h-16 items-center gap-2 sm:gap-3 lg:h-[4.5rem]">
        <Link href="/" className="marke mr-auto" aria-label={`${e.name}, zur Startseite`}>
          {e.logoSchriftzug ? <Bild bild={e.logoSchriftzug} alt="" sizes="180px" prio /> : <span className="titel-3">{e.kurzname}</span>}
          <span className="zusatz" aria-hidden="true">{t.kopf.zusatz}<br />{e.adresse.ort}</span>
        </Link>
        <nav aria-label={t.kopf.navTitel} className="hauptnav hidden lg:block">
          <ul className="flex items-center gap-1">
            {t.navigation.map((n) => (
              <li key={n.ziel}><NavLink ziel={n.ziel}>{n.text}</NavLink></li>
            ))}
          </ul>
        </nav>
        <a href={telLink(e.telefon)} className="knopf knopf-gold knopf-klein hidden sm:inline-flex" aria-label={`${t.kopf.telefonLabel}: ${anzeige}`}>
          <PhoneIcon size={20} weight="bold" aria-hidden="true" />
          <span className="zahl">{anzeige}</span>
        </a>
        <Menue navigation={t.navigation} texte={t.kopf} startseite={t.kopf.startseite} telefon={telLink(e.telefon)} telefonAnzeige={anzeige} reservieren={t.aufrufe.reservieren.text} adresse={[e.name, e.adresse.strasse, `${e.adresse.plz} ${e.adresse.ort}`]} />
      </div>
    </header>
  );
}

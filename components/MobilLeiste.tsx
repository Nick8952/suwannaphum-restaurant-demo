import Link from "next/link";
import { ForkKnifeIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Texte } from "@/lib/content/modell";

/**
 * Mobile Leiste am unteren Rand: «Speisekarte» und «Anrufen». Der Body reserviert darunter Platz (globals.css),
 * damit sie keinen Inhalt, keinen Dialog und keine Fusszeile verdeckt. Ab 64 rem Breite ausgeblendet.
 */
export function MobilLeiste({ texte: t, telefon, telefonAnzeige, speisekarte }: { texte: Texte; telefon: string; telefonAnzeige: string; speisekarte: string }) {
  return (
    <div className="mobil-leiste" role="navigation" aria-label={t.mobilLeiste.titel}>
      <Link href={speisekarte} className="knopf knopf-sekundaer">
        <ForkKnifeIcon size={20} weight="bold" aria-hidden="true" />
        {t.mobilLeiste.speisekarte}
      </Link>
      <a href={telefon} className="knopf knopf-primaer">
        <PhoneIcon size={20} weight="bold" aria-hidden="true" />
        {t.mobilLeiste.anrufen}<span className="nur-sr">: {telefonAnzeige}</span>
      </a>
    </div>
  );
}

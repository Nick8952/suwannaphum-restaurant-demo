import { ArrowUpRightIcon, MopedIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Texte } from "@/lib/content/modell";
import { SmartLink } from "./SmartLink";

/** Bestätigte Restaurantprofile bei Lieferdiensten als externe Links (neues Fenster, rel noopener). */
export function Lieferdienste({ einstellungen: e, texte: t }: { einstellungen: Einstellungen; texte: Texte }) {
  if (!e.lieferdienste.length) return null;
  return (
    <ul className="flex flex-wrap gap-3">
      {e.lieferdienste.map((d) => (
        <li key={d._key}>
          <SmartLink ziel={d.url} className="knopf knopf-sekundaer">
            <MopedIcon size={20} weight="bold" aria-hidden="true" />
            {t.ui.bestellenBei} {d.name}
            <ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

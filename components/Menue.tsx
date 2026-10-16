"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ListIcon, PhoneIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import type { Link as LinkTyp } from "@/lib/content/modell";
import { NavLink } from "./NavLink";

/**
 * Menü für schmale Bildschirme: natives <dialog> (Fokus bleibt im Dialog, Escape schliesst), ganzflächig,
 * mit den Seitenlinks, dem Telefon und der Adresse. Der Knopf trägt aria-expanded und aria-haspopup.
 */
export function Menue({ navigation, texte: t, startseite, telefon, telefonAnzeige, reservieren, adresse }: { navigation: LinkTyp[]; texte: { menueKnopf: string; menueTitel: string; schliessen: string }; startseite: string; telefon: string; telefonAnzeige: string; reservieren: string; adresse: string[] }) {
  const [offen, setOffen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const knopfRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  /** Nach dem Schliessen (Escape, Knopf, Link) kehrt der Fokus zum Menüknopf zurück, auch wenn der Dialog per Tippen ohne Fokus geöffnet wurde. */
  const schliessen = () => { setOffen(false); knopfRef.current?.focus(); };
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);
  return (
    <>
      <button ref={knopfRef} type="button" className="knopf knopf-sekundaer knopf-klein lg:hidden" aria-haspopup="dialog" aria-expanded={offen} aria-controls={`${id}-dialog`} onClick={() => setOffen(true)}>
        <ListIcon size={20} weight="bold" aria-hidden="true" />
        <span>{t.menueKnopf}</span>
      </button>
      <dialog ref={ref} id={`${id}-dialog`} className="menue" aria-labelledby={`${id}-titel`} onClose={schliessen}>
        <div className="behaelter flex min-h-full flex-col py-4">
          <div className="flex items-center justify-between">
            <p id={`${id}-titel`} className="titel-3">{t.menueTitel}</p>
            <form method="dialog">
              <button type="submit" className="knopf knopf-sekundaer knopf-klein" autoFocus>
                <XIcon size={20} weight="bold" aria-hidden="true" />
                {t.schliessen}
              </button>
            </form>
          </div>
          <nav aria-label={t.menueTitel} className="mt-6">
            <NavLink ziel="/" aktivKlasse="text-petrol-tief" onClick={() => setOffen(false)}>{startseite}</NavLink>
            {navigation.map((n) => (
              <NavLink key={n.ziel} ziel={n.ziel} aktivKlasse="text-petrol-tief" onClick={() => setOffen(false)}>{n.text}</NavLink>
            ))}
          </nav>
          <div className="mt-8 grid gap-4">
            <a href={telefon} className="knopf knopf-primaer">
              <PhoneIcon size={20} weight="bold" aria-hidden="true" />
              {reservieren}<span className="nur-sr">: {telefonAnzeige}</span>
            </a>
            <address className="klein not-italic text-tinte-2">{adresse.map((z) => <span key={z} className="block">{z}</span>)}</address>
          </div>
        </div>
      </dialog>
    </>
  );
}

"use client";

import type { Hinweis, Oeffnungszeiten, Startseite, Texte } from "@/lib/content/modell";
import { WOCHENTAGE } from "@/lib/content/konstanten";
import { kuechenschluss, zeitenText, zustand } from "@/lib/content/zeit";
import { useJetzt } from "@/lib/uhr";

type Stand = ReturnType<typeof zustand>;

/**
 * «Heute»: die Zeiten des aktuellen Wochentags mit Küchenschluss und ob gerade offen ist.
 * Der Server rendert den Stand des Builds (so sieht es auch ohne JavaScript aus); nach dem Laden rechnet der Browser mit
 * seiner eigenen Uhr in der Zeitzone des Restaurants nach (lib/uhr.ts, jede Minute). Es wird nichts gespeichert und nichts übertragen.
 */
export function Heute({ oeffnungszeiten: o, hinweise, texte: t, start, buildStand }: { oeffnungszeiten: Oeffnungszeiten; hinweise: Hinweis[]; texte: Texte["ui"]; start: Startseite["heute"]; buildStand: Stand }) {
  const jetzt = useJetzt();
  const stand: Stand = jetzt ? zustand(o, hinweise, jetzt) : buildStand;
  const tag = WOCHENTAGE[stand.wochentag - 1];
  const ferien = stand.sonder?.art === "betriebsferien" && stand.zeiten.length === 0;
  const kueche = kuechenschluss(stand.zeiten);
  return (
    <div className="heute" aria-live="polite">
      <p className="stand">
        <span className={`punkt${stand.offen ? "" : " zu"}`} aria-hidden="true" />
        {start.titel}, {tag}: {stand.offen ? (stand.kuecheOffen ? "geöffnet" : "geöffnet, Küche geschlossen") : t.geschlossen}
      </p>
      <p>
        {ferien ? <>{stand.sonder?.titel}: {t.geschlossen}</> : <>{stand.sonder ? `${stand.sonder.titel}: ` : ""}{zeitenText(stand.zeiten, start.geschlossen, t.uhr)}</>}
        {!ferien && kueche.length ? <span className="block sm:ml-3 sm:inline">{start.kueche} {kueche.join(` ${t.uhr}, `)} {t.uhr}</span> : null}
      </p>
    </div>
  );
}

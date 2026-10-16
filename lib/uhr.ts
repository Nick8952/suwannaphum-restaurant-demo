"use client";

import { useSyncExternalStore } from "react";

/**
 * Die Uhr des Browsers als externe Quelle für React (useSyncExternalStore): Der Schnappschuss ist die aktuelle Minute,
 * damit sich der Wert nur einmal je Minute ändert. Der Server-Schnappschuss ist null: Beim Build und beim ersten Rendern im
 * Browser zeigen die Komponenten den Stand des Builds, danach rechnen sie mit der echten Uhrzeit. So entsteht kein
 * Hydrations-Unterschied und kein setState in einem Effekt.
 */
const abonnenten = new Set<() => void>();
let start: ReturnType<typeof setTimeout> | null = null;
let takt: ReturnType<typeof setInterval> | null = null;
const melden = () => abonnenten.forEach((f) => f());

function abonnieren(f: () => void) {
  abonnenten.add(f);
  // Erster Tick genau an der nächsten Minutengrenze (sonst liefe die Anzeige bis zu 59 Sekunden nach), danach jede volle Minute.
  if (!start && !takt) start = setTimeout(() => { start = null; melden(); takt = setInterval(melden, 60_000); }, 60_000 - (Date.now() % 60_000));
  return () => {
    abonnenten.delete(f);
    if (abonnenten.size) return;
    if (start) { clearTimeout(start); start = null; }
    if (takt) { clearInterval(takt); takt = null; }
  };
}
const minuteJetzt = () => Math.floor(Date.now() / 60_000);

/** Aktuelle Zeit im Browser, null auf dem Server und während der Hydration. */
export function useJetzt(): Date | null {
  const minute = useSyncExternalStore(abonnieren, minuteJetzt, () => null);
  return minute === null ? null : new Date();
}

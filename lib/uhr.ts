"use client";

import { useSyncExternalStore } from "react";

/**
 * Die Uhr des Browsers als externe Quelle für React (useSyncExternalStore): Der Schnappschuss ist die aktuelle Minute,
 * damit sich der Wert nur einmal je Minute ändert. Der Server-Schnappschuss ist null: Beim Build und beim ersten Rendern im
 * Browser zeigen die Komponenten den Stand des Builds, danach rechnen sie mit der echten Uhrzeit. So entsteht kein
 * Hydrations-Unterschied und kein setState in einem Effekt.
 */
const abonnenten = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function abonnieren(melden: () => void) {
  abonnenten.add(melden);
  if (!timer) timer = setInterval(() => abonnenten.forEach((f) => f()), 60_000);
  return () => {
    abonnenten.delete(melden);
    if (!abonnenten.size && timer) { clearInterval(timer); timer = null; }
  };
}
const minuteJetzt = () => Math.floor(Date.now() / 60_000);

/** Aktuelle Zeit im Browser, null auf dem Server und während der Hydration. */
export function useJetzt(): Date | null {
  const minute = useSyncExternalStore(abonnieren, minuteJetzt, () => null);
  return minute === null ? null : new Date();
}

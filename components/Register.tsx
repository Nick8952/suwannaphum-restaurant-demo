"use client";

import { useEffect, useState } from "react";

/**
 * Register der Speisekarte: Sprunglinks zu allen Kategorien. Schmal als scrollbare Leiste unter der Kopfzeile (klebt),
 * breit als Spalte neben der Karte. Die gerade sichtbare Kategorie wird mit aria-current markiert (IntersectionObserver,
 * kein Scroll-Listener). Ohne JavaScript bleiben es gewöhnliche Sprunglinks.
 */
export function Register({ eintraege, titel }: { eintraege: { slug: string; titel: string }[]; titel: string }) {
  const [aktiv, setAktiv] = useState<string | null>(null);
  useEffect(() => {
    const ziele = eintraege.map((e) => document.getElementById(e.slug)).filter((el): el is HTMLElement => !!el);
    if (!ziele.length || typeof IntersectionObserver === "undefined") return;
    const sichtbar = new Map<string, number>();
    const beobachter = new IntersectionObserver((eintraegeIo) => {
      for (const io of eintraegeIo) sichtbar.set(io.target.id, io.isIntersecting ? io.intersectionRatio : 0);
      // Die oberste sichtbare Kategorie gilt als aktuell
      const erste = ziele.find((z) => (sichtbar.get(z.id) ?? 0) > 0);
      if (erste) setAktiv(erste.id);
    }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01] });
    ziele.forEach((z) => beobachter.observe(z));
    return () => beobachter.disconnect();
  }, [eintraege]);
  return (
    <nav className="register" aria-label={titel}>
      {eintraege.map((e) => (
        <a key={e.slug} href={`#${e.slug}`} aria-current={aktiv === e.slug ? "true" : undefined} onClick={() => setAktiv(e.slug)}>
          {e.titel}
        </a>
      ))}
    </nav>
  );
}

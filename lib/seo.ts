import type { Metadata } from "next";
import type { Bild, Buffet, Einstellungen, Oeffnungszeiten, Texte } from "./content/modell";
import { LAENDERCODES } from "./content/konstanten";
import { tageText, uhrzeit } from "./content/zeit";
import { indexierungErlaubt, siteUrl } from "./deploy-ziel";
import { telLink } from "./assets";
import { pfade } from "./content/pfade";

export { indexierungErlaubt };

const robots = () => (indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false });
/** Lokale Pfade bekommen die Site-URL (samt Unterpfad auf GitHub Pages), Sanity-CDN-URLs bleiben. */
const absolut = (url: string) => (/^https?:\/\//.test(url) ? url : `${siteUrl}${url}`);

/**
 * Metadaten einer Seite. `pfad` ist der Pfad ohne Unterpfad («/kontakt/»); Canonical und Open Graph zeigen immer auf die
 * tatsächliche Adresse der laufenden Installation (Demo: GitHub Pages, später: SITE_URL der Kundendomain).
 * Open-Graph-Angaben werden vollständig je Seite gesetzt, weil Next sie nicht mit denen des Layouts zusammenführt.
 */
export function seitenMetadaten(opt: { titel: string; beschreibung?: string; pfad: string; bild?: Bild; einstellungen: Einstellungen; texte: Texte; istStart?: boolean }): Metadata {
  const { titel, pfad, einstellungen: e, texte: t } = opt;
  const beschreibung = opt.beschreibung ?? t.seo.beschreibung;
  const b = opt.bild ?? e.seoBild;
  const groesste = b.quellen.webp[b.quellen.webp.length - 1];
  return {
    title: opt.istStart ? { absolute: `${e.name}: ${titel}` } : titel,
    description: beschreibung,
    alternates: { canonical: `${siteUrl}${pfad}` },
    openGraph: {
      title: opt.istStart ? `${e.name}: ${titel}` : `${titel} | ${t.seo.titelZusatz}`,
      description: beschreibung,
      url: `${siteUrl}${pfad}`,
      siteName: e.name,
      locale: "de_CH",
      type: "website",
      images: [{ url: absolut(groesste.url), width: b.breite, height: b.hoehe, alt: b.alt }],
    },
    robots: robots(),
  };
}

const TAG_SCHEMA = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

/**
 * Strukturierte Daten vom Typ Restaurant. Sie werden nur ausgegeben, wenn die Indexierung freigegeben ist (INDEXIERUNG=1 auf der
 * Kundendomain). Enthalten sind ausschliesslich belegte Angaben: Name, Adresse, Telefon, Küche, Zahlungsmethoden, Link zur Karte.
 * Öffnungszeiten erscheinen erst, wenn das Restaurant sie bestätigt hat (Freigabe «live»). Keine Bewertungen, keine Preisspanne,
 * kein Gründungsjahr.
 */
export function restaurantJsonLd(e: Einstellungen, o: Oeffnungszeiten, buffet: Buffet) {
  const oeffnungszeiten = o.freigabe === "live"
    ? o.tage.flatMap((t) => t.zeiten.map((z) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: TAG_SCHEMA[t.tag - 1], opens: z.von, closes: z.bis })))
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/#restaurant`,
    name: e.name,
    alternateName: e.nameThai,
    url: `${siteUrl}/`,
    image: absolut(e.seoBild.quellen.webp[e.seoBild.quellen.webp.length - 1].url),
    telephone: telLink(e.telefon).replace("tel:", ""),
    servesCuisine: "Thai",
    acceptsReservations: true,
    paymentAccepted: e.zahlungsmethoden.map((z) => z.name).join(", "),
    hasMenu: `${siteUrl}${pfade.speisekarte}`,
    address: { "@type": "PostalAddress", streetAddress: e.adresse.strasse, postalCode: e.adresse.plz, addressLocality: e.adresse.ort, addressCountry: LAENDERCODES[e.adresse.land] ?? e.adresse.land },
    ...(oeffnungszeiten ? { openingHoursSpecification: oeffnungszeiten } : {}),
    ...(buffet.freigabe === "live" ? { description: `${buffet.titel}: ${tageText(buffet.tage)}, ${uhrzeit(buffet.von)} bis ${uhrzeit(buffet.bis)} Uhr` } : {}),
  };
}

/** JSON für ein <script type="application/ld+json">: «<» wird maskiert, damit Inhalte das Skript nicht beenden können. */
export function jsonLdSicher(daten: unknown): string {
  return JSON.stringify(daten).replace(/</g, "\\u003c");
}

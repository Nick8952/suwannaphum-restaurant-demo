import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { inhaltsquelle, pfade } from "@/lib/content";
import { indexierungErlaubt, siteUrl } from "@/lib/deploy-ziel";
import { jsonLdSicher, restaurantJsonLd } from "@/lib/seo";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "@/lib/format";
import { Kopfzeile } from "@/components/Kopfzeile";
import { Fusszeile } from "@/components/Fusszeile";
import { MobilLeiste } from "@/components/MobilLeiste";
import { Einwilligung } from "@/components/Einwilligung";

// Beide Schriften (SIL OFL, fontsource-Pakete) werden über next/font/local ausgeliefert: Preload, font-display swap,
// angepasste Fallback-Metriken, keine Anfrage an Dritte. Die Thai-Glyphen derselben Familien kommen über @font-face mit
// unicode-range in globals.css und werden nur geladen, wo Thai-Schrift vorkommt.
const schriftTitel = localFont({
  src: [
    { path: "../node_modules/@fontsource/prompt/files/prompt-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/prompt/files/prompt-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--schrift-titel",
  display: "swap",
  adjustFontFallback: "Arial",
});
const schriftText = localFont({
  src: [
    { path: "../node_modules/@fontsource/sarabun/files/sarabun-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/sarabun/files/sarabun-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/sarabun/files/sarabun-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--schrift-text",
  display: "swap",
  adjustFontFallback: "Arial",
});

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t] = await Promise.all([q.getEinstellungen(), q.getTexte()]);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${e.name}: ${e.claim}`, template: `%s | ${t.seo.titelZusatz}` },
    description: t.seo.beschreibung,
    robots: indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff9e6" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const q = await inhaltsquelle();
  const [e, t, o, buffet] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getOeffnungszeiten(), q.getBuffet()]);
  return (
    <html lang="de-CH" className={`${schriftTitel.variable} ${schriftText.variable}`}>
      <body>
        <a href="#inhalt" className="nur-sr klein focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-tinte focus:px-4 focus:py-3 focus:font-semibold focus:text-elfenbein">
          {t.ui.zumInhalt}
        </a>
        {!indexierungErlaubt && t.demoHinweis ? <p className="klein border-b border-linie-stark bg-papier px-4 py-1.5 text-center text-[0.8125rem] text-tinte-2">{t.demoHinweis}</p> : null}
        <Kopfzeile einstellungen={e} texte={t} />
        <main id="inhalt" tabIndex={-1} className="outline-none">{children}</main>
        <Fusszeile einstellungen={e} oeffnungszeiten={o} texte={t} zeigeDemoHinweis={!indexierungErlaubt} />
        <MobilLeiste texte={t} telefon={telLink(e.telefon)} telefonAnzeige={telefonAnzeige(e.telefon)} speisekarte={pfade.speisekarte} />
        <Einwilligung texte={t.einwilligung} datenschutzPfad={pfade.datenschutz} schliessen={t.kopf.schliessen} />
        {indexierungErlaubt ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSicher(restaurantJsonLd(e, o, buffet)) }} /> : null}
      </body>
    </html>
  );
}

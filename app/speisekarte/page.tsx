import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { Buffetblock } from "@/components/Buffetblock";
import { Chilis } from "@/components/Chilis";
import { Kategorie } from "@/components/Kategorie";
import { Register } from "@/components/Register";
import { SmartLink } from "@/components/SmartLink";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, karte] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getSpeisekarte()]);
  return seitenMetadaten({ titel: karte.seoTitel ?? karte.titel, beschreibung: karte.seoBeschreibung, pfad: pfade.speisekarte, einstellungen: e, texte: t });
}

/**
 * Speisekarte: Mittagsbuffet oben, dann alle Kategorien untereinander mit Register (schmal: klebende Leiste, breit: Spalte).
 * Am Ende Schärfe, Deklaration und der Hinweis zu Allergenen. Alles ist auch ohne JavaScript vollständig lesbar.
 */
export default async function Speisekarte() {
  const q = await inhaltsquelle();
  const [t, karte, buffet] = await Promise.all([q.getTexte(), q.getSpeisekarte(), q.getBuffet()]);
  const eintraege = [{ slug: "mittagsbuffet", titel: buffet.titel }, ...karte.kategorien.map((k) => ({ slug: k.slug, titel: k.titel }))];
  return (
    <>
      <header className="behaelter einstieg pt-10 lg:pt-14">
        <h1 className="titel-1">{karte.titel}</h1>
        <p className="vorspann mt-4">{karte.einleitung}</p>
        {karte.pdf ? <p className="mt-3"><SmartLink ziel={karte.pdf.url} className="textlink">{karte.pdf.titel}</SmartLink></p> : null}
      </header>
      <div className="register-leiste mt-6 lg:hidden">
        <div className="behaelter"><Register eintraege={eintraege} titel={t.ui.kategorienTitel} /></div>
      </div>
      <div className="behaelter mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block" aria-label={t.ui.kategorienTitel}>
          <Register eintraege={eintraege} titel={t.ui.kategorienTitel} />
        </aside>
        <div>
          <div className="kategorie" id="mittagsbuffet">
            <Buffetblock buffet={buffet} texte={t} id="mittagsbuffet-block" />
          </div>
          <div className="mt-12 grid gap-12">
            {karte.kategorien.map((k) => (
              <Kategorie key={k.slug} kategorie={k} karte={karte} texte={t} />
            ))}
          </div>

          <section className="kategorie mt-12 grid gap-8 border-t border-linie-stark pt-10 sm:grid-cols-2" aria-labelledby="schaerfe-titel" id="schaerfe">
            <div>
              <h2 id="schaerfe-titel" className="titel-3">{karte.schaerfe.titel}</h2>
              <p className="klein mt-2 text-tinte-2">{karte.schaerfe.text}</p>
              <ul className="mt-3 grid gap-1">
                {karte.schaerfe.stufen.map((s) => (
                  <li key={s.grad} className="flex items-center gap-3"><Chilis grad={s.grad} stufen={karte.schaerfe.stufen} label={t.ui.schaerfeLabel} /><span>{s.text}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="titel-3">{karte.allergenTitel}</h2>
              <p className="klein mt-2 text-tinte-2">{karte.allergenHinweis}</p>
            </div>
          </section>

          <section className="kategorie mt-10" aria-labelledby="deklaration-titel" id="deklaration">
            <h2 id="deklaration-titel" className="titel-3">{karte.deklaration.titel}</h2>
            {karte.deklaration.einleitung ? <p className="klein mt-2 text-tinte-2">{karte.deklaration.einleitung}</p> : null}
            <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {karte.deklaration.eintraege.map((d) => (
                <div key={d._key} className="flex items-baseline gap-3 border-b border-linie py-1.5">
                  <dt className="font-semibold">{d.produkt}</dt>
                  <dd className="ml-auto text-right text-tinte-2">{d.land}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}

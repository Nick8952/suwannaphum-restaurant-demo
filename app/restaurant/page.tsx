import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { telefonAnzeige } from "@/lib/format";
import { Aufruf } from "@/components/Aufruf";
import { Bild } from "@/components/Bild";
import { Galerie } from "@/components/Galerie";
import { Seitenkopf } from "@/components/Seitenkopf";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, r] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getRestaurantSeite()]);
  return seitenMetadaten({ titel: r.seoTitel ?? r.titel, beschreibung: r.seoBeschreibung, pfad: pfade.restaurant, bild: r.bild, einstellungen: e, texte: t });
}

export default async function Restaurant() {
  const q = await inhaltsquelle();
  const [e, t, r] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getRestaurantSeite()]);
  return (
    <>
      <Seitenkopf titel={r.titel} einleitung={r.einleitung} bild={r.bild} />

      <section className="behaelter abschnitt grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" aria-labelledby="geschichte-titel">
        <div>
          <h2 id="geschichte-titel" className="titel-2">{r.geschichte.titel}</h2>
          <div className="lauftext mt-4 grid gap-4">
            {r.geschichte.absaetze.map((a, i) => <p key={i}>{a}</p>)}
          </div>
        </div>
        {r.name ? (
          <div className="self-start rounded-(--radius-flaeche) bg-sand p-6 sm:p-8">
            <h2 className="titel-3">{r.name.titel}</h2>
            {e.nameThai ? <p className="titel-2 mt-2" lang="th">{e.nameThai}</p> : null}
            <p className="mt-3">{r.name.text}</p>
          </div>
        ) : null}
      </section>

      <section className="behaelter abschnitt pt-0" aria-labelledby="team-titel">
        <h2 id="team-titel" className="titel-2">{r.team.titel}</h2>
        {r.team.text ? <p className="vorspann mt-3">{r.team.text}</p> : null}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <ul className="grid gap-6">
            {r.team.mitglieder.map((m) => (
              <li key={m._key} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                {m.bild ? <div className="bild-flaeche quer"><Bild bild={m.bild} sizes="(min-width: 64rem) 30vw, 100vw" /></div> : null}
                <div className="self-center">
                  <p className="titel-3">{m.name}</p>
                  {m.rolle ? <p className="etikett mt-1">{m.rolle}</p> : null}
                  {m.text ? <p className="mt-3 text-tinte-2">{m.text}</p> : null}
                </div>
              </li>
            ))}
          </ul>
          {r.team.gruppenbild ? (
            <figure className="max-w-sm">
              <div className="bild-flaeche hoch"><Bild bild={r.team.gruppenbild} sizes="(min-width: 64rem) 25vw, 100vw" /></div>
              {r.team.gruppenbild.legende ? <figcaption className="legende">{r.team.gruppenbild.legende}</figcaption> : null}
            </figure>
          ) : null}
        </div>
      </section>

      <section className="behaelter abschnitt pt-0" aria-labelledby="einblicke-titel">
        <h2 id="einblicke-titel" className="titel-2">{r.einblicke.titel}</h2>
        {r.einblicke.text ? <p className="vorspann mt-3">{r.einblicke.text}</p> : null}
        <div className="mt-6"><Galerie bilder={r.einblicke.bilder} symbolbildText={t.ui.symbolbild} /></div>
      </section>

      <Aufruf titel={r.aufruf.titel} text={r.aufruf.text} knopf={r.aufruf.knopf} telefonAnzeige={telefonAnzeige(e.telefon)} />
    </>
  );
}

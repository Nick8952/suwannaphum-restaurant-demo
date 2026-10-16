import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { RichText } from "@/components/RichText";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getRechtSeite("impressum")]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.impressum, einstellungen: e, texte: t });
}

/** Impressum der Demo. Unter dem Zwischentitel «Bildnachweis» fügt die Seite die Liste aller Bilder mit Nachweis ein. */
export default async function Impressum() {
  const q = await inhaltsquelle();
  const [s, nachweise] = await Promise.all([q.getRechtSeite("impressum"), q.getBildnachweise()]);
  const index = s.bloecke.findIndex((b) => b.art === "titel" && b.anker === "bildnachweis");
  const vor = index >= 0 ? s.bloecke.slice(0, index + 2) : s.bloecke;
  const nach = index >= 0 ? s.bloecke.slice(index + 2) : [];
  return (
    <article className="behaelter einstieg pb-6 pt-10 lg:pt-16">
      <h1 className="titel-1">{s.titel}</h1>
      {s.einleitung ? <p className="vorspann mt-5">{s.einleitung}</p> : null}
      <p className="klein mt-3 text-grau">Stand: {s.stand}</p>
      <div className="mt-8">
        <RichText bloecke={vor} />
        {index >= 0 ? (
          <ul className="fliesstext mt-4 grid gap-2 pl-5" style={{ listStyle: "square" }}>
            {nachweise.map((n, i) => (
              <li key={i} className="max-w-[70ch]"><span className="font-semibold">{n.titel}</span>: {n.urheber}, {n.quelle}, {n.lizenz}</li>
            ))}
          </ul>
        ) : null}
        {nach.length ? <RichText bloecke={nach} /> : null}
      </div>
    </article>
  );
}

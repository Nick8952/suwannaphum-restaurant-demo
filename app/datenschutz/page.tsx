import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { RichText } from "@/components/RichText";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getRechtSeite("datenschutz")]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.datenschutz, einstellungen: e, texte: t });
}

export default async function Datenschutz() {
  const q = await inhaltsquelle();
  const s = await q.getRechtSeite("datenschutz");
  return (
    <article className="behaelter einstieg pb-6 pt-10 lg:pt-16">
      <h1 className="titel-1">{s.titel}</h1>
      {s.einleitung ? <p className="vorspann mt-5">{s.einleitung}</p> : null}
      <p className="klein mt-3 text-grau">Stand: {s.stand}</p>
      <div className="mt-8"><RichText bloecke={s.bloecke} /></div>
    </article>
  );
}

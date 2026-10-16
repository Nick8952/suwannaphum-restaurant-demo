import "server-only";
import einstellungenRoh from "@/data/einstellungen.json";
import oeffnungszeitenRoh from "@/data/oeffnungszeiten.json";
import hinweiseRoh from "@/data/hinweise.json";
import buffetRoh from "@/data/buffet.json";
import speisekarteRoh from "@/data/speisekarte.json";
import texteRoh from "@/data/texte.json";
import startseiteRoh from "@/data/startseite.json";
import restaurantRoh from "@/data/seiten/restaurant.json";
import kontaktRoh from "@/data/seiten/kontakt.json";
import impressumRoh from "@/data/seiten/impressum.json";
import datenschutzRoh from "@/data/seiten/datenschutz.json";
import bilderRoh from "@/data/bilder.json";
import { z } from "zod";
import {
  buffetSchema, einstellungenSchema, hinweisSchema, kontaktSeiteSchema, oeffnungszeitenSchema, pruefen, rechtSeiteSchema, restaurantSeiteSchema,
  speisekarteSchema, startseiteSchema, texteSchema, type Bild, type Inhaltsquelle,
} from "./modell";
import { bloecke, type RohBlock } from "./text";

/**
 * Lokale Inhaltsquelle: liest data/*.json, löst Bildkennungen auf und prüft alles gegen das Domainmodell.
 * Das ist der Inhaltsbestand der GitHub-Pages-Demo. Dieselben Dateien sind die Vorlage für den Import nach Sanity (scripts/seed.mts).
 */
type BildEintrag = { id: string; breite: number; hoehe: number; alt: string; legende: string | null; symbolbild: boolean; nachweis: { urheber: string; quelle: string; lizenz: string }; quellen: Bild["quellen"] };
const bilder = bilderRoh as unknown as Record<string, BildEintrag>;

export function bild(id: string): Bild {
  const b = bilder[id];
  if (!b) throw new Error(`Bild «${id}» fehlt in data/bilder.json (npm run bilder ausführen oder Kennung korrigieren).`);
  return { alt: b.alt, breite: b.breite, hoehe: b.hoehe, quellen: b.quellen, symbolbild: b.symbolbild, legende: b.legende ?? undefined, nachweis: { urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz } };
}
const bildOptional = (id: string | undefined) => (id ? bild(id) : undefined);

const einstellungen = pruefen(einstellungenSchema, { ...einstellungenRoh, logo: bild(einstellungenRoh.logo), logoSchriftzug: bildOptional(einstellungenRoh.logoSchriftzug), seoBild: bild(einstellungenRoh.seoBild) }, "data/einstellungen.json");
const oeffnungszeiten = pruefen(oeffnungszeitenSchema, oeffnungszeitenRoh, "data/oeffnungszeiten.json");
const hinweise = pruefen(z.array(hinweisSchema), hinweiseRoh, "data/hinweise.json");
const buffet = pruefen(buffetSchema, { ...buffetRoh, bild: bildOptional(buffetRoh.bild) }, "data/buffet.json");
const speisekarte = pruefen(
  speisekarteSchema,
  { ...speisekarteRoh, kategorien: speisekarteRoh.kategorien.map((k) => ({ ...k, gerichte: k.gerichte.map((g) => ({ ...g, bild: bildOptional("bild" in g ? g.bild : undefined) })) })) },
  "data/speisekarte.json",
);
const texte = pruefen(texteSchema, texteRoh, "data/texte.json");
const startseite = pruefen(
  startseiteSchema,
  {
    ...startseiteRoh,
    hero: { ...startseiteRoh.hero, bild: bild(startseiteRoh.hero.bild) },
    speisekarte: { ...startseiteRoh.speisekarte, kacheln: startseiteRoh.speisekarte.kacheln.map((k) => ({ ...k, bild: bild(k.bild) })) },
    restaurant: { ...startseiteRoh.restaurant, bilder: startseiteRoh.restaurant.bilder.map(bild) },
    takeaway: { ...startseiteRoh.takeaway, bild: bildOptional(startseiteRoh.takeaway.bild) },
  },
  "data/startseite.json",
);
const restaurantSeite = pruefen(
  restaurantSeiteSchema,
  {
    ...restaurantRoh,
    bild: bild(restaurantRoh.bild),
    team: { ...restaurantRoh.team, mitglieder: restaurantRoh.team.mitglieder.map((m) => ({ ...m, bild: bildOptional(m.bild) })), gruppenbild: bildOptional(restaurantRoh.team.gruppenbild) },
    einblicke: { ...restaurantRoh.einblicke, bilder: restaurantRoh.einblicke.bilder.map(bild) },
  },
  "data/seiten/restaurant.json",
);
const kontaktSeite = pruefen(kontaktSeiteSchema, kontaktRoh, "data/seiten/kontakt.json");
const impressum = pruefen(rechtSeiteSchema, { ...impressumRoh, bloecke: bloecke(impressumRoh.bloecke as RohBlock[]) }, "data/seiten/impressum.json");
const datenschutz = pruefen(rechtSeiteSchema, { ...datenschutzRoh, bloecke: bloecke(datenschutzRoh.bloecke as RohBlock[]) }, "data/seiten/datenschutz.json");

export const lokaleQuelle: Inhaltsquelle = {
  getEinstellungen: async () => einstellungen,
  getOeffnungszeiten: async () => oeffnungszeiten,
  getHinweise: async () => hinweise,
  getBuffet: async () => buffet,
  getSpeisekarte: async () => speisekarte,
  getTexte: async () => texte,
  getStartseite: async () => startseite,
  getRestaurantSeite: async () => restaurantSeite,
  getKontaktSeite: async () => kontaktSeite,
  getRechtSeite: async (slug) => (slug === "impressum" ? impressum : datenschutz),
  getBildnachweise: async () => {
    const gesehen = new Set<string>();
    return Object.values(bilder)
      .filter((b) => b.id !== "og-suwannaphum")
      .filter((b) => (gesehen.has(b.nachweis.quelle + b.alt) ? false : (gesehen.add(b.nachweis.quelle + b.alt), true)))
      .map((b) => ({ titel: b.legende ?? b.alt, urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz }));
  },
};

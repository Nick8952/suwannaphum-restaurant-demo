import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { deDELocale } from "@sanity/locale-de-de";
import { schemaTypes, EINZELDOKUMENTE } from "./schemas";
import { dataset, projectId } from "./env";

/**
 * Studio der Suwannaphum-Website. Die Seitenleiste ist nach dem geordnet, was das Restaurant am häufigsten ändert:
 * zuerst Speisekarte und Preise, dann Öffnungszeiten, Hinweise und Buffet, dann die Seiten, zuletzt Kontakt und Texte.
 * Einzeldokumente lassen sich weder doppelt anlegen noch löschen.
 */
const einzel = (S: StructureBuilder, typ: string, titel: string, id = typ) => S.listItem().title(titel).id(id).child(S.document().schemaType(typ).documentId(id).title(titel));

export default defineConfig({
  name: "suwannaphum",
  title: "Thai Restaurant Suwannaphum",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalte")
          .items([
            S.documentTypeListItem("kategorie").title("Speisekarte: Kategorien und Gerichte"),
            einzel(S, "speisekarte", "Speisekarte: Allgemeines"),
            S.divider(),
            einzel(S, "oeffnungszeiten", "Öffnungszeiten und Küchenzeiten"),
            S.documentTypeListItem("hinweis").title("Hinweise (Betriebsferien, Mitteilungen)"),
            einzel(S, "buffet", "Mittagsbuffet"),
            S.divider(),
            S.listItem().title("Seiten").child(
              S.list().title("Seiten").items([
                einzel(S, "startseite", "Startseite"),
                einzel(S, "restaurantSeite", "Restaurant und Team"),
                einzel(S, "kontaktSeite", "Kontakt, Reservation und Anfahrt"),
                einzel(S, "rechtSeite", "Impressum", "rechtSeite-impressum"),
                einzel(S, "rechtSeite", "Datenschutzerklärung", "rechtSeite-datenschutz"),
              ]),
            ),
            S.divider(),
            einzel(S, "einstellungen", "Restaurant und Kontakt"),
            einzel(S, "texte", "Navigation, Fusszeile und kleine Texte"),
          ]),
    }),
    visionTool(),
    deDELocale(),
  ],
  schema: {
    types: schemaTypes,
    // Einzeldokumente erscheinen nicht unter «Neu anlegen»
    templates: (vorlagen) => vorlagen.filter((v) => !EINZELDOKUMENTE.includes(v.schemaType)),
  },
  document: {
    actions: (aktionen, kontext) => (EINZELDOKUMENTE.includes(kontext.schemaType) ? aktionen.filter((a) => !["unpublish", "delete", "duplicate"].includes(a.action ?? "")) : aktionen),
  },
});

// Prüfungen der Zeitlogik (lib/content/zeit.ts) mit dem Node-Testläufer: npm run zeit:pruefen
// Randfälle aus der Codex-Abschlussprüfung: Schnitt mitten im Zeitfenster, in der Pause, um 00:00, genau am Fensterende, mehrere
// Fenster, Küchenschluss; dazu Zeitzone (Mitternacht, Sommer- und Winterzeit), Rangfolge der Hinweise und die Zeilen der Tabelle.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Hinweis, Oeffnungszeiten } from "../lib/content/modell";
import { bisGekuerzt, geltendeZeiten, hinweisAktiv, lokal, tageText, zeitenText, zeitenZeilen, zustand } from "../lib/content/zeit";

const o = JSON.parse(readFileSync(new URL("../data/oeffnungszeiten.json", import.meta.url), "utf8")) as Oeffnungszeiten;
const montag = o.tage[0].zeiten; // 11:00 bis 14:00 und 16:30 bis 21:00 (Küche bis 20:30)
const quelle = { quelle: "Prüfung", url: "https://example.com/", abgerufen: "2026-10-16", art: "aushang" as const };
const ferien = (extra: Partial<Hinweis> = {}): Hinweis => ({ _key: "f", art: "betriebsferien", titel: "Betriebsferien", text: "x", anzeigenVon: "2026-04-01", anzeigenBis: "2026-05-16", geschlossenVon: "2026-04-30", geschlossenBis: "2026-05-16", herkunft: [quelle], freigabe: "demo", ...extra });
const sonderzeiten = (extra: Partial<Hinweis> = {}): Hinweis => ({ _key: "s", art: "sonderoeffnungszeiten", titel: "Sonderöffnungszeiten", text: "x", anzeigenVon: "2026-04-01", anzeigenBis: "2026-05-16", geschlossenVon: "2026-05-03", geschlossenBis: "2026-05-03", zeiten: [{ _key: "x", von: "12:00", bis: "18:00" }], herkunft: [quelle], freigabe: "demo", ...extra });

test("Schnitt mitten im Abendfenster kürzt es und lässt den Küchenschluss fallen", () => {
  assert.deepEqual(bisGekuerzt(montag, "18:00"), [montag[0], { _key: "mo2", von: "16:30", bis: "18:00" }]);
});
test("Schnitt in der Pause behält nur das Mittagsfenster", () => {
  assert.deepEqual(bisGekuerzt(montag, "15:00"), [montag[0]]);
});
test("Schnitt genau am Fensterende behält das Fenster unverändert", () => {
  assert.deepEqual(bisGekuerzt(montag, "14:00"), [montag[0]]);
});
test("Schnitt um 00:00 schliesst den ganzen Tag", () => {
  assert.deepEqual(bisGekuerzt(montag, "00:00"), []);
});
test("Schnitt im ersten von mehreren Fenstern kürzt das erste und entfernt die späteren", () => {
  assert.deepEqual(bisGekuerzt(montag, "12:00"), [{ _key: "mo1", von: "11:00", bis: "12:00" }]);
});
test("Küchenschluss bleibt, wenn er vor dem Schnitt liegt; fällt beim Schnitt genau am Küchenschluss", () => {
  assert.deepEqual(bisGekuerzt(montag, "20:45")[1], { _key: "mo2", von: "16:30", bis: "20:45", kuecheBis: "20:30" });
  assert.deepEqual(bisGekuerzt(montag, "20:30")[1], { _key: "mo2", von: "16:30", bis: "20:30" });
});

test("Betriebsferien: erster Tag ab 14:00 nur Mittag, Folgetage geschlossen, danach wieder Wochenplan", () => {
  const h = [ferien({ geschlossenAb: "14:00" })];
  assert.deepEqual(geltendeZeiten(o, h, "2026-04-30", 4).zeiten, [o.tage[3].zeiten[0]]);
  assert.deepEqual(geltendeZeiten(o, h, "2026-05-01", 5).zeiten, []);
  assert.deepEqual(geltendeZeiten(o, h, "2026-05-16", 6).zeiten, []);
  assert.deepEqual(geltendeZeiten(o, h, "2026-05-18", 1).zeiten, montag);
  assert.equal(geltendeZeiten(o, h, "2026-05-18", 1).sonder, undefined);
});
test("Betriebsferien ohne Uhrzeit schliessen auch den ersten Tag ganz", () => {
  assert.deepEqual(geltendeZeiten(o, [ferien()], "2026-04-30", 4).zeiten, []);
});
test("Sonderöffnungszeiten ersetzen den Wochenplan (auch am sonst geschlossenen Sonntag)", () => {
  const g = geltendeZeiten(o, [sonderzeiten()], "2026-05-03", 7);
  assert.deepEqual(g.zeiten, [{ _key: "x", von: "12:00", bis: "18:00" }]);
  assert.equal(g.sonder?.art, "sonderoeffnungszeiten");
});
test("Betriebsferien haben Vorrang vor gleichzeitigen Sonderöffnungszeiten", () => {
  const g = geltendeZeiten(o, [sonderzeiten(), ferien()], "2026-05-03", 7);
  assert.deepEqual(g.zeiten, []);
  assert.equal(g.sonder?.art, "betriebsferien");
});
test("Mitteilungen ändern die Zeiten nie", () => {
  const m: Hinweis = { _key: "m", art: "mitteilung", titel: "Hinweis", text: "x", anzeigenVon: "2026-10-01", anzeigenBis: "2026-10-31", herkunft: [quelle], freigabe: "demo" };
  assert.deepEqual(geltendeZeiten(o, [m], "2026-10-19", 1).zeiten, montag);
});
test("Anzeigefenster eines Hinweises schliesst die Randtage ein", () => {
  const h = ferien();
  assert.equal(hinweisAktiv(h, "2026-03-31"), false);
  assert.equal(hinweisAktiv(h, "2026-04-01"), true);
  assert.equal(hinweisAktiv(h, "2026-05-16"), true);
  assert.equal(hinweisAktiv(h, "2026-05-17"), false);
});

test("lokal(): Mitternacht in Zürich ergibt Stunde 0 und den richtigen Tag", () => {
  assert.deepEqual(lokal(new Date("2026-10-15T22:00:00Z")), { datum: "2026-10-16", wochentag: 5, minuten: 0 });
});
test("lokal(): Sommerzeitbeginn 29.03.2026 (01:59 → 03:00) und Winterzeit 25.10.2026 (02:59 → 02:00)", () => {
  assert.equal(lokal(new Date("2026-03-29T00:59:00Z")).minuten, 1 * 60 + 59);
  assert.equal(lokal(new Date("2026-03-29T01:00:00Z")).minuten, 3 * 60);
  assert.equal(lokal(new Date("2026-10-25T00:59:00Z")).minuten, 2 * 60 + 59);
  assert.equal(lokal(new Date("2026-10-25T01:00:00Z")).minuten, 2 * 60);
  assert.equal(lokal(new Date("2026-10-25T01:00:00Z")).wochentag, 7);
});

test("zustand(): offen, Küche zu, Sonntag zu, Betriebsferien zu", () => {
  assert.equal(zustand(o, [], new Date("2026-10-19T10:00:00Z")).offen, true); // Montag 12:00
  assert.equal(zustand(o, [], new Date("2026-10-19T10:00:00Z")).kuecheOffen, true);
  const spaet = zustand(o, [], new Date("2026-10-19T18:45:00Z")); // Montag 20:45: Restaurant offen, Küche seit 20:30 zu
  assert.equal(spaet.offen, true);
  assert.equal(spaet.kuecheOffen, false);
  assert.equal(zustand(o, [], new Date("2026-10-18T10:00:00Z")).offen, false); // Sonntag
  const f = zustand(o, [ferien()], new Date("2026-05-01T10:00:00Z"));
  assert.equal(f.offen, false);
  assert.equal(f.sonder?.art, "betriebsferien");
});

test("zeitenZeilen(): gleiche Nachbartage werden zusammengefasst, mit numerischen Grenzen", () => {
  const zeilen = zeitenZeilen(o);
  assert.deepEqual(zeilen.map((z) => [z.tage, z.von, z.bis]), [["Montag und Dienstag", 1, 2], ["Mittwoch", 3, 3], ["Donnerstag", 4, 4], ["Freitag", 5, 5], ["Samstag", 6, 6], ["Sonntag", 7, 7]]);
  assert.deepEqual(zeilen[5].zeiten, []);
  const gleich = { tage: o.tage.map((t) => ({ tag: t.tag, zeiten: t.tag <= 5 ? montag : [] })) };
  assert.deepEqual(zeitenZeilen(gleich).map((z) => [z.tage, z.von, z.bis]), [["Montag bis Freitag", 1, 5], ["Samstag und Sonntag", 6, 7]]);
});
test("tageText() und zeitenText()", () => {
  assert.equal(tageText([1, 2, 3, 4, 5]), "Montag bis Freitag");
  assert.equal(tageText([6]), "Samstag");
  assert.equal(tageText([3, 1]), "Montag und Mittwoch");
  assert.equal(zeitenText(montag, "geschlossen"), "11.00 bis 14.00 und 16.30 bis 21.00 Uhr");
  assert.equal(zeitenText([], "geschlossen"), "geschlossen");
});

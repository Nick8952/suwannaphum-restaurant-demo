// Überwachung der Live-Website: läuft alle 30 Minuten in GitHub Actions (.github/workflows/ueberwachung.yml) und bei Bedarf lokal.
// Aufruf: node werkzeuge/ueberwachung.mjs            (SITE=https://www.suwannaphum.ch ist voreingestellt)
// Ergebnis: Exit-Code 0 = alles in Ordnung; 1 = mindestens eine Prüfung fehlgeschlagen (der Workflow legt dann ein Issue an).
// Ohne Abhängigkeiten, wenige Anfragen (unter zehn je Lauf), eigener User-Agent, damit die Prüfung in Protokollen erkennbar ist.
import tls from "node:tls";

const SITE = (process.env.SITE ?? "https://www.suwannaphum.ch").replace(/\/$/, "");
const HOST = new URL(SITE).hostname;
const UA = "Suwannaphum-Ueberwachung/1.0 (+https://github.com/Nick8952/suwannaphum-restaurant-demo)";
const ZEITLIMIT_MS = 15000;
const befunde = [];
const ok = [];

async function holen(url, { redirect = "manual" } = {}) {
  const start = Date.now();
  const r = await fetch(url, { redirect, headers: { "user-agent": UA, accept: "text/html,application/xml,text/plain,*/*" }, signal: AbortSignal.timeout(ZEITLIMIT_MS) });
  const text = await r.text();
  return { status: r.status, text, dauer: Date.now() - start, location: r.headers.get("location") ?? "" };
}
function pruefe(name, bedingung, detail = "") {
  (bedingung ? ok : befunde).push(`${name}${detail ? ` (${detail})` : ""}`);
}
async function seite(pfad, erwartungen) {
  try {
    const a = await holen(SITE + pfad);
    pruefe(`${pfad}: Status 200`, a.status === 200, `Status ${a.status}, ${a.dauer} ms`);
    pruefe(`${pfad}: Antwort unter 5 s`, a.dauer < 5000, `${a.dauer} ms`);
    pruefe(`${pfad}: keine Sperrseite`, !/Security Checkpoint|Sicherheitskontrollpunkt|Deployment not found|DEPLOYMENT_NOT_FOUND/i.test(a.text));
    for (const [name, test] of erwartungen) pruefe(`${pfad}: ${name}`, test(a.text));
  } catch (e) {
    befunde.push(`${pfad}: nicht erreichbar (${e.name}: ${e.message})`);
  }
}

// 1. Die wichtigsten Seiten mit Inhalt und SEO-Zustand
await seite("/", [
  ["Titel mit Restaurantname", (t) => /<title>[^<]*Suwannaphum/.test(t)],
  ["index, follow (kein noindex)", (t) => /name="robots" content="index, follow"/.test(t) && !/noindex/.test(t)],
  ["Canonical auf die Domain", (t) => t.includes(`<link rel="canonical" href="${SITE}/"`)],
  ["strukturierte Daten vorhanden", (t) => t.includes('application/ld+json')],
  ["kein Entwurfshinweis", (t) => !t.includes("Verkaufs-Demo")],
  ["Telefonnummer verlinkt", (t) => t.includes("tel:+41445558299")],
]);
await seite("/speisekarte/", [["Speisekarte mit Thai Specials und Buffet", (t) => t.includes('id="thai-specials"') && t.includes('id="mittagsbuffet"')]]);
await seite("/kontakt/", [["Öffnungszeiten vorhanden", (t) => t.includes('id="oeffnungszeiten"')]]);
await seite("/impressum/", [["Impressum mit UID", (t) => t.includes("CHE-498.447.349")]]);

// 2. Sitemap, robots.txt, Weiterleitung der nackten Domain, Fehlerseite
try {
  const s = await holen(SITE + "/sitemap.xml");
  pruefe("/sitemap.xml: 200 mit Seiten", s.status === 200 && (s.text.match(/<loc>/g) ?? []).length >= 6, `Status ${s.status}`);
  const r = await holen(SITE + "/robots.txt");
  pruefe("/robots.txt: nennt die Sitemap, sperrt nicht", r.status === 200 && /Sitemap:/.test(r.text) && !/Disallow:\s*\/\s*$/m.test(r.text), `Status ${r.status}`);
  const apex = await holen(`https://${HOST.replace(/^www\./, "")}/`);
  pruefe("Domain ohne www leitet auf www", [301, 302, 307, 308].includes(apex.status) && apex.location.startsWith(SITE), `Status ${apex.status} → ${apex.location}`);
  const f = await holen(SITE + "/diese-seite-gibt-es-nicht/");
  pruefe("Unbekannte Adresse: 404 mit gestalteter Seite", f.status === 404 && f.text.includes("Diese Seite gibt es nicht"), `Status ${f.status}`);
} catch (e) {
  befunde.push(`Sitemap/robots/Weiterleitung: Fehler (${e.message})`);
}

// 3. Zertifikat: läuft es in den nächsten 14 Tagen ab, Alarm (Vercel erneuert von selbst; sonst stimmt etwas an der Domain nicht)
await new Promise((resolve) => {
  const sock = tls.connect({ host: HOST, port: 443, servername: HOST, timeout: ZEITLIMIT_MS }, () => {
    const cert = sock.getPeerCertificate();
    const tage = Math.floor((new Date(cert.valid_to) - Date.now()) / 86400000);
    pruefe("TLS-Zertifikat gültig, mindestens 14 Tage", sock.authorized && tage >= 14, `läuft ab in ${tage} Tagen, Aussteller ${cert.issuer?.O ?? "?"}`);
    sock.end(); resolve();
  });
  sock.on("error", (e) => { befunde.push(`TLS: ${e.message}`); resolve(); });
  sock.on("timeout", () => { befunde.push("TLS: Zeitüberschreitung"); sock.destroy(); resolve(); });
});

// Ausgabe
const stand = new Date().toLocaleString("de-CH", { timeZone: "Europe/Zurich" });
for (const z of ok) console.log(`✓ ${z}`);
for (const z of befunde) console.log(`✗ ${z}`);
console.log(`\n${befunde.length ? "✗" : "✓"} ${SITE}: ${ok.length} Prüfungen bestanden, ${befunde.length} Befund(e) · ${stand}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ${befunde.length ? "✗ Befunde" : "✓ Alles in Ordnung"} · ${stand}\n\n${[...befunde.map((b) => `- ✗ ${b}`), ...ok.map((o) => `- ✓ ${o}`)].join("\n")}\n`);
}
if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_OUTPUT, `befunde<<EOB\n${befunde.join("\n")}\nEOB\n`);
}
process.exit(befunde.length ? 1 : 0);

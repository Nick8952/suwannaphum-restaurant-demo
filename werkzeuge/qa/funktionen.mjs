// Funktionsprüfungen im echten Browser (puppeteer-core). Vorschau-Server nötig: npm run vorschau:pages
// Geprüft wird, was ein Gast bedienen würde: Erstbesuch ohne Dienste Dritter, Tastatur, mobiles Menü und mobile Leiste,
// Speisekarte (Register, Vollständigkeit, Preise, Preistabelle, Schärfe, Thai-Schrift), Heute-Anzeige und Hinweise,
// Telefon- und Lieferdienst-Links, Fehlerseite, Adressen (Direktaufruf, Neuladen), reduzierte Bewegung.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { BASE, alleSeiten, browserStarten, externeAnfragen, warten } from "./chrome.mjs";
const ergebnisse = [];
const ok = (name, bedingung, detail = "") => { ergebnisse.push({ name, ok: !!bedingung, detail }); console.log(`${bedingung ? "✓" : "✗"} ${name}${detail ? " · " + detail : ""}`); };
const browser = await browserStarten();
const einstellungen = JSON.parse(readFileSync("data/einstellungen.json", "utf8"));
const karte = JSON.parse(readFileSync("data/speisekarte.json", "utf8"));
const zeiten = JSON.parse(readFileSync("data/oeffnungszeiten.json", "utf8"));
const hinweise = JSON.parse(readFileSync("data/hinweise.json", "utf8"));
const TEL = "tel:" + einstellungen.telefon.replace(/\s/g, "");
const GERICHTE = karte.kategorien.reduce((n, k) => n + k.gerichte.length, 0);
const UNTERPFAD = new URL(BASE).pathname.replace(/\/$/, "");
async function frisch({ breite = 1440, hoehe = 900, reduziert = false } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: breite, height: hoehe });
  if (reduziert) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  return { ctx, page, extern: externeAnfragen(page) };
}

// 1) Erstbesuch: nichts von Dritten, kein Banner, kein Speicher, Demo-Kennzeichnung
{
  const { ctx, page, extern } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" }); await warten(400);
  ok("Erstbesuch: keine Anfragen an fremde Hosts", extern.length === 0, extern.join(","));
  ok("Erstbesuch: kein Einwilligungsbanner (keine einwilligungspflichtigen Dienste)", (await page.$('[role="region"][aria-label="Datenschutz-Einstellungen"]')) === null);
  ok("Erstbesuch: kein Speicher, keine Cookies", (await page.evaluate(() => Object.keys(localStorage).length + Object.keys(sessionStorage).length)) === 0 && (await page.evaluate(() => document.cookie)) === "");
  ok("Demo: Entwurfshinweis sichtbar", await page.evaluate(() => document.body.textContent.includes("nicht die offizielle Website")));
  ok("Demo: noindex auf der Startseite", await page.evaluate(() => document.querySelector("meta[name=robots]")?.content.includes("noindex")));
  ok("Demo: kein JSON-LD (erst mit INDEXIERUNG=1 auf der Kundendomain)", (await page.$('script[type="application/ld+json"]')) === null);
  ok("Kein Formular, kein iframe, kein mailto auf der Website", await page.evaluate(() => !document.querySelector("form:not([method=dialog])") && !document.querySelector("iframe") && !document.querySelector('a[href^="mailto:"]')));
  const robots = await (await page.goto(BASE + "/robots.txt")).text();
  ok("Demo: robots.txt sperrt nicht (noindex bleibt lesbar), nennt keine Sitemap", !/Disallow:\s*\/\s*$/m.test(robots) && !/Sitemap:/.test(robots), robots.replaceAll("\n", " "));
  ok("Demo: keine sitemap.xml", (await page.goto(BASE + "/sitemap.xml")).status() === 404);
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.evaluate(() => [...document.querySelectorAll("footer button")].find((b) => b.textContent.includes("Datenschutz-Einstellungen")).click()); await warten(250);
  ok("Footer: «Datenschutz-Einstellungen» öffnet einen Hinweis ohne Schalter (nichts einzustellen)", await page.evaluate(() => { const d = document.querySelector("dialog[open]"); return !!d && d.querySelectorAll('input[type="checkbox"]').length === 0 && d.textContent.includes("keine Cookies"); }));
  await page.keyboard.press("Escape"); await warten(200);
  ok("Footer: Escape schliesst den Hinweis", !(await page.$("dialog[open]")));
  await ctx.close();
}

// 2) Tastatur: Sprunglink, Fokusring, Reihenfolge, aktuelle Seite
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.keyboard.press("Tab");
  ok("Tastatur: erster Tab = «Zum Inhalt springen»", await page.evaluate(() => document.activeElement?.textContent?.trim() === "Zum Inhalt springen"));
  ok("Tastatur: Sprunglink wird beim Fokus sichtbar", await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return r.width > 40 && r.height > 20 && r.top >= 0; }));
  await page.keyboard.press("Enter"); await warten(150);
  ok("Tastatur: Sprunglink setzt den Fokus auf <main>", await page.evaluate(() => location.hash === "#inhalt" && document.activeElement?.id === "inhalt"));
  await page.keyboard.press("Tab");
  const fokus = await page.evaluate(() => { const st = getComputedStyle(document.activeElement); return { stil: st.outlineStyle, breite: parseFloat(st.outlineWidth), tag: document.activeElement.tagName }; });
  ok("Tastatur: Fokusring sichtbar (Outline ≥ 2px)", fokus.stil !== "none" && fokus.breite >= 2, JSON.stringify(fokus));
  const reihenfolge = [];
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  for (let i = 0; i < 7; i++) { await page.keyboard.press("Tab"); reihenfolge.push(await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().replace(/\s+/g, " ").slice(0, 44))); }
  ok("Tastatur: Fokusreihenfolge folgt dem Aufbau (Sprunglink, Logo, Speisekarte, Restaurant, Kontakt, Telefon, Inhalt)", /^Zum Inhalt/.test(reihenfolge[0]) && /Startseite/.test(reihenfolge[1]) && reihenfolge[2] === "Speisekarte" && reihenfolge[3] === "Restaurant" && reihenfolge[4] === "Kontakt" && /^Anrufen/.test(reihenfolge[5]) && reihenfolge[6] === "Speisekarte ansehen", reihenfolge.join(" → "));
  await page.goto(BASE + "/restaurant/", { waitUntil: "networkidle0" });
  ok("Navigation: aria-current auf «Restaurant»", await page.evaluate(() => document.querySelector('header a[aria-current="page"]')?.textContent?.trim() === "Restaurant"));
  await ctx.close();
}

// 3) Handy (360 px): Menü als ganzflächiger Dialog, mobile Leiste, Touch-Ziele
{
  const { ctx, page } = await frisch({ breite: 360, hoehe: 740 });
  await page.goto(BASE + "/restaurant/", { waitUntil: "networkidle0" });
  const knopf = await page.$('header button[aria-haspopup="dialog"]');
  const box = await knopf.boundingBox();
  ok("Mobil: Menüknopf ≥ 44 × 44 px, beschriftet «Menü», aria-expanded=false", box.height >= 44 && box.width >= 44 && (await page.evaluate((b) => b.textContent.trim() === "Menü" && b.getAttribute("aria-expanded") === "false", knopf)), `${Math.round(box.width)}×${Math.round(box.height)}`);
  ok("Mobil: Kopfzeile ohne Überlappung (Logo endet vor dem Menüknopf)", await page.evaluate(() => { const m = document.querySelector("header .marke").getBoundingClientRect(); const b = document.querySelector('header button[aria-haspopup="dialog"]').getBoundingClientRect(); return m.right <= b.left; }));
  ok("Mobil: Leiste mit «Speisekarte» und «Anrufen» sichtbar, Knöpfe ≥ 44 px, Body reserviert Platz", await page.evaluate(() => { const l = document.querySelector(".mobil-leiste"); if (!l) return false; const r = l.getBoundingClientRect(); const k = [...l.querySelectorAll("a")]; return getComputedStyle(l).display !== "none" && r.bottom <= innerHeight + 1 && k.length === 2 && k.every((a) => a.getBoundingClientRect().height >= 44) && k[1].getAttribute("href").startsWith("tel:") && parseFloat(getComputedStyle(document.body).paddingBottom) >= r.height - 1; }));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await warten(300);
  ok("Mobil: Leiste verdeckt die Fusszeile nicht (letzter Fusszeilentext liegt über der Leiste)", await page.evaluate(() => { const l = document.querySelector(".mobil-leiste").getBoundingClientRect(); const f = [...document.querySelectorAll("footer p")].pop().getBoundingClientRect(); return f.bottom <= l.top + 1; }));
  await page.evaluate(() => window.scrollTo(0, 0));
  await knopf.click(); await warten(450);
  ok("Mobil: Menü füllt den Bildschirm, 4 Seitenlinks, Telefon, Adresse, aria-expanded=true", await page.evaluate(() => { const d = document.querySelector("dialog.menue[open]"); const r = d.getBoundingClientRect(); return r.width >= innerWidth - 1 && r.height >= innerHeight - 1 && d.querySelectorAll("nav a").length === 4 && !!d.querySelector('a[href^="tel:"]') && !!d.querySelector("address") && document.querySelector('header button[aria-haspopup="dialog"]').getAttribute("aria-expanded") === "true"; }));
  const kleine = await page.evaluate(() => [...document.querySelectorAll("dialog.menue[open] nav a, dialog.menue[open] button, dialog.menue[open] a.knopf")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 44).length);
  ok("Mobil: alle Menüziele ≥ 44 px hoch", kleine === 0, `${kleine} zu klein`);
  let draussen = 0;
  for (let i = 0; i < 20; i++) { await page.keyboard.press("Tab"); if (!(await page.evaluate(() => document.querySelector("dialog.menue[open]").contains(document.activeElement) || document.activeElement === document.body))) draussen++; }
  ok("Mobil: Fokus bleibt im Menü (20-mal Tab)", draussen === 0, `${draussen} ausserhalb`);
  ok("Mobil: aktuelle Seite im Menü markiert", await page.evaluate(() => document.querySelector('dialog.menue[open] nav a[aria-current="page"]')?.textContent.trim() === "Restaurant"));
  await page.evaluate(() => document.querySelector('dialog.menue[open] nav a[href$="/kontakt/"]').click()); await warten(900);
  ok("Mobil: Menülink navigiert und schliesst das Menü", page.url().endsWith("/kontakt/") && !(await page.$("dialog[open]")), page.url().replace(BASE, ""));
  ok("Mobil: kein horizontales Scrollen auf der Kontaktseite", await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.$eval('header button[aria-haspopup="dialog"]', (b) => b.click()); await warten(400);
  await page.keyboard.press("Escape"); await warten(300);
  ok("Mobil: Escape schliesst das Menü, Fokus zurück auf dem Knopf", await page.evaluate(() => !document.querySelector("dialog[open]") && document.activeElement?.getAttribute("aria-haspopup") === "dialog"));
  await ctx.close();
}

// 4) Speisekarte: Register, Vollständigkeit, Preise, Preistabelle, Schärfe, Thai-Schrift
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/speisekarte/", { waitUntil: "networkidle0" });
  ok(`Speisekarte: ${karte.kategorien.length} Kategorien und ${GERICHTE} Gerichte im DOM`, await page.evaluate((n, g) => document.querySelectorAll("section.kategorie[id]").length >= n && document.querySelectorAll("li.gericht").length === g, karte.kategorien.length, GERICHTE));
  ok("Speisekarte: Register (breit) nennt Buffet und alle Kategorien, Ziele existieren", await page.evaluate((n) => { const links = [...document.querySelectorAll("aside .register a")]; return links.length === n + 1 && links.every((a) => !!document.getElementById(a.getAttribute("href").slice(1))); }, karte.kategorien.length));
  ok("Speisekarte: alle Preise im Format «CHF 00.00»", await page.evaluate(() => [...document.querySelectorAll(".preis")].every((p) => /^(ab )?CHF\s?\d+\.\d{2}$/.test(p.textContent.replace(/\s+/g, " ").trim()))));
  ok("Speisekarte: jedes Gericht hat einen Preis, Varianten oder eine Preistabelle in seiner Kategorie", await page.evaluate(() => [...document.querySelectorAll("li.gericht")].every((li) => li.querySelector(".kopf .preis") || li.querySelector(".varianten .preis") || li.closest("section").querySelector(".preistabelle"))));
  ok("Speisekarte: Preistabelle der Currys steht genau einmal, nach Gericht 5, mit 9 Varianten", await page.evaluate(() => { const t = document.querySelectorAll("#hauptgerichte .preistabelle"); const vorher = t[0]?.previousElementSibling; return t.length === 1 && t[0].querySelectorAll("li").length === 9 && vorher?.id === "hauptgerichte-5"; }));
  ok("Speisekarte: Schärfe als Chilis mit Text für Screenreader", await page.evaluate(() => { const c = document.querySelector("#salate .chilis"); return !!c && c.querySelectorAll("svg").length === 3 && /Schärfe: sehr scharf, 3 von 3/.test(c.textContent); }));
  ok("Speisekarte: Thai Specials mit Thai-Schrift (lang=\"th\") und Hinweis zur vorläufigen Übersetzung", await page.evaluate(() => { const s = document.getElementById("thai-specials"); return !!s && s.querySelectorAll('[lang="th"]').length >= 13 && s.textContent.includes("Arbeitsübersetzung"); }));
  ok("Speisekarte: Thai-Schrift wird mit Prompt (Thai) gesetzt, Schrift geladen", await page.evaluate(() => document.fonts.check('600 16px "Prompt Thai"', "สุวรรณภูมิ")));
  ok("Speisekarte: Gerichtfotos haben Alternativtext und feste Masse", await page.evaluate(() => [...document.querySelectorAll(".gericht-bild img")].every((i) => i.alt.length > 10 && i.width > 0 && i.height > 0)));
  ok("Speisekarte: Deklaration mit 9 Einträgen, Hinweis zu Allergenen vorhanden", await page.evaluate(() => document.querySelectorAll("#deklaration dt").length === 9 && document.body.textContent.includes("keine Allergen")));
  await page.click('aside .register a[href="#suppen"]'); await warten(900);
  ok("Speisekarte: Registerlink springt zur Kategorie, Ziel nicht von der Kopfzeile verdeckt, aria-current gesetzt", await page.evaluate(() => { const z = document.getElementById("suppen").getBoundingClientRect(); const k = document.querySelector("header").getBoundingClientRect(); return location.hash === "#suppen" && z.top >= k.bottom - 1 && document.querySelector('aside .register a[aria-current="true"]')?.getAttribute("href") === "#suppen"; }));
  await ctx.close();
  const m = await frisch({ breite: 360, hoehe: 740 });
  await m.page.goto(BASE + "/speisekarte/", { waitUntil: "networkidle0" });
  await m.page.evaluate(() => window.scrollTo(0, 900)); await warten(400);
  ok("Speisekarte mobil: Register klebt unter der Kopfzeile, scrollt waagrecht, Ziele ≥ 44 px", await m.page.evaluate(() => { const l = document.querySelector(".register-leiste"); const r = l.getBoundingClientRect(); const k = document.querySelector("header").getBoundingClientRect(); const reg = l.querySelector(".register"); return getComputedStyle(l).position === "sticky" && Math.abs(r.top - k.bottom) <= 2 && reg.scrollWidth > reg.clientWidth && [...reg.querySelectorAll("a")].every((a) => a.getBoundingClientRect().height >= 44); }));
  await m.page.evaluate(() => document.querySelector('.register-leiste a[href="#reisgerichte"]').click()); await warten(900);
  ok("Speisekarte mobil: Registerlink springt, Kategorie liegt unter Kopfzeile und Register", await m.page.evaluate(() => { const z = document.getElementById("reisgerichte").getBoundingClientRect(); const l = document.querySelector(".register-leiste").getBoundingClientRect(); return location.hash === "#reisgerichte" && z.top >= l.bottom - 1; }));
  ok("Speisekarte mobil: kein horizontales Scrollen der Seite", await m.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await m.ctx.close();
}

// 5) Heute, Öffnungszeiten, Hinweise
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" }); await warten(300);
  const heute = new Date();
  const wochentag = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Zurich", weekday: "short" }).format(heute) === "Sun" ? 0 : (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Zurich", weekday: "short" }).format(heute)) + 1)];
  const iso = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"].indexOf(wochentag) + 1;
  const tag = zeiten.tage.find((t) => t.tag === iso);
  const erwartet = tag.zeiten.length ? tag.zeiten.map((z) => `${z.von.replace(":", ".")} bis ${z.bis.replace(":", ".")}`).join(" und ") + " Uhr" : "Heute geschlossen";
  const heuteText = await page.evaluate(() => document.querySelector(".heute").textContent.replace(/\s+/g, " "));
  ok(`Heute-Anzeige nennt ${wochentag} und die Zeiten aus den Inhalten`, heuteText.includes(wochentag) && heuteText.includes(erwartet), heuteText.slice(0, 120));
  const kueche = tag.zeiten.filter((z) => z.kuecheBis).map((z) => z.kuecheBis.replace(":", "."));
  ok("Heute-Anzeige nennt den Küchenschluss (falls heute abends offen)", kueche.length === 0 || kueche.every((k) => heuteText.includes(`Küche bis ${k}`)));
  ok("Öffnungszeiten-Liste: heutiger Tag markiert (aria-current=date)", await page.evaluate((w) => document.querySelector('.zeiten li[aria-current="date"]')?.textContent.includes(w), wochentag));
  ok("Öffnungszeiten-Liste: 7 Tage abgedeckt, Küchenschluss abends, Sonntag geschlossen", await page.evaluate(() => { const t = document.querySelector(".zeiten").textContent; return t.includes("Sonntag") && t.includes("geschlossen") && t.includes("Küche bis 20.30") && t.includes("Küche bis 21.00"); }));
  const abgelaufen = hinweise.filter((h) => h.anzeigenBis < new Date().toISOString().slice(0, 10)).length;
  ok(`Hinweise: ${abgelaufen} abgelaufene(r) Hinweis(e) sind nicht sichtbar`, await page.evaluate((n) => [...document.querySelectorAll(".hinweis")].filter((h) => h.getBoundingClientRect().height > 0 && !h.hidden).length === 0 || n === 0, abgelaufen));
  await ctx.close();
}

// 6) Links: Telefon, Lieferdienste, Karte nur als externer Link
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/kontakt/", { waitUntil: "networkidle0" });
  const tels = await page.evaluate(() => [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute("href")));
  ok(`Telefon-Links im Format ${TEL}`, tels.length >= 4 && tels.every((t) => t === TEL), [...new Set(tels)].join(","));
  ok("Lieferdienste: Links auf die Restaurantprofile (Uber Eats, Just Eat), neues Fenster, rel=noopener noreferrer", await page.evaluate(() => { const a = [...document.querySelectorAll('#lieferung a[href^="https://"]')]; return a.length === 2 && a.every((x) => x.target === "_blank" && x.rel.includes("noopener") && x.rel.includes("noreferrer")) && a.some((x) => x.href.includes("ubereats.com/ch-de/store/suwannaphum/")) && a.some((x) => x.href.includes("just-eat.ch/speisekarte/suwannaphum")); }));
  ok("Karte: nur externer Link in neuem Fenster, keine Einbettung", (await page.$("iframe")) === null && (await page.evaluate(() => { const a = document.querySelector('main a[href^="https://www.google.com/maps"]'); return !!a && a.target === "_blank" && a.rel.includes("noopener") && a.textContent.includes("neuen Fenster"); })));
  ok("Kontakt: Zahlungsmethoden Bar, Karte, TWINT, Lunch-Check mit Hinweis", await page.evaluate(() => { const t = document.querySelector("main").textContent; return ["Barzahlung", "Kartenzahlung", "TWINT", "Lunch-Check"].every((z) => t.includes(z)) && t.includes("noch zu bestätigen"); }));
  await page.goto(BASE + "/impressum/", { waitUntil: "networkidle0" });
  ok("Impressum: trennt Betreiber der Demo und dargestelltes Restaurant, Bildnachweis mit allen Bildern", await page.evaluate(() => { const t = document.querySelector("main").textContent; return t.includes("Betreiber dieser Demo-Website") && t.includes("Dargestelltes Restaurant") && !!document.getElementById("bildnachweis") && [...document.querySelectorAll("main li")].filter((li) => /Nutzung vorbehaltlich Freigabe/.test(li.textContent)).length >= 20; }));
  await page.goto(BASE + "/datenschutz/", { waitUntil: "networkidle0" });
  ok("Datenschutz: beschreibt GitHub Pages und Vercel als Hosting, keine Cookies, externe Links; Sanity nur als nicht im Einsatz", await page.evaluate(() => { const t = document.querySelector("main").textContent; return t.includes("GitHub Pages") && t.includes("Vercel Inc.") && t.includes("keine Cookies") && t.includes("Uber Eats") && /Sanity[^.]*nicht im Einsatz/.test(t); }));
  await ctx.close();
}

// 7) Adressen: Direktaufruf, Neuladen, Canonical, Dateien unter dem Unterpfad, Fehlerseite
{
  const { ctx, page } = await frisch();
  const fehlgeschlagen = [];
  page.on("response", (r) => { if (r.status() >= 400) fehlgeschlagen.push(`${r.status()} ${r.url().replace(BASE, "")}`); });
  let alleOk = true; const details = [];
  for (const s of alleSeiten()) {
    const a = await page.goto(BASE + s, { waitUntil: "networkidle0" });
    const b = await page.reload({ waitUntil: "networkidle0" });
    const canonical = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href ?? "");
    const gut = a.status() === 200 && [200, 304].includes(b.status()) && canonical.endsWith(`${UNTERPFAD}${s}`) && canonical.startsWith("https://");
    if (!gut) { alleOk = false; details.push(`${s}: ${a.status()}/${b.status()} ${canonical}`); }
  }
  ok(`Adressen: ${alleSeiten().length} Seiten per Direktaufruf und nach Neuladen erreichbar, Canonical zeigt auf die Demo`, alleOk, details.join(" | "));
  ok("Adressen: keine fehlgeschlagene Anfrage (Bilder, Schriften, Skripte unter dem Unterpfad)", fehlgeschlagen.length === 0, fehlgeschlagen.slice(0, 4).join(", "));
  const ohneSchraegstrich = await page.goto(BASE + "/kontakt", { waitUntil: "networkidle0" });
  // 304: Chrome fragt nach der Weiterleitung bedingt an und bekommt «nicht verändert» (Vercel); die Seite ist dann aus dem Cache.
  ok("Adressen: «/kontakt» ohne Schrägstrich am Ende funktioniert", [200, 304].includes(ohneSchraegstrich.status()) && page.url().endsWith("/kontakt/") && (await page.evaluate(() => !!document.querySelector("main h1"))), `${ohneSchraegstrich.status()} ${ohneSchraegstrich.url()} → ${page.url()}`);
  const r = await page.goto(BASE + "/gibt-es-nicht/", { waitUntil: "networkidle0" });
  ok("Fehlerseite: unbekannte Adresse liefert 404 mit gestalteter Seite, Kopfzeile und noindex", r.status() === 404 && (await page.evaluate(() => document.querySelector("main h1")?.textContent.trim() === "Diese Seite gibt es nicht" && !!document.querySelector("header") && document.querySelector("meta[name=robots]")?.content.includes("noindex"))));
  ok("Fehlerseite: Links führen unter den Unterpfad", await page.evaluate((u) => [...document.querySelectorAll("main a.knopf")].every((a) => a.getAttribute("href").startsWith(u + "/")), UNTERPFAD));
  const direkt = await page.goto(BASE + "/404.html", { waitUntil: "networkidle0" });
  // GitHub Pages liefert die Datei selbst (200); Vercel kennt sie nicht und antwortet mit der gestalteten Fehlerseite (404).
  ok("Fehlerseite: /404.html direkt aufrufbar (GitHub Pages) oder als gestaltete Fehlerseite beantwortet (Vercel)", [200, 404].includes(direkt.status()) && (await page.evaluate(() => document.querySelector("main h1")?.textContent.trim() === "Diese Seite gibt es nicht")));
  await ctx.close();
}

// 8) Bewegung
{
  const { ctx, page } = await frisch({ reduziert: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Reduzierte Bewegung: keine Einstiegsanimation, Inhalt sichtbar, kein sanftes Scrollen", await page.evaluate(() => { const h = document.querySelector(".einstieg > *"); return getComputedStyle(h).animationName === "none" && getComputedStyle(h).opacity === "1" && getComputedStyle(document.documentElement).scrollBehavior === "auto"; }));
  await ctx.close();
  const n = await frisch();
  await n.page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Normale Bewegung: ein Einstiegsmoment, sonst keine Scrollführung (kein scroll-snap auf der Seite, Body scrollt frei)", await n.page.evaluate(() => getComputedStyle(document.querySelector(".einstieg > *")).animationName !== "none" && getComputedStyle(document.documentElement).scrollSnapType === "none" && getComputedStyle(document.body).overflowY !== "hidden"));
  await n.ctx.close();
}

await browser.close();
mkdirSync("pruefung", { recursive: true });
writeFileSync("pruefung/funktionen.json", JSON.stringify(ergebnisse, null, 1));
console.log(`\n${ergebnisse.filter((e) => e.ok).length}/${ergebnisse.length} bestanden → pruefung/funktionen.json`);
process.exitCode = ergebnisse.every((e) => e.ok) ? 0 : 1;

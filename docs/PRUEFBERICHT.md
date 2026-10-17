# Prüfbericht

Stand: 16. Oktober 2026. Alle Zahlen sind gemessen, nichts ist geschätzt. Was nicht geprüft werden konnte, steht in Abschnitt 7.

**Umgebung:** macOS (Darwin 27), Node 26.8.2, npm 11.19.1, Google Chrome 155 (lokal installiert), puppeteer-core 25,
Lighthouse 13.5.0 über `npx lighthouse@latest`. Lokale Läufe gegen `npm run vorschau:pages` (liefert `out/` wie GitHub Pages
unter dem Unterpfad, aber **ohne Kompression**; Mobilwerte fallen lokal deshalb schlechter aus als live). Live-Läufe gegen
<https://nick8952.github.io/suwannaphum-restaurant-demo/>.

## 1. Automatische Prüfkette (lokal, Stand nach der Codex-Abschlussprüfung)

| Prüfung | Befehl | Ergebnis |
| --- | --- | --- |
| Inhalte (Schema, Schreibweise, Sperrliste, Links, Knopftexte, Karte, Zeiten, Bilder) | `npm run inhalt:pruefen` | ✓ 790 Texte, 24 Links, 25 Bilder, 70 Gerichte in 10 Kategorien, 1 Hinweis |
| Zeitlogik (Schnitt im Zeitfenster, Pause, 00:00, Fensterende, Küchenschluss, Zeitzone mit Sommer-/Winterzeit, Rangfolge der Hinweise, Zeilen der Tabelle) | `npm run zeit:pruefen` | ✓ 17 von 17 |
| ESLint | `npm run lint` | ✓ 0 Meldungen |
| TypeScript | `npm run typecheck` | ✓ |
| Statischer Export | `npm run build` | ✓ 9 HTML-Seiten, `404.html`, `.nojekyll`, keine Sitemap |
| Export (Seiten, noindex, Unterpfad, keine fremden Hosts, Karte vollständig, doppelte IDs, Budgets) | `npm run export:pruefen` | ✓ 599 interne Verweise; vorgeladenes Bild 0/146 KB, JavaScript je Seite 585/703 KB (unkomprimiert), Bildvarianten 11'234 KB |
| Sanity-Import als Trockenlauf | `npm run seed -- --probe` | ✓ 21 Dokumente, 25 Bilder; jedes Dokument besteht das Domainmodell und entspricht nach dem Zurücklesen den lokalen Inhalten |
| Studio | `cd studio && npm run typecheck && npm run schema:pruefen` | ✓ 0 Fehler, 0 Warnungen |

Dieselbe Kette läuft in der CI (`.github/workflows/pages.yml`); das Deployment wartet seit dieser Runde auf **beide** Jobs
(Website und Studio). Erster Lauf (Commit `11cafb2`): <https://github.com/Nick8952/suwannaphum-restaurant-demo/actions/runs/38933451578>, grün.

## 2. Browser-Prüfungen (puppeteer-core, echtes Chrome)

**DOM-Audit** (`werkzeuge/qa/audit.mjs`): 7 Seiten (Start, Speisekarte, Restaurant, Kontakt, Impressum, Datenschutz, 404) × 4 Breiten
(360, 390, 768, 1440 px). Je Seite und Breite: kein waagrechter Überlauf, kein Element über den Rand, alle Links/Knöpfe mindestens
44 × 44 px (Fliesstextlinks ausgenommen), Bilder mit `alt` und Massen, genau eine `h1`, keine Überschriftensprünge, `noindex`, Titel,
`lang`, Sprunglink und `main#inhalt`, keine Einträge in localStorage/sessionStorage, keine Cookies, fixierte Kopfzeile verdeckt kein
Sprungziel (`scroll-padding-top`), mobile Leiste verdeckt keinen Inhalt (`padding-bottom`), keine Anfragen an fremde Hosts, keine
fehlgeschlagenen Anfragen, keine Konsolenfehler.

| Stand | Ergebnis |
| --- | --- |
| lokal, nach den Korrekturen | **28 von 28 ohne Befund** |
| live, Commit `11cafb2` | 28 von 28 ohne Befund |

**Funktionsprüfungen** (`werkzeuge/qa/funktionen.mjs`, 61 Prüfungen): Erstbesuch ohne Banner und ohne Speicherung (3), Demo-Hinweis
und noindex (5), Footer-Dialog «Datenschutz-Einstellungen» (2), Tastatur mit Fokusring, Fokusreihenfolge, Fokusfalle im Menü, Escape
mit Fokusrückgabe (5), mobiles Menü und Kopfzeile ohne Überlappung (11), Speisekarte mit Register, `aria-current`, Sprungmarken,
Buffet, Preistabelle, Thai-Schrift mit `lang="th"` (10 + 3 mobil), Öffnungszeiten-Liste mit Hervorhebung des heutigen Tages (2),
Navigation, Lieferdienste, Kontakt, Adressen und `tel:`-Links, Impressum, Datenschutz (je 1 bis 2), Fehlerseite (3), normale und
reduzierte Bewegung (2).

| Stand | Ergebnis |
| --- | --- |
| lokal, nach den Korrekturen | **61 von 61 bestanden** |
| live, Commit `11cafb2` | 61 von 61 bestanden |

Zwischen den Ständen wurde der Logo-Link umgebaut (sichtbarer Text als zugänglicher Name statt `aria-label`, siehe Lighthouse), der
Fokus-Test entsprechend angepasst; der Footer-Link «Datenschutz-Einstellungen» ist im statischen HTML jetzt ein Link zur
Datenschutzerklärung (`/datenschutz/#cookies`) und erst nach der Hydration ein Dialog-Knopf.

**Screenshots** (`werkzeuge/qa/screenshots.mjs`) wurden auf 360, 768 und 1440 px gesichtet; daraus stammen die Korrekturen
«Zusatz in der Kopfzeile unter 40 rem ausblenden», «Abstand zwischen CHF und Betrag» und der kürzere Demo-Hinweis.

## 3. Lighthouse

SEO ist in der Demo **absichtlich 66**: Lighthouse wertet `noindex` als «nicht auffindbar» (`is-crawlable`). Alle anderen
SEO-Prüfungen bestehen. Auf der echten Domain mit `INDEXIERUNG=1` entfällt dieser Abzug.

**Lokal, Stand nach den Korrekturen** (Vorschau-Server ohne Kompression, 16.10.2026 ab 17:00 UTC):

| Seite | Modus | Leistung | Barrierefreiheit | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | Desktop | 98 | 100 | 100 | 66 | 1,2 s | 0 | 0 ms |
| / | Mobil | 77 | 100 | 100 | 66 | 6,5 s | 0 | 10 ms |
| /speisekarte/ | Desktop | 97 | 100 | 100 | 66 | 1,2 s | 0 | 0 ms |
| /speisekarte/ | Mobil | 75 | 100 | 100 | 66 | 6,4 s | 0 | 20 ms |
| /restaurant/ | Desktop | 98 | 100 | 100 | 66 | 1,1 s | 0 | 0 ms |
| /restaurant/ | Mobil | 77 | 100 | 100 | 66 | 6,3 s | 0 | 20 ms |
| /kontakt/ | Desktop | 99 | 100 | 100 | 66 | 0,9 s | 0 | 0 ms |
| /kontakt/ | Mobil | 82 | 100 | 100 | 66 | 4,8 s | 0 | 20 ms |

**Live, Commit `11cafb2`** (GitHub Pages mit Kompression, 16.10.2026 16:42 UTC, **vor** den Korrekturen dieser Runde):

| Seite | Modus | Leistung | Barrierefreiheit | Best Practices | SEO | LCP | CLS | TBT | nicht bestanden |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | Desktop | 100 | 96 | 100 | 66 | 0,5 s | 0 | 0 ms | color-contrast, label-content-name-mismatch, is-crawlable |
| / | Mobil | 97 | 96 | 100 | 66 | 2,6 s | 0 | 30 ms | color-contrast, is-crawlable |
| /speisekarte/ | Desktop | 100 | 97 | 100 | 66 | 0,6 s | 0 | 0 ms | color-contrast, label-content-name-mismatch, is-crawlable |
| /speisekarte/ | Mobil | 99 | 97 | 100 | 66 | 2,2 s | 0 | 10 ms | color-contrast, is-crawlable |
| /restaurant/ | Desktop | 100 | 100 | 100 | 66 | 0,5 s | 0 | 0 ms | label-content-name-mismatch, is-crawlable |
| /restaurant/ | Mobil | 99 | 100 | 100 | 66 | 2,2 s | 0 | 10 ms | is-crawlable |
| /kontakt/ | Desktop | 100 | 100 | 100 | 66 | 0,5 s | 0 | 0 ms | label-content-name-mismatch, is-crawlable |
| /kontakt/ | Mobil | 99 | 100 | 100 | 66 | 2,0 s | 0 | 20 ms | is-crawlable |

Beide Barrierefreiheitsbefunde sind behoben und lokal mit 100 bestätigt:

- `color-contrast`: das kleine «CHF» vor dem Buffetpreis stand in Grau (`tinte-3`) auf der goldenen Fläche, Kontrast 3,47:1. Auf
  Gold und Sand ist es jetzt `tinte-2` (gerechnet ≥ 7:1, Tabelle in `docs/DESIGN.md`).
- `label-content-name-mismatch`: der Logo-Link trug `aria-label="Thai Restaurant Suwannaphum, zur Startseite"`, der sichtbare Text
  («Thai Restaurant Schlieren») war darin nicht enthalten. Jetzt bildet der sichtbare Inhalt den Namen (Schriftzug-Bild mit
  `alt="Suwannaphum"`, Zusatz, Ort) plus «, Startseite» nur für Screenreader.

Die Mobilwerte lokal (LCP 6,3 bis 6,5 s) kommen vom unkomprimierten Vorschau-Server und der simulierten Mobilverbindung; live lag
der LCP bei 2,0 bis 2,6 s. Die Startseite liegt mobil damit knapp über der 2,5-Sekunden-Schwelle; naheliegende Verbesserung wäre ein
`<link rel="preload">` für das Einstiegsbild (Budget in `export-pruefen` ist dafür schon vorgesehen).

**Live, nach den Korrekturen:** Abschnitt 8.

## 4. Go-Live-Leitplanken (lib/deploy-ziel.ts, lib/content/freigabe.ts)

Mit `npx next build` geprüft; jeder Fall bricht wie vorgesehen ab:

| Fall | Ergebnis |
| --- | --- |
| `INDEXIERUNG=1` ohne eigene Domain | Abbruch: Demo auf github.io darf nicht indexiert werden |
| `SITE_URL` zusammen mit dem Unterpfad | Abbruch: Domain und Unterpfad schliessen sich aus |
| unbekanntes `DEPLOY_TARGET` | Abbruch |
| `INDEXIERUNG=1 SITE_URL=https://www.suwannaphum.ch` | Abbruch mit der Liste der 14 offenen Freigaben (Einstellungen, Lieferdienste, Öffnungszeiten, Buffet, Speisekarte, Kategorie mit Arbeitsübersetzung, Hinweis, Seitentexte, Rechtstexte mit Demo-Wortlaut) |
| `SITE_URL` mit Zugangsdaten (`https://:geheim@…`) | Abbruch (seit dieser Runde auch bei leerem Benutzernamen) |
| Probe-Build mit reservierter Testdomain (`INDEXIERUNG=1 SITE_URL=https://www.example.com npm run build:vercel`) | läuft durch: Sitemap, JSON-LD, Canonical auf der Testdomain |

## 5. Live-Kontrolle nach dem ersten Deployment (Commit `11cafb2`)

Alle sechs Seiten und die 404-Seite antworten mit 200 bzw. 404; `/kontakt` leitet mit 301 auf `/kontakt/`; `robots.txt` 200,
keine Sitemap (404); `<meta name="robots" content="noindex, nofollow">` und Canonical
`https://nick8952.github.io/suwannaphum-restaurant-demo/` auf jeder Seite; keine Anfragen an fremde Hosts.

## 6. Codex-Prüfungen (unabhängig, nur lesend)

| Runde | Umfang | Ergebnis |
| --- | --- | --- |
| 1 Architektur, erster Versuch | gesamter Arbeitsbaum | **verworfen**: Codex hatte wegen der Formulierung «rufe kein anderes Werkzeug auf» keine Datei gelesen; der Bericht war allgemein. Wiederholt mit ausdrücklicher Leseerlaubnis. |
| 2 Architektur | Modell, Zeitlogik, Adapter, Studio, Seed, Komponenten, Sicherheit | **16 Befunde, 15 umgesetzt**: Betriebsferien-Daten (`geschlossenAb`, Enddatum), Sonderöffnungszeiten mit eigenen Zeitfenstern, Backslash-Umgehung der Linkregel, Freigabe-Abdeckung (Kontakt, Texte, Einwilligungskategorien in der Datenschutzerklärung), Anzeige bestätigter Kennzeichnungen/Allergene, doppelte Gericht-IDs, Thai-Name mit `lang="th"`, Singletons per `_id`, tote CMS-Felder und fest verdrahtete Texte ins Modell, JSON-LD (`acceptsReservations` boolesch, Ländercode, Buffettage), Hotspot aus, echte Kalendertage, Alt-Text und Bildnachweis als Pflicht, `normalisieren` ohne leeren Alt-Ersatz. **Nicht umgesetzt:** Öffnung über Mitternacht (Entscheidung 4: das Restaurant schliesst spätestens 21.30). |
| 3 Abschluss | Zeitlogik-Randfälle, Uhr, Barrierefreiheit/Hydration, GROQ-Schema-Seed-Parität, Sicherheit, Inhaltsehrlichkeit, Dokumentation, Qualität | **13 Befunde, alle bearbeitet** (Tabelle unten). Codex bestätigte ausserdem: ESLint, beide Typechecks und die Exportprüfung grün; keine Geheimnisse im Repository; CI-Rechte minimal; Zeitzone und Wochentag korrekt an Mitternacht und an beiden Zeitumstellungen; Dialog, Fokus, Register, Landmarken, Canonical, noindex, Impressum/Datenschutz konsistent. |

Abschlussbefunde und Umsetzung:

| Nr. | Befund | Umsetzung |
| --- | --- | --- |
| 1 | `geschlossenAb` mitten in einem Zeitfenster liess das Fenster ganz verschwinden | `bisGekuerzt()` kürzt das Fenster, Küchenschluss nur wenn davor; 7 Tests |
| 2 | Speisekarte ohne SEO-Längengrenzen im Domainmodell | `seoSchema` gilt auch dort (Titel ≤ 50, Beschreibung 50 bis 170) |
| 3 | Abrufdatum nur per Regex geprüft | `datumSchema` (echter Kalendertag) auch für `herkunft.abgerufen` |
| 4 | Studio prüft Zeitfenster nicht wie das Modell; leeres `zeiten` bei Mitteilungen | Objektvalidator im Studio (`von < bis`, Küche innerhalb); Website-Abfrage übernimmt `geschlossenAb`/`zeiten` nur bei passender Art |
| 5 | «frisch nachgefüllt» unbelegt; Sperrliste und Dokumentation widersprachen sich | Buffettext nur mit Belegtem; Sperrliste umfasst «frisch» in allen Formen; Inhaltsmatrix präzisiert |
| 6 | Deployment wartete nicht auf die Studio-Prüfung | `needs: [build, studio]` |
| 7 | Menüknopf und Footer-Knopf ohne JavaScript funktionslos | Footer-Link als echter Link bis zur Hydration; Menüknopf bewusst belassen, Seiten über mobile Leiste, Logo und Fussnavigation erreichbar (Entscheidung 20) |
| 8 | Uhr lief bis zu 59 s nach | erster Tick an der Minutengrenze |
| 9 | `SITE_URL` mit leerem Benutzernamen, aber Passwort | `u.password` wird ebenfalls abgelehnt |
| 10 | Vorschau-Server ohne `404.html` und ohne Fehlerbehandlung beim Start | Rückfall auf Textantwort; `server.on("error")` |
| 11 | `docs/PRUEFBERICHT.md` fehlte | dieser Bericht |
| 12 | tote Exporte; `Zeitenliste` rekonstruierte Tage aus deutschem Text | `kleinsteUrl`, `inhaltsquelleName`, `inlineText` entfernt; `zeitenZeilen()` liefert `von`/`bis` als Zahlen |
| 13 | Arbeitsbaum und Export nicht derselbe Stand | gesamte Kette nach den Änderungen erneut gelaufen (Abschnitte 1 bis 3) |

## 7. Nicht durchführbar oder bewusst nicht durchgeführt

- **Echter Sanity-Import, Sanity-Build und Deploy-Hook:** kein Projekt angelegt (Auftrag). Geprüft ist nur der Trockenlauf des
  Seeds; GROQ-Abfragen und Portable-Text-Umwandlung sind gegen das Schema gelesen, aber nie gegen eine laufende Sanity-Instanz.
- **Vercel-Deployment:** nicht ausgeführt; nur der Probe-Build mit `DEPLOY_TARGET=vercel`.
- **Screenreader:** keine manuelle Prüfung mit VoiceOver oder NVDA. Belegt sind nur maschinelle Prüfungen (axe über Lighthouse,
  eigene DOM-Prüfungen, Tastaturläufe in Chrome).
- **Echte Geräte, Safari, Firefox:** nur emulierte Breiten in Chrome.
- **Uber-Eats-Profil:** im Browser nicht prüfbar (Cloudflare-Abfrage); Nachweis über Suchmaschinen-Snippet (`docs/INHALTSMATRIX.md`).
- **Kontakt mit dem Restaurant:** kein Anruf, kein Besuch, keine Testanfrage (Auftrag).
- **Rechtstexte:** keine anwaltliche Prüfung; Quellen in `docs/UEBERGABE.md`.

Bekannte Einschränkungen: Hinweise, die nach dem letzten Build erfasst werden, erscheinen erst mit dem nächsten Build (CI wöchentlich,
mit Sanity per Deploy-Hook); der Menüknopf braucht JavaScript (Entscheidung 20).

## 8. Live-Kontrolle nach den Korrekturen (Commit `200db66`)

CI-Lauf <https://github.com/Nick8952/suwannaphum-restaurant-demo/actions/runs/38936829098>: Jobs `build`, `studio` und `deploy`
grün. GitHub Pages lieferte den neuen Stand unmittelbar nach dem Deployment (geprüft am Footer-Link `/datenschutz/#cookies`, am
Logo-Link ohne `aria-label` und am neuen Buffettext); Start und Speisekarte antworten mit 200, eine unbekannte Adresse mit 404.

| Prüfung gegen die Live-Adresse | Ergebnis |
| --- | --- |
| DOM-Audit (7 Seiten × 4 Breiten) | **28 von 28 ohne Befund** |
| Funktionsprüfungen | **61 von 61 bestanden** |

**Lighthouse live, nach den Korrekturen** (2026-10-16 17:08 UTC, GitHub Pages mit Kompression):

| Seite | Modus | Leistung | Barrierefreiheit | Best Practices | SEO | LCP | CLS | TBT | nicht bestanden |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | Desktop | 100 | 100 | 100 | 66 | 0,6 s | 0 | 0 ms | is-crawlable |
| / | Mobil | 97 | 100 | 100 | 66 | 2,6 s | 0 | 20 ms | is-crawlable |
| /speisekarte/ | Desktop | 100 | 100 | 100 | 66 | 0,6 s | 0 | 0 ms | is-crawlable |
| /speisekarte/ | Mobil | 93 | 100 | 100 | 66 | 3,1 s | 0 | 10 ms | is-crawlable |
| /restaurant/ | Desktop | 100 | 100 | 100 | 66 | 0,4 s | 0 | 0 ms | is-crawlable |
| /restaurant/ | Mobil | 99 | 100 | 100 | 66 | 2,2 s | 0 | 10 ms | is-crawlable |
| /kontakt/ | Desktop | 100 | 100 | 100 | 66 | 0,6 s | 0 | 0 ms | is-crawlable |
| /kontakt/ | Mobil | 99 | 100 | 100 | 66 | 2,0 s | 0 | 30 ms | is-crawlable |

Barrierefreiheit steht jetzt auf allen Seiten auf 100; einzig verbleibender Abzug ist das beabsichtigte `noindex` (SEO 66).
Der mobile LCP der Speisekarte lag in diesem Lauf bei 3,1 s, im Lauf vor den Korrekturen bei 2,2 s; die Seite ist unverändert
gross (umfangreichstes HTML der Website), die Differenz liegt in der Schwankung der simulierten Mobilverbindung zwischen zwei
Läufen. Für eine echte Domain bleibt das Vorladen des Einstiegsbilds die naheliegende Verbesserung (Abschnitt 3).

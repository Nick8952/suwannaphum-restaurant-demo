# Entscheidungen

Kurz begründete Entscheidungen, die für spätere Arbeit an diesem Projekt gelten. Datum: 16. Oktober 2026.

| Nr. | Entscheidung | Begründung |
| --- | --- | --- |
| 1 | **Technischer Ausgangspunkt: `../casatex-zuerich-demo`** (Unterpfad-Logik, Export-Prüfung, Vorschau-Server, QA-Gerüst, Einwilligungslogik, Modell «statisch + Rebuild bei Publish»). Design, Domainmodell, Komponenten, Texte und Prüfungen sind neu. | Bewährte, geprüfte Infrastruktur; die Vorgabe «keine umgefärbte Kopie» betrifft Gestaltung und Komponenten, nicht Build-Skripte. |
| 2 | **Immer statischer Export, auch mit Sanity.** Kein `/studio`, kein `/api/revalidate`; Veröffentlichen löst per Webhook einen Deploy-Hook aus. | Demo muss ohne Dienste laufen; weniger bewegliche Teile; keine Anfragen an Dritte im Browser. |
| 3 | **Befristete Hinweise doppelt abgesichert.** Build nimmt alle Hinweise mit nicht abgelaufenem Anzeigefenster auf; der Browser blendet nach Datum ein und aus; die CI baut wöchentlich. | Statische Seite, aber «Hinweise müssen nach Ablauf zuverlässig verschwinden». |
| 4 | **Zeitlogik ohne Abhängigkeiten in `lib/content/zeit.ts`**, Zeitzone immer `Europe/Zurich` (Intl), Daten als Kalendertag-Strings, Uhrzeiten `HH:MM`; keine Öffnung über Mitternacht (Schema verlangt `von < bis`). | Läuft gleich beim Build und im Browser; das Restaurant schliesst spätestens 21.30. |
| 5 | **Uhr über `useSyncExternalStore`** (`lib/uhr.ts`) statt setState in Effekten. | ESLint-Regel `react-hooks/set-state-in-effect`; keine Hydrationsunterschiede (Server-Schnappschuss null). |
| 6 | **Keine Serifen, Prompt + Sarabun.** | Standard-Skill sperrt Serifen und Fraunces als Standard; beide Familien tragen Thai-Glyphen; Schriften aus dem Herkunftsland der Küche. |
| 7 | **Farbwelt aus Logo und Wänden (Gelb, Petrol, Elfenbein), Chilirot nur als Zeichen.** | Auftrag: aus dem Logo abgeleitete Farbwelt, warme helle Flächen, gezielt dunkle Bereiche. |
| 8 | **Speisekarte als eine Seite mit Register**, keine Filter, kein Bestellsystem. | 70 Positionen in 10 Kategorien: Sprungmarken genügen; Druckbarkeit; Auffindbarkeit. |
| 9 | **Thai Specials mit Arbeitsübersetzung, gekennzeichnet.** | Karte liegt nur in Thai-Schrift vor; Weglassen wäre unvollständig, Verschweigen der Unsicherheit unehrlich. |
| 10 | **Preistabelle statt Varianten je Curry.** | Die Karte druckt eine Tabelle für fünf Gerichte; so bleibt die Pflege im Studio an einer Stelle. |
| 11 | **Keine E-Mail, kein Formular.** | Keine Adresse belegt; Auftrag: keine erfinden. |
| 12 | **Lieferdienst-Links auf Restaurantprofile.** | Plattform-Startseiten sind keine Bestellmöglichkeit. |
| 13 | **Lunch-Check als Text mit Hinweis «zu bestätigen», Logo nicht gezeigt.** | Fremdmarke ohne Freigabe; Angabe stammt nur aus einem Logo. |
| 14 | **Kein Cookie-Banner.** Einwilligung ruhend vorbereitet. | Keine einwilligungspflichtigen Dienste; Auftrag verbietet irreführende Banner. |
| 15 | **Reihenfolge der Karte geändert** (Specials zuerst, Thai Specials und Tee am Ende). | Ablauf einer Mahlzeit; Highlight vorne. |
| 16 | **Ausschnitte aus dem Aushang «Special Menu»** als Gerichtfotos. | Einzige Fotos dieser Gerichte; eigenes Material des Restaurants. |
| 17 | **Wortmarke = Titelblatt der gedruckten Karte**, Ausschnitt des Schriftzugs in der Kopfzeile. | Kein anderes Logo vorhanden; unverzerrt, nicht umgefärbt. |
| 18 | **Singletons in Sanity per `_id` abfragen.** | Deterministische Builds auch bei Duplikaten (Codex-Befund). |
| 19 | **Freigabe «demo/live» auf jedem geschäftlichen Inhalt**, Build bricht bei `INDEXIERUNG=1` ohne Freigaben ab. | Keine indexierbare Website mit unbestätigten Preisen oder Zeiten. |
| 20 | **Ohne JavaScript:** der Footer-Link «Datenschutz-Einstellungen» ist im statischen Stand ein Link zur Datenschutzerklärung und wird erst nach der Hydration zum Dialog-Knopf. Der Menüknopf der Kopfzeile bleibt ein reiner Knopf; alle Seiten sind ohne JavaScript über die mobile Leiste, das Logo und die Fussnavigation erreichbar. | Codex-Abschlussbefund; ein Link-Rückfall für das Menü brächte vor der Hydration ein Verhalten, das kurz darauf wechselt. |
| 21 | **Betriebsferien «geschlossen ab» kürzt ein angeschnittenes Zeitfenster** (16.30 bis 21.00 wird mit `18:00` zu 16.30 bis 18.00; Küchenschluss nur, wenn er davor liegt). Geprüft in `werkzeuge/zeit.test.mts`. | Vorher verschwand ein angeschnittenes Fenster ganz (Codex-Abschlussbefund). |
| 22 | **Studio prüft Zeitfenster wie das Domainmodell** (`von < bis`, Küche innerhalb), und die Website-Abfrage übernimmt `geschlossenAb` nur bei Betriebsferien und `zeiten` nur bei Sonderöffnungszeiten. | Ein im Studio gültiges Dokument darf den Build nie brechen; ein leeres «zeiten»-Feld einer Mitteilung ist unschädlich. |
| 23 | **Sperrliste umfasst «frisch» in allen Wortformen**; der Buffettext nennt nur Belegtes (à discrétion, Getränk inbegriffen). | «frisch nachgefüllt» war unbelegt (Codex-Abschlussbefund); Dokumentation und Regel müssen übereinstimmen. |
| 24 | **Dieselbe Demo zusätzlich auf Vercel** (17.10.2026, Projekt im Konto nick8952, mit dem GitHub-Repository verbunden, Build bei jedem Push auf `main`, keine Umgebungsvariablen, weiterhin noindex mit Entwurfshinweis). GitHub Pages bleibt als zweite Veröffentlichung bestehen. | Nick schickt dem Kunden den Vercel-Link; später wird dasselbe Projekt mit Sanity und der Kundendomain weiterverwendet. |
| 26 | **Go-live am 21.10.2026 auf www.suwannaphum.ch** (Vercel-Projekt der Demo, Produktionsvariablen `SITE_URL` und `INDEXIERUNG=1`): alle Freigaben «live», Übersetzungs-Kennzeichnung der Thai Specials aus, Lunch-Check-Hinweis weg, Bildnachweis «mit Freigabe des Restaurants», Rechtstexte mit dem Restaurant als Betreiberin (UID weggelassen, weil unbekannt). GitHub-Pages-Demo abgeschaltet, CI prüft nur noch. | Nick hat die Website verkauft; das Restaurant hat laut Nick alle Angaben und Fotos bestätigt. Dieselben Daten dienen lokal und in der CI weiter als noindex-Vorschau. |
| 25 | **Sitemap entsteht vor `next build` in `public/`** (`scripts/sitemap-schreiben.mts`), nur mit `INDEXIERUNG=1`; `app/sitemap.ts` entfernt. | Vercel liefert die Build-Ausgabe von Next aus, nicht `out/`: Eine aus `app/sitemap.ts` erzeugte Sitemap erschien auf Vercel trotz Löschung in `out/`. Dateien in `public/` sind auf beiden Zielen identisch. |

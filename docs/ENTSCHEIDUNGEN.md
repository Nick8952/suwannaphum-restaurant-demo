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

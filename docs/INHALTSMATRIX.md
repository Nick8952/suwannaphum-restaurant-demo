# Inhaltsmatrix und Quellenübersicht

Stand: 16. Oktober 2026. Jede Angabe wurde an diesem Tag gegen die bestehende Website `https://www.suwannaphum.ch/` (Baukasten
Hoststar Designer, drei Seiten) geprüft. Legende zum Status: **übernommen** = auf der neuen Website · **intern** = nur in der
Übergabe (`docs/UEBERGABE.md`) als Frage an das Restaurant · **verworfen** = nicht verwendbar · **historisch** = abgelaufen,
dokumentiert, nicht auf der Website.

## 1. Quellenprüfung

| Frage aus dem Auftrag | Ergebnis |
| --- | --- |
| Welche Seiten hat die bestehende Website? | Laut `sitemap_pages.xml` genau drei: `/` (Home), `/speisekarte`, `/unsere-mitarbeiter`. `/impressum`, `/datenschutz`, `/kontakt` liefern 404. Es gibt **kein Impressum und keine Datenschutzerklärung**. |
| Liegt die Speisekarte als Text vor? | Nein. Die Seite `/speisekarte` zeigt **elf Kartenseiten als Bilder** (JPEG, 1240 × 1754 px, hochgeladen am 11. Juli 2026) und eine Dessert-Dekoration. Die Karte wurde Bild für Bild abgeschrieben und gegen das Original geprüft (siehe 3). Ein PDF gibt es nicht. |
| Sonderöffnungs-Hinweis für September 2024? | Am 16. Oktober 2026 **nicht mehr** auf der Startseite. In der Medienbibliothek der Website liegen abgelaufene Betriebsferien-Grafiken (Oktober 2023, 22. Mai bis 4. Juni 2025, 30. April bis 16. Mai 2026); keine ist eingebunden. Die Grafik 2026 ist als abgelaufener Hinweis in `data/hinweise.json` erfasst und erscheint nicht (Beispiel für den Mechanismus). |
| Sind Preise und Öffnungszeiten aktuell? | Die Kartenbilder stammen vom 11. Juli 2026, die Öffnungszeiten stehen als Text auf der Startseite (Copyright-Zeile «© 2023»). Eine **Bestätigung durch das Restaurant fehlt**; alle Angaben tragen deshalb die Freigabe «demo» (`docs/UEBERGABE.md`). |
| Stimmen die Lieferdienst-Links? | Die Website verlinkt nur die **Plattform-Startseiten** `ubereats.com` und `just-eat.ch`. Die neuen Links zeigen auf die Restaurantprofile: Just Eat (`/speisekarte/suwannaphum`, im Browser geprüft: Zürcherstrasse 31, 8952, Kategorien der Karte) und Uber Eats (`/ch-de/store/suwannaphum/zccpQBorT0CcQnVGiCvMAA`; der Direktabruf wird durch einen Bot-Schutz blockiert, der Nachweis stammt aus dem Suchmaschinen-Snippet mit Adresse und Telefon). |
| Buffetpreis mit Bier (CHF 21.50)? | Steht **nicht** auf der aktuellen Startseite. Dort: «Buffet à discrétion ab Fr. 20.50 pro Person (inkl. ein alkoholfreies Getränk)». Das Wort «ab» deutet auf weitere Angebote hin; die Variante mit Bier ist eine Frage an das Restaurant (intern). |
| Gibt es ein Logo? | Die Website zeigt den Namen nur als Text. In der Medienbibliothek liegt das Titelblatt der gedruckten Karte («0 menu11.jpg», Mai 2026): Schreibschrift «Suwannaphum Thai-Restaurant» auf Gelb. Es dient als Wortmarke. Im Restaurant hängt ein geschnitztes Holzschild «SUWANNAPHUM / สุวรรณภูมิ». |
| E-Mail-Adresse? | Keine auf der Website, keine in den Plattformprofilen. **Keine erfunden.** Kontakt bleibt telefonisch. |
| Rechtsform, UID, Inhaber? | Nicht auf der Website. Genannt ist «Saythong Schmied, Geschäftsführerin und Chefköchin». Keine Rechtsform und keine UID erfunden (intern). |

## 2. Quellen

| Nr. | Quelle | Art | Verwendet für |
| --- | --- | --- | --- |
| Q1 | [Startseite](https://www.suwannaphum.ch/) | eigene Website | Name, Adresse, Telefon, Reservation und Bestellung telefonisch, Take-away auf Anfrage, Öffnungszeiten, Küchenhinweis, Buffet, Lieferdienste, Zahlungsmethoden, Galerie, Buffetfoto, Aushang «Special Menu» |
| Q2 | [Speisekarte](https://www.suwannaphum.ch/speisekarte) (elf Bilder) | Speisekarte | alle Kategorien, Gerichte, Nummern, Beschreibungen, Preise, Portionen, Varianten, Zuschläge, Schärfehinweise, Deklaration Fleisch/Fisch/Eier, Schärfe-Wahl |
| Q3 | [Unsere Mitarbeiter](https://www.suwannaphum.ch/unsere-mitarbeiter) | eigene Website | Geschichte (2011 Altstetten, 2016 Schliessung, Umzug nach Schlieren), Geschäftsführerin, Teamfoto mit Namen |
| Q4 | Aushang «Neu im Suwannaphum! Special Menu» (Bild auf der Startseite, Januar 2026) | Aushang | Khao Soi CHF 25.00, Pla Rad Prik CHF 27.50, Freitag 16.30 bis 21.30, Samstag 11.00 bis 21.30 |
| Q5 | [Uber Eats, Restaurantprofil](https://www.ubereats.com/ch-de/store/suwannaphum/zccpQBorT0CcQnVGiCvMAA) | Plattformprofil | nur die Verlinkung (Adresse und Telefon im Snippet stimmen überein) |
| Q6 | [Just Eat, Restaurantprofil](https://www.just-eat.ch/speisekarte/suwannaphum) | Plattformprofil | nur die Verlinkung (Adresse stimmt überein) |
| Q7 | Medienbibliothek der Website (Dateien unter `files.designer.hoststar.ch`, Namen und Daten im Quelltext) | eigene Website | Wortmarke (Titelblatt der Karte), Gerichtfotos von 2023, Gastraumfoto mit Holzschild, Betriebsferien-Grafiken (historisch) |

Nicht als Quelle verwendet: Verzeichnisse und Bewertungsplattformen (zuri.net, wanderlog, Google). Ihre Öffnungszeiten und
Bewertungen wurden weder übernommen noch zitiert.

## 3. Speisekarte: Abschrift und Prüfung

Jede der elf Kartenseiten wurde gelesen, abgeschrieben und anschliessend Zeile für Zeile gegen das Bild geprüft (Nummer, Name,
Beschreibung, Preis, Portion, Chilis). Ergebnis: **70 Positionen** in 10 Kategorien, alle Preise wie gedruckt.

| Kartenseite (Bild) | Kategorie auf der Website | Positionen | Übernahme und Anpassungen |
| --- | --- | --- | --- |
| «Thai Specials 2» (nur Thai-Schrift, 13 Gerichte) | Thai Specials | 13 | Thai-Namen wörtlich (zwei Tippfehler des Drucks korrigiert: «ผัดซีอิ๊วว» → «ผัดซีอิ๊ว», «ล่างหน้า» → «ล่วงหน้า»). Umschrift und deutsche Erklärung sind eine **Arbeitsübersetzung**, auf der Website so gekennzeichnet, Freigabe durch das Restaurant nötig. Hinweis «3 bis 4 Stunden vorher telefonisch anmelden» bei Nr. 11 und 12 übernommen. |
| «Thai-Tee 2» (เครื่องดื่ม / Beverages) | Thai-Tee | 2 | Thai Iced Tea und Thai Green Tea je CHF 7.50. Weitere Getränke stehen nicht auf der Website (intern: Getränkekarte). |
| «Vorspeisen 2» | Vorspeisen | 9 | «Fritierte» → «Frittierte» (Rechtschreibung), «Weißkabis» → «Weisskabis», «4 St.» → «4 Stück». Som Tam Thai, Laab Gai, Laab Nuer, Yam Nuer stehen hier als Vorspeisen (CHF 12.50 bis 13.50) und bei den Salaten als Hauptportion (CHF 22.50 bis 23.50), wie gedruckt. |
| «Salate 2» | Salate | 6 | «Erdnusse» → «Erdnüsse». |
| «Suppen 2» | Suppen | 4 | Giau Thiau Nam mit Grundpreis CHF 20.50 und drei Varianten (Poulet 23.00, Rindfleisch 23.50, Crevetten 23.50). «ZwiebelnPilzen» → «Zwiebeln, Pilzen». |
| «Hauptgerichte 1-5 2» | Hauptgerichte 1 bis 5 | 5 | Currys ohne Einzelpreis; die gemeinsame Preistabelle (neun Varianten, «22,50» → «22.50») steht nach Gericht 5. |
| «Hauptgerichte 6-14 2» | Hauptgerichte 6 bis 14 | 9 | «süß-sauer» → «süss-sauer», «mixed Seafood» → «gemischte Meeresfrüchte». |
| «Hauptgerichte 15-21 2» | Hauptgerichte 15 bis 21 | 7 | Fussnote «Beilage Jasminreis; gebratener Reis + 3.00, gebratene Reisnudeln + 4.00» als Zusätze der Kategorie. «Kokonussmilch» → «Kokosnussmilch». |
| «Reisgerichte 2» | Reisgerichte | 4 | «Eier» → «Eiern» (Grammatik). |
| «Nudelgerichte 2» | Nudelgerichte | 4 | Fussnote zu den Zutaten der Tamarindensauce übernommen. |
| «Vegetarische Gerichte 2» | Vegetarische Gerichte | 5 | Kategoriename wie gedruckt; **keine** Kennzeichnung einzelner Gerichte als vegetarisch, vegan oder glutenfrei (nicht deklariert). |
| Aushang «Special Menu» | Special Menu | 2 | Neu an erster Stelle der Karte, mit Verfügbarkeit Freitag/Samstag. |
| Seitenfuss der Kartenseite | Deklaration, Schärfe | 9 + 1 | Herkunftsdeklaration (Rind CH/DE, Schwein CH, Poulet CH, Ente HU, Tilapia VN/ID, Pangasius VN, Crevetten VN, Eier CH/DE Freiland) und «Schärfegrad frei wählbar» übernommen. |

Reihenfolge auf der Website: Mittagsbuffet, Special Menu, Vorspeisen, Salate, Suppen, Hauptgerichte, Reisgerichte, Nudelgerichte,
Vegetarische Gerichte, Thai Specials, Thai-Tee. Auf der bisherigen Seite stehen Thai Specials und Thai-Tee vorne; die neue Reihenfolge
folgt dem Ablauf einer Mahlzeit, die Thai Specials bleiben eine eigene, hervorgehobene Kategorie.

Nicht übernommen: die kleinen Gerichtfotos auf den Kartenseiten (zu klein, Herkunft unklar), die Zierrahmen, Tempel- und
Figuren-Grafiken der Kartenseiten.

## 4. Inhalte je Quellseite

| Quell-URL | Inhalt der alten Seite | Neue Zielseite | Status |
| --- | --- | --- | --- |
| `/` | Titel «Thai-Restaurant Suwannaphum» (nur Text, kein Logo) | Kopfzeile (Schriftzug aus dem Kartentitelblatt), Fusszeile (ganze Wortmarke) | übernommen |
| `/` | «Montag bis Freitag von 11.00 Uhr - 14.00 Uhr Buffet à discrétion ab Fr. 20.50 pro Person (inkl. ein alkoholfreies Getränk!!!)» | Startseite «Mittagsbuffet», Speisekarte `#mittagsbuffet` | übernommen (ohne Ausrufezeichen) |
| `/` | «Reservierungen und Bestellungen (Gerichte zum Mitnehmen auf Anfrage) unter Tel. 044 555 82 99» | Startseite (Einstieg, Take-away, Reservation), Kontaktseite, Kopfzeile, mobile Leiste, Menü, Fusszeile | übernommen als `tel:+41445558299` |
| `/` | Adresse Zürcherstrasse 31, 8952 Schlieren | überall; Routenlink zu Google Maps (extern, kein Iframe) | übernommen |
| `/` | Öffnungszeiten Mo/Di 11.00–14.00 und 16.30–21.00, Mi 11.00–14.00, Do 11.00–14.00 und 16.30–21.00, Fr 11.00–14.00 und 16.30–21.30, Sa 11.30–21.30, So geschlossen | Startseite «Heute» und Kontaktblock, Kontaktseite, Fusszeile | übernommen, Freigabe «demo» |
| `/` | «Die Küche schliesst am Abend jeweils eine halbe Stunde früher als das Restaurant!!!» | als Küchenzeit je Abendfenster (20.30 bzw. 21.00) plus Hinweistext | übernommen |
| `/` | «Lieferdienste: https://www.ubereats.com, https://www.just-eat.ch» | Startseite «Take-away und Lieferung», Kontaktseite «Lieferung nach Hause» | übernommen mit Restaurantprofil-Links statt Plattform-Startseiten |
| `/` | «Wir akzeptieren: Barzahlungen, Kartenzahlungen, Twint und [Logo Schweizer Lunch-Check]» | Kontaktseite «Zahlungsmethoden» | übernommen; Lunch-Check mit Hinweis «noch zu bestätigen», Fremdlogo nicht gezeigt |
| `/` | Aushang «Neu im Suwannaphum! Special Menu» (Bild) | Startseite «Special Menu», Speisekarte | übernommen als Text und zwei Bildausschnitte |
| `/` | Foto Thai-Flagge (Canva-Datei) | – | verworfen (nicht aus dem Restaurant, Rechte unklar) |
| `/` | Buffetfoto «20210204_111509» | Startseite, Speisekarte (Buffet) | übernommen (grosse Originaldatei aus der Medienbibliothek) |
| `/` | Galerie mit 10 Fotos («Unser Restaurant») | Startseite (3), Restaurant und Team «Einblicke» (8), Take-away (1) | übernommen |
| `/` | Grafik Landkarte Thailand | – | verworfen (ohne Funktion) |
| `/` | «© 2023. Thairestaurant Suwannaphum. Alle Rechte vorbehalten.» | Fusszeile (dynamisches Jahr nach Go-Live; in der Demo Entwurfshinweis) | übernommen |
| `/speisekarte` | elf Kartenseiten, Dessertfoto, Deklaration, Schärfehinweis | Speisekarte | übernommen (siehe 3); Dessertfoto verworfen |
| `/unsere-mitarbeiter` | Text zu Saythong (Jenny) Schmied, Eröffnung 9. August 2011 in «Zürich-Altstätten», Schliessung Mai 2016, Umzug nach Schlieren | Restaurant und Team «Von Altstetten nach Schlieren» | übernommen; «Altstätten» → «Altstetten» (Zürcher Stadtkreis; intern bestätigen) |
| `/unsere-mitarbeiter` | Foto Saythong mit Figuren und Früchteschale | Team | übernommen |
| `/unsere-mitarbeiter` | «Team Suwannaphum: Somjit, Supansa, Saythong (v.l.n.r.)» mit Foto | Team (Gruppenbild mit Legende) | übernommen |
| `/unsere-mitarbeiter` | Foto Thai-Flaggen vor gelbem Gebäude | – | verworfen (nicht aus dem Restaurant, Rechte unklar) |
| Meta-Beschreibung «An award-winning restaurant.» (Baukasten-Standard) | – | – | verworfen (unbelegt, Auszeichnung) |
| Medienbibliothek: Betriebsferien-Grafiken 2023, 2025, 2026 | – | `data/hinweise.json` (abgelaufen, unsichtbar) | historisch |
| Medienbibliothek: Gerichtfotos 2023 (Gaeng Kiew Wan Gai, Som Tam Thai, Fritierte Crevetten, Phad Thai Gai, Gemüseküchlein, Tom Kha Gai) | Startseite, Speisekarte | übernommen (eigene Aufnahmen des Restaurants, derzeit nicht eingebunden; intern bestätigen) |
| Medienbibliothek: Pexels-Fotos, Fotos mit Wasserzeichen, Fruchtschnitzereien 2013, Scans «IMG_20230418_*» | – | verworfen |

## 5. Neu geschriebene Texte

Einleitungen, Abschnittstexte, Beschriftungen, Impressum und Datenschutzerklärung sind neu. Sie stützen sich ausschliesslich auf
Q1 bis Q4 und machen keine Aussagen über Qualität, Auszeichnungen, Beliebtheit, Frische oder Hausgemachtes. Die Inhaltsprüfung
(`npm run inhalt:pruefen`) sperrt solche Wörter. Die einzige sprachliche Ergänzung ohne Quelle auf der Website ist die
Worterklärung «Suwannaphum bedeutet goldenes Land» (Sanskrit/Pali suvarna bhumi); sie steht auf der Seite «Restaurant und Team» und
ist in der Übergabe zur Bestätigung markiert.

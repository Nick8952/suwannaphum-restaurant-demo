# Gestaltung «Tischläufer»

Lesart des Auftrags: Neubau der Website eines kleinen, familiär geführten Thai-Restaurants in Schlieren für Gäste aus dem
Limmattal, die die Karte lesen, die Öffnungszeiten prüfen und anrufen wollen. Warme, gastfreundliche Sprache; kein Agentur-Effekt,
keine App-Oberfläche, keine Scrollführung. Stellwerte nach dem Standard-Skill: Varianz 6, Bewegung 3, Dichte 4 (die Karte braucht
Dichte, der Rest Ruhe).

## Woher die Gestaltung kommt

Alles Sichtbare stammt aus dem Restaurant selbst:

- **Gelb**: die Wortmarke auf dem Titelblatt der Karte (gemessen `#ffdd50`) und die gelben Wände des Gastraums. Auf der Website
  als `--color-gold` (#f5c62b) für Flächen: der Läufer unter dem Einstieg, der Buffetblock, die mobile Leiste, die Fusszeilen-Kante.
- **Petrol**: die zweite Wandfarbe (türkis gestrichene Wandteile und Bar). Als `--color-petrol-tief` (#0b5b55) die Akzentfarbe für
  Knöpfe und Links, als `--color-petrol-nacht` (#0a2f2d) die dunklen Bereiche (Kontaktblock, Fusszeile, Öffnungszeiten).
- **Chili**: nur für die Schärfe-Chilis der Karte (`--color-chili`, #b3301d), sonst nirgends. Rot ist damit ein Zeichen, kein Schmuck.
- **Elfenbein**: die helle Grundfläche ist leicht gelb getönt (#fff9e6), nicht grau und nicht rosa-creme; sie nimmt das Gelb der
  Marke auf, ohne zu leuchten.
- **Tischläufer**: Auf jedem Tisch des Restaurants liegt ein farbiger Stoffläufer (rot, grün, braun). Daraus wird die Signatur der
  Website: ein goldener Lauf, der unter dem Einstieg die heutigen Zeiten trägt, als schmale Kante Abschnitte trennt und auf dem
  Handy als Leiste mit «Speisekarte» und «Anrufen» am unteren Rand liegt. Auf der Speisekarte ist das Register (Kategorien) ein
  Läufer, der unter der Kopfzeile klebt.

## Schrift

- **Prompt** (Cadson Demak, SIL OFL) für Titel, Beschriftungen, Nummern und Namen der Gerichte: eine geometrische Grotesk, die in
  Thailand für Latein **und** Thai gezeichnet wurde. Die Thai-Namen der Thai Specials stehen deshalb in derselben Familie wie die
  Titel (`lang="th"`, Thai-Subset nur geladen, wo Thai-Schrift vorkommt).
- **Sarabun** (Cadson Demak, SIL OFL) für Lauftext und Preise: humanistisch, grosse x-Höhe, sehr gut lesbar, mit Thai-Glyphen.
  Preise in Sarabun 700 mit tabellarischen Ziffern.
- Beide Schriften werden lokal ausgeliefert (`next/font/local` für Latein, `@font-face` mit `unicode-range` für Thai); keine
  Anfrage an Google. Serifen wurden bewusst nicht gewählt (Standard-Skill: Serifen und insbesondere Fraunces nicht als Standard).

## Aufbau

| Seite | Rhythmus |
| --- | --- |
| Startseite | Einstieg (Text links, Gastraumfoto mit dem Holzschild rechts) → goldener Läufer «Heute» → befristete Hinweise (nur wenn aktiv) → Mittagsbuffet (Goldfläche mit Buffetfoto) → drei Kacheln der Karte mit echten Gerichtfotos → Special Menu (Sandfläche) → Restaurant (Text und drei Fotos) → Take-away und Lieferung → Petrol-Nacht-Block mit Reservation, Adresse, Öffnungszeiten |
| Speisekarte | Titel → Register (schmal: klebende Leiste; breit: Spalte links) → Buffet → zehn Kategorien als Liste mit Punktlinien zwischen Name und Preis, Chilis, Thumbnails, Preistabelle der Currys nach Gericht 5 → Schärfe und Allergene → Deklaration |
| Restaurant und Team | Seitenkopf mit breitem Foto → Geschichte und Namenserklärung → Team (Porträt, Gruppenbild mit Legende) → Einblicke (Raster, Hochformate über zwei Zeilen) → Aufruf «Tisch reservieren» |
| Kontakt | Seitenkopf → links Reservation, Take-away, Lieferung, Zahlungsmethoden; rechts Öffnungszeiten (Petrol-Nacht) und Anfahrt mit Routenlink |
| Impressum, Datenschutz | ruhiger Fliesstext, Bildnachweis als Liste |

Ein Aufruf, eine Beschriftung: «Speisekarte ansehen», «Telefonisch reservieren», «Für Take-away anrufen» heissen überall gleich
(`npm run inhalt:pruefen` prüft das).

## Speisekarte im Besonderen

- Nummer in Goldbraun, Name in Prompt 600, Chilis in Chilirot mit Screenreader-Text («Schärfe: scharf, 2 von 3»), Punktlinie, Preis
  mit kleiner Währung davor. Beschreibung darunter in Grau, Thai-Name in Prompt.
- Gerichte ohne eigenen Preis (Currys 1 bis 5) zeigen keine Punktlinie; die Preistabelle folgt nach Gericht 5 auf Sandfläche.
- Thumbnails (88 px) nur bei Gerichten mit eigenem Foto.
- Auf dem Handy bleibt das Register sichtbar (sticky unter der Kopfzeile), die Kategorien haben `scroll-margin-top`, damit kein
  Titel darunter verschwindet.

## Formen, Abstände, Bewegung

- Radien: Flächen und Bilder 12 px, Bedienelemente 6 px. Keine Schatten; Trennung durch Flächenfarbe und 1-px-Linien.
- Abschnitte `clamp(3rem, 7vw, 5.5rem)`, Seitenrand `clamp(1rem, 4.5vw, 3.5rem)`, Lauftext höchstens 62 Zeichen.
- Bewegung: ein Einstiegsmoment (Titel, Text, Knöpfe blenden nacheinander ein, 700 ms), Hover auf Kacheln (leichter Zoom),
  gedrückte Knöpfe rutschen 1 px. Alles unter `prefers-reduced-motion: no-preference`, nur `transform` und `opacity`, kein
  Scroll-Listener, keine Scrollführung.
- Touch-Ziele mindestens 44 px, Fokusring 3 px Petrol (Gold auf dunklem Grund).

## Kontraste (gerechnet)

| Paar | Verhältnis |
| --- | --- |
| Tinte #1e211f auf Elfenbein #fff9e6 | 16.3 : 1 |
| Tinte-2 #474c48 auf Elfenbein | 8.6 : 1 |
| Grau #646963 auf Elfenbein | 5.4 : 1 |
| Petrol-tief #0b5b55 auf Elfenbein | 7.6 : 1 |
| Weiss auf Petrol-tief | 7.9 : 1 |
| Tinte auf Gold #f5c62b | 10.0 : 1 |
| Goldbraun #7a5800 auf Elfenbein | 5.9 : 1 |
| Chili #b3301d auf Elfenbein | 6.1 : 1 |
| Elfenbein auf Petrol-Nacht #0a2f2d | 13.7 : 1 |
| Gold auf Petrol-Nacht | 8.5 : 1 |

Gemessene Werte im Browser stehen im Prüfbericht.

## Selbstkritik

- Der Einstieg ist ein geteiltes Bild (Text, Foto) und damit ein häufiges Muster; er bleibt, weil das Holzschild mit beiden
  Schriften das Restaurant besser zeigt als jede Typografie, und der Läufer darunter macht den Einstieg eigen.
- Das Gelb ist kräftig. Es wird deshalb nur auf grossen, ruhigen Flächen eingesetzt (Läufer, Buffet, Leiste) und nie für Text.
- Die vorhandenen Fotos sind unterschiedlich gut (abends, körnig). Die Aufnahmeliste in `docs/BILDER.md` nennt, was fehlt.

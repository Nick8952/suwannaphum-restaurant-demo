# Inhalte pflegen

Für alle, die Speisekarte, Preise, Öffnungszeiten, Ferien, Fotos oder Texte ändern. Programmierkenntnisse braucht es nicht.

Es gibt zwei Wege, je nach Stand des Projekts:

- **Mit Sanity** (sobald eingerichtet): im Studio im Browser. Das ist der Weg für das Restaurant. → Teil A
- **Ohne Sanity** (Stand der Demo): in den Dateien unter `data/`. Das ist der Weg für Nick. → Teil B

## Teil A: Im Studio (Sanity)

### Anmelden

Adresse des Studios öffnen (zum Beispiel `https://suwannaphum.sanity.studio`) und mit der eingeladenen E-Mail-Adresse anmelden.

### Wo steht was?

| Im Studio | Das ändern Sie dort |
| --- | --- |
| **Speisekarte: Kategorien und Gerichte** | je Kategorie: Titel, Einleitung, Gerichte (Nummer, Name, Zutaten, Portion, Schärfe, Preis, Varianten, Hinweis, Foto), Preistabellen, Zusätze, Fussnote, Reihenfolge |
| **Speisekarte: Allgemeines** | Einleitung, Schärfe-Erklärung, Deklaration Fleisch/Fisch/Eier, Hinweis zu Allergenen, PDF-Link |
| **Öffnungszeiten und Küchenzeiten** | je Wochentag die Zeitfenster, je Zeitfenster «Küche bis»; Hinweistext |
| **Hinweise** | Betriebsferien, Sonderöffnungszeiten, Mitteilungen mit Anzeigefenster |
| **Mittagsbuffet** | Tage, Zeit, Preise, enthaltenes Getränk, Text, Foto |
| **Seiten → Startseite / Restaurant und Team / Kontakt** | Titel, Texte, Fotos, Team |
| **Seiten → Impressum / Datenschutzerklärung** | Rechtstexte (bitte nur nach Rücksprache) |
| **Restaurant und Kontakt** | Name, Adresse, Telefon, Routenlink, Reservation, Take-away, Lieferdienste, Zahlungsmethoden, Logo |
| **Navigation, Fusszeile und kleine Texte** | Menüpunkte, Fusszeile, Beschriftungen |

### Ändern und veröffentlichen

1. Eintrag öffnen, Feld ändern. Unter jedem Feld steht, wofür es da ist.
2. Unten rechts auf **Veröffentlichen** klicken. Vorher ist die Änderung nur ein Entwurf.
3. **Warten.** Die Website wird neu gebaut; nach ein bis drei Minuten ist die Änderung sichtbar. Dann die Seite neu laden.

Rot markierte Felder verhindern das Veröffentlichen. Der Hinweis am Feld sagt, was fehlt.

### Häufige Aufgaben

**Einen Preis ändern.** Speisekarte: Kategorien und Gerichte → Kategorie öffnen → Gericht aufklappen → «Preis in Franken», zum
Beispiel `23.5` → Veröffentlichen. Bei den Currys 1 bis 5 stehen die Preise in der Preistabelle der Kategorie «Hauptgerichte».

**Ein Gericht hinzufügen oder entfernen.** In der Kategorie unter «Gerichte» auf «Hinzufügen» (am Ende) oder das Menü des Eintrags
(«Entfernen»). Nummern bitte wie auf der gedruckten Karte vergeben; die Website prüft nicht, ob sie lückenlos sind.

**Schärfe.** Beim Gericht «Schärfe (Anzahl Chilis)» 0 bis 3 wählen. Die Website zeigt die Chilis und einen Text für Screenreader.

**Thai-Name.** «Name in Thai-Schrift» ausfüllen; die Website setzt ihn in derselben Schrift wie die Titel. Bei einer Kategorie,
die im Original nur auf Thai vorliegt, bleibt «Übersetzung vorläufig» eingeschaltet, bis das Restaurant Umschrift und Erklärung
bestätigt hat.

**Allergene und Kennzeichnungen.** Nur eintragen, was das Restaurant ausdrücklich bestätigt. Aus Zutaten wird nichts abgeleitet.
Sobald etwas eingetragen ist, zeigt die Website es unter dem Gericht an.

**Öffnungszeiten ändern.** Öffnungszeiten und Küchenzeiten → Wochentag aufklappen → Zeitfenster anpassen (`11:00` bis `14:00`).
Ein Tag ohne Zeitfenster ist geschlossen. «Küche bis» leer lassen, wenn die Küche bis zum Schluss offen ist.

**Betriebsferien eintragen.** Hinweise → Neu → Art «Betriebsferien», Titel, Text, «Anzeigen ab» (zum Beispiel vier Wochen vorher),
«Anzeigen bis» (letzter Ferientag), «Betroffen von» und «Betroffen bis» (die geschlossenen Tage), optional «Am ersten Tag
geschlossen ab» (zum Beispiel `14:00`). Der Hinweis erscheint auf der Startseite, verschwindet nach «Anzeigen bis» von selbst, und
die Anzeige «Heute» zeigt an den betroffenen Tagen «geschlossen».

**Sonderöffnungszeiten (zum Beispiel Feiertag).** Hinweise → Neu → Art «Sonderöffnungszeiten», betroffene Tage und unter
«Zeitfenster an diesen Tagen» die abweichenden Zeiten eintragen. Leer = an diesen Tagen geschlossen.

**Mitteilung (zum Beispiel neues Gericht, Preisänderung).** Hinweise → Neu → Art «Mitteilung», Text, Anzeigefenster.

**Buffetpreis ändern.** Mittagsbuffet → Angebote → Preis. «Preis als ab-Preis anzeigen» einschalten, wenn weitere Angebote möglich
sind. Ein zweites Angebot (zum Beispiel mit Bier) als weiteren Eintrag hinzufügen.

**Foto tauschen.** Beim Bildfeld «Hochladen». Jedes Bild braucht eine Bildbeschreibung (ein Satz, was zu sehen ist) und einen
Bildnachweis (Fotografin oder Fotograf, «eigenes Bild», Nutzungsrecht); der Nachweis erscheint im Impressum. Fotos von Personen nur
mit deren Einverständnis.

**Lieferdienst ändern.** Restaurant und Kontakt → Lieferdienste. Die Adresse muss die Seite des Restaurants beim Lieferdienst
sein, nicht die Startseite der Plattform.

### Was nicht geht (bewusst)

- Es gibt keine Online-Reservation und kein Bestellsystem; alle Knöpfe führen zum Telefon. Die Texte dazu bitte nicht so ändern,
  dass sie eine Buchung versprechen.
- Unter «Datenschutz-Einstellungen» keine Kategorie eintragen, solange kein neuer Dienst eingebaut wurde. Sonst erscheint ein
  Banner, das nichts steuert, und die Datenschutzerklärung müsste den Dienst beschreiben.
- Im Impressum den Zwischentitel «Bildnachweis» nicht umbenennen: Darunter fügt die Website die Liste der Bildnachweise ein.
- Adressen bestehender Kategorien (Feld «Adresse (Sprungmarke)») nach der Veröffentlichung nicht mehr ändern.

## Teil B: In den Dateien (ohne Sanity)

Die Inhalte liegen als JSON unter `data/`. Dieselben Regeln wie im Studio gelten hier, geprüft von `npm run inhalt:pruefen`.

| Datei | Inhalt |
| --- | --- |
| `data/speisekarte.json` | Karte: Kategorien mit Gerichten, Preistabellen, Zusätzen; Schärfe, Deklaration, Allergenhinweis |
| `data/oeffnungszeiten.json` | sieben Wochentage mit Zeitfenstern (`von`, `bis`, `kuecheBis`) |
| `data/hinweise.json` | befristete Hinweise (`anzeigenVon`, `anzeigenBis`, `geschlossenVon`, `geschlossenBis`, `geschlossenAb`, `zeiten`) |
| `data/buffet.json` | Mittagsbuffet |
| `data/einstellungen.json` | Name, Adresse, Telefon, Routenlink, Reservation, Take-away, Lieferdienste, Zahlungsmethoden, Logo |
| `data/startseite.json`, `data/seiten/*.json` | Seitentexte, Impressum, Datenschutzerklärung |
| `data/texte.json` | Navigation, Aufrufe, Fusszeile, Beschriftungen, Einwilligung, SEO |
| `scripts/bilder-liste.json` + `assets/originale/` | Bilder: Kennung, Datei, Ausschnitt, Alternativtext, Nachweis |

Ablauf: Datei ändern → `npm run inhalt:pruefen` → `npm run build && npm run export:pruefen` → `git commit` → `git push`.
GitHub Actions baut und veröffentlicht die Demo. Neue Bilder: Datei nach `assets/originale/` legen, in
`scripts/bilder-liste.json` eintragen, `npm run bilder` ausführen, Kennung in den Inhalten verwenden, `assets/originale/HERKUNFT.md`
ergänzen.

Formate: Preise als Zahl (`22.5`), Uhrzeiten `HH:MM`, Daten `JJJJ-MM-TT`, Telefon `+41 44 555 82 99`, Schweizer Schreibweise
(«ss», keine Gedankenstriche), Anführungszeichen «…».

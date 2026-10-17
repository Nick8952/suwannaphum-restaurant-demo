# Übergabe: offene Angaben und Freigaben

Stand: 16. Oktober 2026. Dieses Dokument ist das Arbeitspapier für das Gespräch mit dem Thai Restaurant Suwannaphum und für den
Produktivbetrieb. Solange die Punkte offen sind, bleibt die Website ein Entwurf (noindex) mit Freigabestand «demo».

## Stand der Demo

- Repository: <https://github.com/Nick8952/suwannaphum-restaurant-demo> (öffentlich)
- **Link für den Kunden:** <https://suwannaphum-restaurant-demo.vercel.app> (Vercel, baut bei jedem Push auf `main`; noindex, als
  Entwurf gekennzeichnet)
- Zweite Veröffentlichung desselben Stands: <https://nick8952.github.io/suwannaphum-restaurant-demo/> (GitHub Pages, noindex)
- Inhalte: lokal in `data/`. Vercel ist eingerichtet (Projekt im Konto nick8952, keine Umgebungsvariablen); Sanity ist vorbereitet,
  aber nicht eingerichtet (`docs/SANITY-VERCEL-EINRICHTUNG.md`).

## Für Nick, vor dem Versand der Demo

1. **Postanschrift im Impressum der Demo.** Dort steht «wird auf Anfrage mitgeteilt». Für ein öffentlich erreichbares Angebot ist
   eine Kontaktadresse üblich; bitte ergänzen (`data/seiten/impressum.json`) oder bewusst so lassen.
2. **Bilder und Wortmarke.** Die Demo zeigt Fotos, Teamaufnahmen und die Wortmarke des Restaurants ohne dessen Freigabe. Das ist
   bei einer Verkaufs-Demo üblich, aber eine Entscheidung. Wer vorsichtiger sein will, entfernt die Teamfotos
   (`data/seiten/restaurant.json`, `scripts/bilder-liste.json`) bis zur Freigabe.
3. **Thai Specials.** Die Kategorie zeigt eine Arbeitsübersetzung (Umschrift und deutsche Erklärung). Beim Gespräch die Liste
   durchgehen lassen; falsche Erklärungen wären peinlich.

## Fragen an das Restaurant

### Angaben und Öffnungszeiten

| Nr. | Frage | Warum |
| --- | --- | --- |
| 1 | Stimmen Adresse (Zürcherstrasse 31, 8952 Schlieren) und Telefon 044 555 82 99? | Grundlage aller Kontaktangaben |
| 2 | Stimmen die Öffnungszeiten noch (Mo/Di/Do 11.00 bis 14.00 und 16.30 bis 21.00, Mi nur Mittag, Fr bis 21.30, Sa 11.30 bis 21.30, So geschlossen)? | Die Website trägt «© 2023»; eine Bestätigung fehlt |
| 3 | Schliesst die Küche am Abend immer 30 Minuten vor dem Restaurant? Auch über Mittag? | Küchenzeiten stehen separat auf der Website |
| 4 | Samstag: Öffnung 11.30 (Startseite) oder 11.00 (Aushang «Special Menu»)? | Widerspruch zwischen zwei eigenen Quellen |
| 5 | Gibt es eine E-Mail-Adresse, die auf der Website stehen darf? | Es ist keine bekannt; ohne sie bleibt der Kontakt telefonisch |
| 6 | Rechtsform, Inhaberin oder Inhaber, Handelsregister- bzw. UID-Nummer? | Impressum für den Produktivbetrieb; nichts davon ist öffentlich belegt |
| 7 | Wird «Zürich-Altstetten» (statt «Altstätten» wie auf der alten Seite) richtig geschrieben? | Geschichte auf der Seite «Restaurant und Team» |
| 8 | Betriebsferien oder Feiertage in den nächsten Monaten? | Können als befristeter Hinweis erfasst werden |

### Speisekarte und Buffet

| Nr. | Frage | Warum |
| --- | --- | --- |
| 9 | Sind alle 70 Positionen und Preise aktuell (Stand der Kartenbilder: Juli 2026)? | Vollständige Abschrift in `docs/INHALTSMATRIX.md`, Abschnitt 3 |
| 10 | Thai Specials: Stimmen Umschrift und deutsche Erklärung? Soll die Kategorie auch für deutschsprachige Gäste erscheinen? | Arbeitsübersetzung, auf der Website gekennzeichnet |
| 11 | Som Tam Thai, Laab Gai, Laab Nuer, Yam Nuer stehen als Vorspeise (12.50 bis 13.50) und als Salat (22.50 bis 23.50): Portionsgrössen? | Beide Preise wie gedruckt übernommen |
| 12 | Buffet: Gibt es ein Angebot mit Bier (CHF 21.50) oder weitere Angebote? Gilt «ab CHF 20.50» noch? | Auftrag nennt 21.50 mit Bier; auf der aktuellen Website steht nur «ab 20.50 inkl. alkoholfreies Getränk» |
| 13 | Special Menu (Khao Soi, Pla Rad Prik): noch im Angebot, nur Freitagabend und Samstag? | Aushang vom Januar 2026 |
| 14 | Getränkekarte (ausser Thai-Tee) und Dessertkarte: Soll sie auf die Website? | Nur zwei Tees sind belegt |
| 15 | Allergene oder vegetarische/vegane Kennzeichnungen, die das Restaurant bestätigen kann? | Derzeit keine; die Website sagt das ehrlich |
| 16 | Lunch-Check wirklich akzeptiert? Weitere Zahlungsmittel? | Auf der alten Website nur als Logo |
| 17 | Uber Eats und Just Eat: aktiv? Weitere Lieferdienste? | Links auf die Restaurantprofile sind gesetzt |

### Bilder und Rechte

| Nr. | Frage | Warum |
| --- | --- | --- |
| 18 | Dürfen die Fotos der alten Website (Gastraum, Buffet, Gerichte, Wortmarke) weiterverwendet werden? Wer hat sie gemacht? | Bildrechte, Impressum |
| 19 | Sind Saythong Schmied, Somjit und Supansa mit den Fotos auf der Website einverstanden? Nachnamen der beiden Mitarbeiterinnen? | Persönlichkeitsrechte |
| 20 | Gibt es die Wortmarke als Vektordatei (SVG, PDF) oder ein eigentliches Logo? | Schärfe in der Kopfzeile |
| 21 | Fototermin für Aussenansicht, Buffet, Gerichte ohne Foto (Liste in `docs/BILDER.md`)? | Bessere Bilder für den Produktivbetrieb |

### Domain und Betrieb

| Nr. | Frage | Warum |
| --- | --- | --- |
| 22 | Soll die neue Website unter `suwannaphum.ch` laufen? Wer verwaltet die Domain (Hoststar)? | Go-Live, DNS-Umstellung |
| 23 | Wer pflegt die Inhalte (Studio-Zugang per E-Mail)? | Sanity-Einladung |
| 24 | Soll die Namenserklärung «goldenes Land» auf der Website bleiben? | Einzige Aussage ohne Quelle auf der alten Website |

## Was die Demo bewusst nicht enthält

- keine Online-Reservation, keine Bestellfunktion, kein Formular (keine E-Mail bekannt)
- keine eingebettete Karte, keine Bewertungen, keine Auszeichnungen, keine Social-Media-Einbettung
- keine Stock- und KI-Bilder
- keine Getränke- oder Dessertkarte (nicht belegt)

## Vor dem Produktivbetrieb (Checkliste)

1. Alle Fragen oben geklärt; Antworten in `data/` bzw. im Studio eingetragen.
2. `npm run inhalt:pruefen -- --live` zeigt keine offenen Punkte: Freigaben auf «live», «Übersetzung vorläufig» aus.
3. Impressum und Datenschutzerklärung neu geschrieben (Restaurant als Betreiber, tatsächliches Hosting).
4. Bildrechte und Einverständnisse schriftlich.
5. Go-Live nach `docs/SANITY-VERCEL-EINRICHTUNG.md`, Abschnitt 7; Demo auf GitHub Pages abschalten.

# Skill-Anwendung

Ehrliche Übersicht, welche installierten Skills für dieses Projekt geprüft und wie sie angewendet wurden. Stand: 16. Oktober 2026.

- **gelesen** = die `SKILL.md` wurde in der Sitzung vollständig geladen
- **Kopf gelesen** = Beschreibung und Einstieg gelesen, um die Anwendbarkeit zu beurteilen
- **nicht gelesen** = nur über Name und Kurzbeschreibung im Inventar beurteilt

Skills sind Anleitungen, keine Werkzeuge: Ihre Regeln wurden von Hand befolgt. Konfliktregel des Auftrags: `design-taste-frontend`
(v2) ist der Standard; die Gestaltung muss zum Restaurant passen; widersprechende Stile werden nicht vermischt; kein Brutalismus,
keine App-Oberfläche, keine aufwendigen Scroll-Effekte.

## Inventar

- Persönliche Skills (`~/.claude/skills`): 14, alle im Auftrag genannt
- Projekt-Skills des Workspace (`../.claude/skills`): 33 (u. a. `ui-ux-pro-max`, `frontend-design`, `frontend-ui-engineering`, `security-and-hardening`, `code-review-and-quality`, `ci-cd-and-automation`, `performance-optimization`, `api-and-interface-design`, `documentation-and-adrs`)
- Plugin-Skills: `design:*` (ux-copy, accessibility-review, design-critique, design-handoff, design-system u. a.), `vercel:*`, `anthropic-skills:*`, eingebaute Skills

## Im Auftrag genannte Skills

| Skill | Geprüft | Anwendung | Nichtanwendung oder Konfliktauflösung | Abschlussprüfung |
| --- | --- | --- | --- | --- |
| `design-taste-frontend` (v2) | gelesen | **angewendet.** Lesart («Neubau eines familiär geführten Thai-Restaurants für Gäste aus dem Limmattal, warm, gastfreundlich») und Stellwerte 6/3/4 in `docs/DESIGN.md`. Einstieg im ersten Bildschirm: Titel zwei Zeilen, Text 15 Wörter, zwei Knöpfe, ein Bild. Ein Akzent (Petrol) auf der ganzen Website, Gold nur als Fläche, ein Radiensystem (12/6 px), helles Theme durchgehend. Keine Karten mit Schatten, keine drei gleichen Kacheln ohne Bild (die drei Kacheln tragen echte Fotos), keine Versal-Etiketten über Titeln, keine Abschnittsnummern, keine Scroll-Hinweise, keine Pillen auf Bildern, keine Gedankenstriche (maschinell geprüft), ein Wortlaut je Absicht (maschinell geprüft), Knöpfe einzeilig, Kontraste gerechnet. Bewegung: ein Einstiegsmoment, sonst Ruhe; nur `transform`/`opacity`; `prefers-reduced-motion`; kein Scroll-Listener (IntersectionObserver im Register). Icons nur aus Phosphor. | **Serifen-Regel befolgt**: Fraunces (ursprünglich erwogen) ist im Skill als Standard gesperrt; gewählt wurden Prompt und Sarabun (sans, Thai-Glyphen). **Keine Motion-Bibliothek** (Bewegung 3: CSS genügt). **Keine Bildgenerierung**: echte Fotos des Restaurants vorhanden, KI-Bilder dürfen laut Auftrag nie als Restaurantbilder erscheinen. **Palette bewusst nicht Creme/Terrakotta/Messing**, sondern Gelb/Petrol/Elfenbein aus Logo und Wänden. | Pre-Flight des Skills durchgegangen; maschinell belegt in `docs/PRUEFBERICHT.md` (Titelzeilen, Knöpfe im ersten Bildschirm, Kontraste, Wortlaut, Gedankenstriche, Touch-Ziele). |
| `design-taste-frontend-v1` | Kopf gelesen | nicht angewendet | Kein Kompatibilitätsbedarf; v2 ist Standard. | – |
| `full-output-enforcement` | gelesen | **angewendet.** Alle Seiten, Komponenten, Schemas, Skripte, Daten (70 Gerichte vollständig abgeschrieben) und Dokumente sind vollständig ausgeschrieben; keine Platzhalter, keine «…» als Auslassung. | – | Suche nach `TODO`, `FIXME`, «…» als Auslassung und Platzhaltertext im Quelltext und in `data/`: keine Treffer (siehe Prüfbericht). |
| `high-end-visual-design` | gelesen | **teilweise.** Übernommen: eigene Easing-Kurve statt `linear`/`ease-in-out`, keine harten Schatten, Weichzeichner nur auf der fixierten Kopfzeile, disziplinierte z-Ebenen (20/30/35/40/50), mobile Rückfälle je Raster, gedrückter Zustand der Knöpfe, Schriften ausserhalb der gesperrten Liste. | Verworfen: Doppelrand-Karten, Pillenknöpfe, schwebende Insel-Navigation, Etiketten-Pillen, Abstände ab `py-40`, Einblenden mit Unschärfe, Hamburger-Morph. Sie widersprechen der ruhigen Restaurant-Richtung und dem Standard-Skill. | Kontrolle im CSS: kein `box-shadow`, `linear` nirgends, `backdrop-filter` nur auf `.kopfzeile`. |
| `minimalist-ui` | gelesen | **teilweise.** Übernommen: 1-px-Linien statt Kästen (Gerichtliste), Text nie reines Schwarz, keine Emojis (Chilis sind Icons mit Text), keine Werbefloskeln, ruhiges Einblenden, Schriftkontrast über Familie und Gewicht. | Verworfen: Warm-Monochrom und Pastell (die Marke ist Gelb und Petrol), Serifen-Titel, Bento-Raster, Fenster-Attrappen, Tastenkürzel. | Kontrolle: keine Verläufe, keine Emojis im Quelltext (geprüft). |
| `redesign-existing-projects` | gelesen | **angewendet als Audit und Prüfliste.** Audit der alten Seite: Baukasten mit Speisekarte nur als Bilder, Links auf Plattform-Startseiten, kein Impressum, keine Datenschutzerklärung, Meta-Text «award-winning restaurant» (unbelegt), Thai-Flagge als Dekor. «Was oft vergessen geht»: rechtliche Seiten, gestaltete 404, Sprunglink, Favicon, Metadaten, Kennzeichnung der aktuellen Seite, Fokusring, Hover- und Druckzustände, semantisches HTML, Alternativtexte, keine toten Links. | Der Teil «bestehenden CSS-Stack verbessern» entfällt: Die alte Seite ist ein Baukasten ohne zugänglichen Code; Neubau statt Upgrade (Auftrag). | Alle Punkte der Liste erfüllt; Nachweis im Prüfbericht. |
| `gpt-taste` | gelesen | nicht angewendet | GSAP-Pflicht, Pinning, Card-Stacking, Laufbänder, Zufallsauswahl und Bento widersprechen «ruhige Animationen, keine Scrollführung, wenig JavaScript». Deckungsgleiche Regeln (Titel höchstens zwei Zeilen, lesbare Knöpfe, keine Meta-Etiketten, kein horizontaler Überlauf) sind über den Standard-Skill erfüllt. | – |
| `industrial-brutalist-ui` | gelesen | nicht angewendet | Brutalismus passt nicht zu einem Thai-Restaurant; der Auftrag verbietet, ihn nur wegen des Skills zu verwenden. | – |
| `stitch-design-taste` | Kopf gelesen | nicht angewendet | Setzt Google Stitch voraus. Die Aufgabe einer `DESIGN.md` erfüllt `docs/DESIGN.md` (Atmosphäre, Farben mit Hex, Typografie, Komponenten, Layout, Bewegung, Anti-Pattern-Liste). | – |
| `brandkit` | Kopf gelesen | nicht angewendet | Bildgenerierung für Markenbretter. Das Restaurant hat eine Wortmarke; KI-Bilder dürfen nicht als Restaurantmaterial erscheinen. Die Markenanalyse (Gelb gemessen, Wortmarke und Holzschild beschrieben) steht in `docs/DESIGN.md`. | – |
| `image-to-code` | Kopf gelesen | nicht angewendet | Verlangt zuerst generierte Entwurfsbilder (für Codex gedacht). Ersatz: Entwurf direkt in HTML/CSS, Screenshots auf 360/768/1440 px gesichtet, nachgebessert (Kopfzeile mobil, Preisabstand, Register-Höhe, Preis-Überlauf). | – |
| `imagegen-frontend-web` | Kopf gelesen | nicht angewendet | Bildgenerierung je Abschnitt. Nicht nötig (echte Fotos) und laut Auftrag nie als echte Aufnahmen darstellbar. | – |
| `imagegen-frontend-mobile` | Kopf gelesen | nicht relevant | App-Bildschirme im Gerätrahmen; der Auftrag will ausdrücklich keine App-Oberfläche. | – |
| `find-skills` | gelesen | nicht angewendet | Es fehlte kein Skill; nichts gesucht oder installiert, keine kostenpflichtigen Werkzeuge. | – |

## Zusätzlich genannte Skills

| Skill | Geprüft | Anwendung | Abschlusskontrolle |
| --- | --- | --- | --- |
| `frontend-design` (Plugin) | gelesen | **angewendet.** Idee aus der Welt des Restaurants (die Tischläufer auf jedem Tisch, Gelb der Wände, Holzschild in zwei Schriften), Plan vor Code (Farben als Hex, Schriftrollen, Aufbau je Seite, Signatur), Abgleich mit den fünf KI-Standardlooks (kein Creme + Serif + Terrakotta, keine Versal-Eyebrows, keine Mittelpunkte, kein Pfeil als Textzusatz in Links, keine SaaS-Kartenkiste), eine Signatur (Läufer) und sonst Ruhe, Texte als Gestaltungsmaterial («Telefonisch reservieren», «Für Take-away anrufen»), Selbstkritik in `docs/DESIGN.md`. | Screenshots auf drei Breiten gesichtet; Mittelpunkte und Pfeil-Suffixe maschinell geprüft (keine). |
| `ui-ux-pro-max` | gelesen (`SKILL.md`, `pro-rules.md`); Suchskript ausgeführt (`--design-system`, Dials 6/3/4) | **teilweise.** Rangfolge 1 bis 9 als Prüfliste: Kontrast ≥ 4.5:1, Alt-Texte, Tastatur, Touch-Ziele 44 px, AVIF/WebP mit reserviertem Platz, kein horizontales Scrollen, Schrift ab 16 px (Lauftext 17 px), Bewegung mit Bedeutung, Kennzeichnung der aktuellen Seite, Bottom-Navigation mit zwei Zielen. Der Vorschlag des Suchskripts (Playfair Display SC / Karla, Rot-Palette «Appetizing red», Funnel-Pattern) wurde **nicht** übernommen: Serifen sperrt der Standard-Skill, Rot widerspricht der Marke (Gelb/Petrol), ein Verkaufs-Funnel passt nicht zu einer Restaurantseite. Übernommen aus dem Skript: «Avoid: low-quality imagery, outdated hours» (Hinweise mit Ablauf, Aufnahmeliste). | Ergebnisse im Prüfbericht. |
| `design:accessibility-review` | gelesen | **angewendet** als Prüfliste nach WCAG 2.1 AA (wahrnehmbar, bedienbar, verständlich, robust): Kontrasttabelle in `docs/DESIGN.md`, Tastaturprüfung, Fokusreihenfolge, Dialoge mit Fokusfalle und Fokus-Rückgabe (Befund aus den Funktionsprüfungen behoben), Touch-Ziele, Zoom 200 % über die Breiten 640/720 px. | Tabellen im Prüfbericht. Nicht möglich war ein Test mit echtem Screenreader. |
| `design:ux-copy` | gelesen | **angewendet.** Knöpfe sagen, was passiert (Telefon, Karte, Route). Keine Bestätigungsfloskeln, keine Erfolgsmeldungen, weil die Website nichts sendet. Ein Wort für eine Sache (Reservation, Take-away, Lieferung). Fehlerseite nennt, was zu tun ist. | Wortlaut-Prüfung in `npm run inhalt:pruefen`. |
| `design:design-critique` | gelesen | **angewendet** als Selbstkritik (erster Blick, Bedienbarkeit, Hierarchie, Konsistenz) anhand der Screenshots; Funde: Zusatztext kollidierte mobil mit dem Menüknopf, Preis ohne Abstand nach «CHF», Demo-Hinweis zu lang auf dem Handy, Registerlinks am Desktop zu niedrig. Alle behoben. | Abschnitt «Selbstkritik» in `docs/DESIGN.md`. |
| `design:design-handoff` | gelesen | **angewendet.** Zustände, Breakpoints, Randfälle (Betriebsferien ab Uhrzeit, Sonderzeiten, leere Hinweise, Gerichte ohne Preis) und Bewegung in `docs/DESIGN.md` und `CLAUDE.md`. | – |
| `design:design-system` | gelesen | **angewendet** als Audit der Tokens: alle Farben in `@theme`, keine Hex-Werte in Komponenten (geprüft), Radien- und Abstandsskala dokumentiert. | Suche nach Hex-Werten in `components/` und `app/*.tsx`: keine Treffer. |

## Weitere Projekt-Skills (Workspace)

| Skill | Geprüft | Anwendung |
| --- | --- | --- |
| `code-review-and-quality`, `doubt-driven-development` | nicht gelesen | Zwei unabhängige Codex-Prüfungen (Architektur mit 16 Befunden, Abschlussprüfung), Befunde in `docs/PRUEFBERICHT.md` |
| `frontend-ui-engineering` | Kopf gelesen | Semantik (`header`, `nav`, `main`, `section` mit `aria-labelledby`, `address`, `dl`), natives `<dialog>`, `aria-expanded`, `aria-current`, `aria-live` für «Heute», `lang="th"` für Thai |
| `security-and-hardening` | Kopf gelesen | Vertrauensgrenze «Inhalte aus dem CMS»: Zulassungsliste für Linkziele (ohne Backslash, nur https mit Host), maskiertes JSON-LD, keine Geheimnisse, Vorschau-Server ohne Pfadausbruch, minimale CI-Rechte |
| `ci-cd-and-automation` | Kopf gelesen | Ablauf: Inhalte, Lint, Typen, Import-Trockenlauf, Build, Export-Prüfung, Browser-Prüfungen, erst dann Veröffentlichung; eigener Job für das Studio; wöchentlicher Lauf |
| `performance-optimization` | Kopf gelesen | Erst messen, dann handeln: zod aus dem Browser-Bundle entfernt (699 → 585 KB unkomprimiert), Bildbudgets, Thai-Schriften nur per `unicode-range`, Lighthouse-Messungen im Prüfbericht |
| `api-and-interface-design` | Kopf gelesen | Eine Schnittstelle `Inhaltsquelle`, ein Domainmodell, zwei Adapter, Prüfung an der Grenze |
| `documentation-and-adrs` | Kopf gelesen | `docs/ENTSCHEIDUNGEN.md` hält das Warum fest |
| `vercel:*`, `anthropic-skills:*`, übrige | nicht gelesen | nicht relevant (kein Vercel-Deploy in diesem Auftrag; keine Office-Dokumente) |

## Ergebnis der Abschlussprüfung

Gegen die Vorgaben der angewendeten Skills geprüft (Stand nach dem Codex-Review): keine Serifen, ein Akzent, ein Radiensystem,
Hero im ersten Bildschirm, keine Eyebrows, keine Mittelpunkte, keine Gedankenstriche, Knöpfe einzeilig, Kontraste ≥ 4.5:1,
Touch-Ziele ≥ 44 px, `prefers-reduced-motion`, keine Emojis, keine Hex-Werte in Komponenten, keine Platzhalter. Messwerte und
Browser-Prüfungen: `docs/PRUEFBERICHT.md`.

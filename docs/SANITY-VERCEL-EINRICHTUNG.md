# Sanity und Vercel einrichten

Diese Anleitung ist für den Tag, an dem das Restaurant die Website übernehmen will. **Bis dahin ist nichts davon nötig:** Die
Demo auf GitHub Pages läuft ohne Sanity, ohne Vercel und ohne Zugangsdaten. Es existiert noch kein Sanity-Projekt und kein
Vercel-Projekt; beides legt Nick selbst an.

Zeitbedarf: etwa 45 Minuten. Du brauchst ein Sanity-Konto, ein Vercel-Konto und das GitHub-Repository
`Nick8952/suwannaphum-restaurant-demo`.

## So hängt es zusammen

```text
Restaurant bearbeitet im Studio  ──►  Sanity (Inhalte)
   (<name>.sanity.studio)                  │  «Veröffentlichen»
                                           ▼
                                   Webhook von Sanity
                                           │
                                           ▼
                              Deploy-Hook von Vercel  ──►  neuer Build (1 bis 3 Minuten)
                                                                │  liest die Inhalte aus Sanity
                                                                ▼
                                                    statische Website ist aktualisiert
```

Die Website bleibt ein statischer Export. Es gibt keinen Server, der Inhalte «live» nachlädt. Auch die Bilder kommen nicht vom
Sanity-CDN: Jeder Build lädt sie einmal herunter, erzeugt AVIF und WebP und liefert sie mit der Website aus
(`scripts/sanity-bilder.mts`). Gäste lösen weiterhin keine Anfrage an Dritte aus. **Eine Änderung ist deshalb erst nach dem
nächsten Build sichtbar.** Dem Restaurant sagt man das genau so: «Veröffentlichen, zwei Minuten warten, Seite neu laden.»

Zwei Ausnahmen, die ohne Build auskommen: Abgelaufene **Hinweise** (Betriebsferien, Mitteilungen) verschwinden im Browser auch
aus einem alten Build, und die Anzeige **«Heute»** rechnet mit der Uhr des Geräts. Neue Hinweise und geänderte Zeiten brauchen
aber einen Build. Deshalb baut die CI zusätzlich jede Woche (Montag 03:00 UTC), auf Vercel ersetzt das ein Cron-Job oder der
Webhook (Schritt 6). Solange der Webhook nicht eingerichtet ist, löst eine Veröffentlichung gar nichts aus.

Es gibt kein eingebettetes Studio unter `/studio` und keine Route `/api/revalidate` (dasselbe Modell wie bei der Casatex-Demo).

## 1. Sanity-Projekt anlegen

1. Auf <https://www.sanity.io/manage> anmelden, **Create new project**. Name «Thai Restaurant Suwannaphum», Dataset `production`,
   Sichtbarkeit **Public** (die Inhalte stehen ohnehin auf der Website; so braucht der Build kein Lese-Token).
2. Die **Projekt-ID** notieren (acht Zeichen, oben auf der Projektseite). Sie ist nicht geheim.
3. Ein eigenes Projekt anlegen, kein bestehendes Projekt einer anderen Demo wiederverwenden.

## 2. Studio starten und veröffentlichen

```bash
cd studio
cp .env.example .env          # SANITY_STUDIO_PROJECT_ID=<Projekt-ID> eintragen
npm install
npx sanity login              # einmalig, öffnet den Browser
npm run dev                   # Studio lokal: http://localhost:3333
npm run deploy                # Studio bei Sanity hosten; Namen wählen, zum Beispiel «suwannaphum»
```

Danach ist das Studio unter `https://suwannaphum.sanity.studio` erreichbar. Diese Adresse bekommt das Restaurant.
Redaktorinnen und Redaktoren lädst du auf sanity.io/manage unter **Members** mit der Rolle **Editor** ein; sie melden sich mit
E-Mail an und brauchen kein GitHub-Konto.

## 3. Inhalte importieren

Der Import überträgt den Stand der Demo (Speisekarte, Buffet, Öffnungszeiten, Texte, Rechtstexte, Bilder) nach Sanity.

```bash
# im Projektstamm
npm run seed -- --probe       # Trockenlauf: prüft alles, schreibt nichts, braucht keinen Zugang
```

Für den echten Import auf sanity.io/manage unter **API → Tokens** ein Token mit der Berechtigung **Editor** anlegen und **nur lokal**
in `.env.local` eintragen (die Datei wird nicht committet):

```bash
SANITY_PROJECT_ID=<Projekt-ID>
SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=<Token>
```

```bash
set -a; source .env.local; set +a
npm run seed                  # legt fehlende Dokumente an, bestehende bleiben unangetastet
# npm run seed -- --force     # überschreibt bestehende Dokumente mit dem lokalen Stand (Vorsicht nach Redaktionsarbeit)
```

Danach das Token in Sanity **wieder löschen** und die Zeile aus `.env.local` entfernen. Im Studio prüfen, ob alles da ist
(21 Dokumente: Restaurant und Kontakt, Öffnungszeiten, 1 Hinweis, Mittagsbuffet, Speisekarte, 10 Kategorien, Texte, Startseite,
Restaurant und Team, Kontakt, Impressum, Datenschutzerklärung).

## 4. Lokal mit Sanity bauen

```bash
CONTENT_SOURCE=sanity SANITY_PROJECT_ID=<Projekt-ID> SANITY_DATASET=production npm run build:vercel
```

Der Befehl spiegelt zuerst die Bilder (`✓ … Bilder aus Sanity gespiegelt`) und baut dann. Bricht der Build ab, nennt die Meldung
das Dokument und das Feld (zum Beispiel «Sanity: Kategorien der Speisekarte – 3.gerichte.4.preis: Ein Gericht braucht einen
Preis …»). Im Studio korrigieren, veröffentlichen, erneut bauen. Anschliessend für die Demo wieder `npm run build` ausführen.

## 5. Vercel-Projekt (besteht seit dem 17. Oktober 2026)

Das Projekt `suwannaphum-restaurant-demo` liegt im Vercel-Konto `nick8952`, ist mit dem GitHub-Repository verbunden und baut bei
jedem Push auf `main` mit `npm run build:vercel` (aus `vercel.json`, Install `npm ci`). Produktionsadresse:
<https://suwannaphum-restaurant-demo.vercel.app>. Sie zeigt die Demo mit lokalen Inhalten, noindex und Entwurfshinweis; es sind
**keine Umgebungsvariablen** gesetzt. Angelegt wurde es mit dem Vercel-CLI (`npx vercel login`, `npx vercel deploy --prod`); die
Git-Verbindung entstand dabei automatisch, weil die Vercel-GitHub-App für das Konto installiert ist.

Vercel liefert **nicht den Ordner `out/`** aus, sondern die Build-Ausgabe von Next. Deshalb entsteht alles, was auf beiden Zielen
gleich sein muss, vor `next build` in `public/` (Sitemap: `scripts/sitemap-schreiben.mts`, nur mit `INDEXIERUNG=1`); `out/404.html`
und `.nojekyll` braucht nur GitHub Pages. Unbekannte Adressen beantwortet Vercel von selbst mit der gestalteten Fehlerseite,
`/kontakt` ohne Schrägstrich leitet mit 308 auf `/kontakt/` weiter.

Für den Umstieg auf Sanity:

1. Das Repository ist bereits verbunden; nichts neu importieren.
2. Unter **Settings → Environment Variables** für *Production* (und *Preview*) eintragen:

   | Variable | Wert |
   | --- | --- |
   | `CONTENT_SOURCE` | `sanity` |
   | `SANITY_PROJECT_ID` | Projekt-ID |
   | `SANITY_DATASET` | `production` |
   | `SITE_URL` | zunächst leer (Standard `https://suwannaphum-restaurant-demo.vercel.app`), später die Kundendomain |
   | `INDEXIERUNG` | leer lassen, bis zum Go-Live |

   `DEPLOY_TARGET` setzt der Build-Befehl selbst. **Kein Token eintragen**, solange das Dataset öffentlich ist. Eine leere
   `SITE_URL` ist erlaubt; ein falscher Wert bricht den Build mit einer klaren Meldung ab.
3. Unter **Deployments** den letzten Stand neu bauen (**Redeploy**) und die Vercel-Adresse prüfen: Startseite, `/speisekarte/` direkt
   aufrufen, neu laden, eine falsche Adresse (404). Lokal dasselbe mit `BASE=https://suwannaphum-restaurant-demo.vercel.app npm run qa`.

Bekannte Falle aus früheren Demos: `vercel deploy --temporary` (anonymer Testmodus) liefert bei statischen Exporten 404; immer
mit angemeldetem Konto oder über die Git-Verbindung veröffentlichen.

## 6. Veröffentlichen löst einen Build aus

1. In Vercel unter **Settings → Git → Deploy Hooks** einen Hook anlegen (Name «Sanity», Branch `main`). Die Adresse kopieren.
   Sie wirkt wie ein Passwort: nicht ins Repository, nicht in Chats.
2. Auf sanity.io/manage unter **API → Webhooks** einen Webhook anlegen: URL = Adresse des Deploy-Hooks, Dataset `production`,
   Trigger **Create, Update, Delete**, Filter leer (oder `!(_id in path("drafts.**"))`), Methode **POST**.
3. Probe: Im Studio einen Preis ändern und **veröffentlichen**. In Vercel erscheint unter **Deployments** ein neuer Build; nach ein
   bis drei Minuten steht der neue Preis auf der Website. Wenn nichts passiert: in Sanity beim Webhook das **Attempts log** ansehen.
4. Damit Hinweise pünktlich erscheinen und die Anzeige «Heute» im statischen Stand frisch bleibt, in Vercel zusätzlich einen
   täglichen Aufruf des Deploy-Hooks einrichten (zum Beispiel über **Settings → Cron Jobs** mit einem kleinen Aufruf oder über
   einen externen Zeitplaner). Ohne das wirkt der clientseitige Datumsabgleich nur für bereits erfasste Hinweise.

## 7. Go-Live auf der Kundendomain

Erst wenn das Restaurant die Inhalte freigegeben hat:

1. `npm run inhalt:pruefen -- --live` listet, was noch offen ist: nicht bestätigte Angaben (Kontakt, Öffnungszeiten, Buffet,
   Speisekarte, Lieferdienste, Hinweise, Seitentexte), vorläufige Übersetzungen, das Impressum und die Datenschutzerklärung der
   Demo. Alle Punkte aus `docs/UEBERGABE.md` klären.
2. **Impressum und Datenschutzerklärung neu schreiben** (Verantwortliches ist dann das Restaurant; Hosting Vercel; Sanity als
   Auftragsbearbeiter für die Redaktion). Solange das Wort «Demo» in den Rechtstexten steht, lässt sich die Website nicht freigeben.
3. Im Studio bei jedem Dokument die Freigabe auf «Live» stellen und bei den Thai Specials «Übersetzung vorläufig» ausschalten.
4. In Vercel die Domain verbinden (**Settings → Domains**) und die Variablen setzen: `SITE_URL=https://www.<domain>` und
   `INDEXIERUNG=1`. Neu bauen. Jetzt verschwinden `noindex` und der Entwurfshinweis, die Sitemap und die strukturierten Daten
   (Typ `Restaurant`) entstehen; Öffnungszeiten erscheinen darin nur mit Freigabe «Live».
5. Prüfen: `https://www.<domain>/robots.txt` nennt die Sitemap, der Seitenquelltext enthält kein `noindex` mehr, die Canonical-
   Adressen zeigen auf die Kundendomain.
6. Die GitHub-Pages-Demo abschalten (Repository-Einstellungen → Pages) oder das Repository auf privat stellen. Die bestehende
   Website `suwannaphum.ch` und ihre Domain bis dahin nicht anfassen; die Umstellung der Domain macht der Hoster des Restaurants.

Der Build schützt vor Versehen. Er bricht ab, wenn `INDEXIERUNG=1` ohne `SITE_URL` gesetzt ist, `SITE_URL` auf eine
Vorschau-Adresse zeigt (`github.io`, `vercel.app`, `localhost`), `SITE_URL` mit dem Unterpfad der Demo kombiniert wird oder bei
einer echten Domain noch etwas nicht freigegeben ist. Zum Ausprobieren ohne Freigaben dient eine reservierte Testdomain:
`INDEXIERUNG=1 SITE_URL=https://www.example.com npm run build:vercel`.

`noindex` ist kein Zugangsschutz. Wer den Link zur Demo kennt, kann sie lesen.

## Was diese Vorbereitung nicht kann

- Keine Vorschau unveröffentlichter Entwürfe auf der Website. Entwürfe sieht man nur im Studio.
- Keine sofortige Veröffentlichung: immer erst nach dem Build.
- Keine Online-Reservation, kein Bestellsystem, keine Karte, keine Analyse. Jeder neue Dienst braucht Entwicklung und
  gegebenenfalls eine Einwilligungskategorie (`texte.einwilligung.kategorien`) plus eine Ergänzung der Datenschutzerklärung.

## Geprüft, ohne dass ein Projekt existiert

- Studio: Typprüfung und `sanity schema validate` (0 Fehler, 0 Warnungen)
- Import: Trockenlauf baut 21 Dokumente und vergleicht sie nach dem Zurücklesen mit den lokalen Inhalten
- Bild-Spiegel: Selbsttest mit einer lokalen Datei (`npx tsx scripts/sanity-bilder.mts --probe assets/originale/gericht-tom-kha-gai.jpg`)
- Website: Probe-Build mit `DEPLOY_TARGET=vercel`, `INDEXIERUNG=1` und einer Testdomain; Export-Prüfung grün

Nicht geprüft werden konnte, weil kein Projekt existiert: der echte Import, das Herunterladen der Bilder, ein Build mit
`CONTENT_SOURCE=sanity`, der Webhook. Beim ersten Durchlauf deshalb Schritt 4 nicht überspringen.

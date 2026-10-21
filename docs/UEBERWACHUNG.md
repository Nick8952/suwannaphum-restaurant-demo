# Überwachung und Alarm

Drei Schichten, von innen nach aussen. Die erste ist eingerichtet, die beiden anderen brauchen Nicks Konten.

## 1. Eingerichtet: Prüfung alle 30 Minuten aus GitHub Actions

`.github/workflows/ueberwachung.yml` führt `werkzeuge/ueberwachung.mjs` gegen <https://www.suwannaphum.ch> aus: Startseite,
Speisekarte, Kontakt, Impressum (Status 200, Antwortzeit, keine Sperrseite, Titel, `index, follow`, Canonical, strukturierte Daten,
kein Entwurfshinweis, Telefonlink, UID), Sitemap und robots.txt, Weiterleitung der nackten Domain, gestaltete 404-Seite,
TLS-Zertifikat mit mindestens 14 Tagen Restlaufzeit. 26 Prüfungen, unter zehn Anfragen je Lauf.

- **Alarm:** Schlägt etwas fehl, entsteht im Repository ein Issue «Website-Alarm: www.suwannaphum.ch» (Label `ueberwachung`) mit
  den Befunden und dem Protokoll; weitere Fehlläufe kommentieren dasselbe Issue. GitHub schickt dazu eine E-Mail an Nick.
  Voraussetzung: in GitHub unter **Settings → Notifications** sind E-Mails für Issues und für fehlgeschlagene Actions aktiv.
- **Von Hand:** Reiter **Actions → Überwachung → Run workflow**, oder lokal `node werkzeuge/ueberwachung.mjs`.
- **Grenzen:** GitHub führt geplante Läufe mit einigen Minuten Verzögerung aus und schaltet sie nach 60 Tagen ohne Commit ab
  (dann unter Actions wieder einschalten oder einen kleinen Commit pushen). Ein Ausfall von wenigen Minuten zwischen zwei Läufen
  bleibt unbemerkt; dafür ist Schicht 2 da.
- **Nach einem Alarm:** Website im Browser öffnen · <https://www.vercel-status.com> · `npx vercel ls` (ist das letzte Deployment
  «Ready»?) · bei kaputtem Deployment aus dem Projektordner `npx vercel deploy --prod --yes` · zeigt die Domain nicht mehr auf
  Vercel, DNS bei webland.ch prüfen (A-Record `216.198.79.65` und CNAME `www` auf Vercel) · Issue schliessen, wenn behoben.

## 2. Empfohlen: externer Uptime-Dienst (5 Minuten)

Ein Dienst ausserhalb von GitHub und Vercel, der die Startseite alle 1 bis 5 Minuten aufruft und bei Ausfall sofort meldet.
Kostenlos ausreichend: **UptimeRobot** (50 Monitore, 5-Minuten-Takt, E-Mail) oder **Better Stack** (10 Monitore, 3-Minuten-Takt,
E-Mail, Telefon-App, prüft auch das Zertifikat). Einrichten:

1. Konto anlegen, Monitor «HTTP(S)» auf `https://www.suwannaphum.ch/`, Intervall 5 Minuten.
2. Schlüsselwort-Prüfung aktivieren: Seite muss «Suwannaphum» enthalten (so fällt auch eine Sperr- oder Fehlerseite mit Status 200 auf).
3. Alarmkanal: E-Mail, zusätzlich Push über die App oder Telegram. SMS kostet.
4. Zweiter Monitor auf `https://suwannaphum.ch/` (Weiterleitung) ist optional.

## 3. Konten, die von selbst melden

- **Vercel:** schickt bei jedem fehlgeschlagenen Build eine E-Mail an holzbechernick@gmail.com. Unter **Account Settings →
  Notifications** prüfen, dass «Deployment failed» aktiv ist. Vercel-Störungen: <https://www.vercel-status.com> abonnieren.
- **Google Search Console:** Domain `suwannaphum.ch` bestätigen (DNS-Eintrag bei webland.ch), Sitemap
  `https://www.suwannaphum.ch/sitemap.xml` einreichen. Google meldet per E-Mail Indexierungsprobleme, Sicherheitsprobleme und
  manuelle Massnahmen. Das ist der einzige Alarm für «Website verschwindet aus Google».
- **Registrar (webland.ch):** Erinnerungen zur Domain-Verlängerung an die eingetragene E-Mail; Ablauf der Domain ist der häufigste
  Totalausfall kleiner Websites. Erneuerungsdatum im Kalender eintragen.
- **GitHub:** Dependabot-Hinweise zu Abhängigkeiten kommen per E-Mail; sie betreffen die Build-Werkzeuge, nicht die ausgelieferte
  statische Website, und sind nicht dringend.

## Was die Überwachung nicht sieht

Inhaltliche Fehler (falscher Preis, alte Öffnungszeiten), Darstellungsfehler in einzelnen Browsern, langsame Ladezeiten für
Besucherinnen und Besucher in anderen Regionen. Dafür einmal im Quartal `BASE=https://suwannaphum-restaurant-demo.vercel.app npm run qa`
und Lighthouse (`BASE=https://www.suwannaphum.ch SEITEN=/ node werkzeuge/qa/lighthouse.mjs`) laufen lassen.

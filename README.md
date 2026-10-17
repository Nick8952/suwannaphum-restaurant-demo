# Thai Restaurant Suwannaphum: Website-Demo

Verkaufs-Demo einer neuen Website für das Thai Restaurant Suwannaphum, Zürcherstrasse 31, 8952 Schlieren. Dies ist **nicht** die
offizielle Website des Restaurants; Betreiber der Demo ist Nick Holzbecher.

- Live-Demo für den Kunden: <https://suwannaphum-restaurant-demo.vercel.app> (Vercel, Entwurf, noindex)
- Zweite Veröffentlichung: <https://nick8952.github.io/suwannaphum-restaurant-demo/> (GitHub Pages, Entwurf, noindex)
- Technik: Next.js 16, TypeScript, Tailwind CSS v4, statischer Export auf GitHub Pages; Sanity und Vercel vorbereitet
- Anleitung für Entwicklung und Regeln: `CLAUDE.md` · Inhalte pflegen: `docs/INHALTE-PFLEGEN.md` · Sanity/Vercel: `docs/SANITY-VERCEL-EINRICHTUNG.md`

```bash
npm ci
npm run dev                      # http://localhost:3000/suwannaphum-restaurant-demo/
npm run pruefen && npm run build && npm run export:pruefen
npm run vorschau:pages           # Export wie auf GitHub Pages, dann: npm run qa
```

Alle Inhalte stammen von der bisherigen Website des Restaurants (Stand 16. Oktober 2026, `docs/INHALTSMATRIX.md`); Bilder sind
Originale des Restaurants, Nutzung vorbehaltlich Freigabe (`docs/BILDER.md`). Offene Fragen und Freigaben: `docs/UEBERGABE.md`.

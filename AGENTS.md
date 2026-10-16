# Suwannaphum-Demo: Anweisungen für Codex

Dieselben Regeln wie in `CLAUDE.md` (bitte zuerst lesen). Zusätzlich für Codex:

- Prüfungen nur lesend (`--sandbox read-only`), keine Rückdelegation an Claude.
- Vor Änderungen `docs/UEBERGABE.md` (offene Punkte) und `docs/ENTSCHEIDUNGEN.md` lesen.
- Prüfreihenfolge: `npm run pruefen` → `npm run seed -- --probe` → `npm run build` → `npm run export:pruefen` → Vorschau-Server + `npm run qa`.
- Übergeordnete Regeln aus `../AGENTS.md` und `../CLAUDE.md` (Workspace, Obsidian-Brain) gelten zusätzlich.

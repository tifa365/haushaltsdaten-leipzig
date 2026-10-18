# Leipzig Haushaltsdaten – Dataviz

![Data visualization of Leipzig's expenditures](/public/images/readme.png)

Interaktive Treemap-Visualisierung des **Leipziger Ergebnishaushalts**: Wofür gibt die Stadt Leipzig ihr Geld aus? Die ordentlichen Aufwendungen werden nach elf Politikbereichen (A–K) und darunter nach Produkten dargestellt.

**Live:** https://tifa365.github.io/haushaltsdaten-leipzig/

Enthaltene Haushaltsjahre:

| Jahre | Quelle | Status |
|---|---|---|
| 2025, 2026 | [Ergebnishaushalt 2025/2026](https://opendata.leipzig.de/dataset/ergebnishaushalt-2025-2026) | beschlossen (Stand 25.06.2025) |
| 2027, 2028 | [Entwurf Ergebnishaushalt 2027/28](https://opendata.leipzig.de/de/dataset/doppelhaushalt-2027-2028-unterlagen-und-datensatze-auf-einen-blick) | **Entwurf** der Verwaltung (Stand 02.09.2026), vom Stadtrat noch nicht beschlossen |

> **Hinweis:** Prototyp, kein Angebot der Stadt Leipzig. Dieses Projekt baut auf dem Prototyp [„Berliner Haushaltsdaten“](https://github.com/berlin/haushaltsdaten) der Technologiestiftung Berlin / ODIS auf (MIT-Lizenz) und wurde für Leipzig angepasst: statische JSON-Daten statt Datenbank, Leipziger Produktstruktur statt Berliner Einzelplänen, statischer Export für GitHub Pages.

## Was zeigt die Visualisierung?

- Eine [Treemap](https://de.wikipedia.org/wiki/Treemap), in die man per Klick hineinzoomt: Politikbereich → Produkt → Kostenarten.
- Darunter eine Liste der größten Ausgaben der aktuellen Auswahl (Politikbereich, Jahr, gezoomter Knoten).
- Jede Ansicht hat eine eigene URL (_Teilen_-Symbol): `year`, `view` (`treemap` oder `bars`) und `node` (geöffnete Ebene, z. B. `node=C/3112`; die erste Stufe ist der Politikbereich A–K, der auch im Dropdown erscheint). Standardwerte werden weggelassen, Beispiel: `/visualisierung/?view=bars&node=C`. Die geöffnete Ebene steht nur im geteilten Link: Nach dem Öffnen wird `node` aus der Adresszeile entfernt, ein Neuladen oder späterer Besuch beginnt wieder bei der Gesamtansicht.
- Die Grafik kann per _Einbetten_-Symbol als `<iframe>` in andere Seiten eingebunden werden (`/share/` mit denselben Parametern).
- Startseite und Info-Seite (FAQ) liefern Kontext zum Haushalt.

## Die Daten

Grundlage sind die Excel-Dateien des Ergebnishaushalts aus dem [Open-Data-Portal der Stadt Leipzig](https://opendata.leipzig.de). Verarbeitet werden nur Zeilen mit

- `Zuordnung_Kostenart.Ebene` = „2 ordentliche Aufwendungen“ (Ausgaben, keine Erträge),
- `Objektart` = `PR` (Produktebene, verhindert Doppelzählung).

Die ersten beiden Ziffern des Produktcodes (`Zielstruktur.PC`) bestimmen den Politikbereich (Mapping in `scripts/process-leipzig-data.js`).

Pipeline (reines Node.js, keine Datenbank):

```
daten/*.xlsx  ──(data:download)──>  Excel-Dateien von opendata.leipzig.de
      │
      ▼ npm run data:process
src/data/leipzig-budget-data.json          (Zwischenformat, alle Quellen)
      │
      ▼ npm run data:generate
public/data/{2025,2026,2027,2028}/          summary.json, treemap.json, list.json, blocks/*.json
public/data/meta.json                       Jahre, Default-Jahr, Status/Stand je Jahr
```

Die generierten JSON-Dateien sind im Repository eingecheckt, damit Deployments ohne Excel-Dateien auskommen und jede Datenänderung per Git nachvollziehbar ist.

### Neue Haushaltsdaten einspielen

1. Quelle in `scripts/data-sources.js` eintragen (Download-URL, Sheet-Name, Spaltenzuordnung, Jahre, Status).
2. Jahre in `src/lib/utils/yearValidator/index.ts` ergänzen (`VALID_YEARS`, `DRAFT_YEARS`, `YEAR_INFO`, ggf. `DEFAULT_YEAR`).
3. `npm run data:build` ausführen – lädt die Dateien nach `daten/` (gitignored), prüft die Summen je Jahr und schreibt `public/data/`.
4. Texte auf Start- und Info-Seite anpassen, Änderungen committen.

Die Excel-Dateien unterscheiden sich von Haushalt zu Haushalt leicht (2025/26: Sheet `Grunddaten`, 2027/28: Sheet `Rohdaten` mit umbenannten Spalten). Deshalb beschreibt jede Quelle ihre Spalten selbst; der Verarbeitungsschritt bleibt gleich.

## Entwicklung

Voraussetzung: Node.js gemäß `.nvmrc` (`nvm use`).

```bash
git clone git@github.com:tifa365/haushaltsdaten-leipzig.git
cd haushaltsdaten-leipzig
npm install
npm run dev          # http://localhost:3000
```

Weitere Befehle:

```bash
npm run data:build   # Excel laden, verarbeiten, public/data erzeugen
npm run build        # statischer Export nach out/ (next build && next export)
npm run lint && npm run type-check && npm run test:ci
```

### Tech-Stack

Next.js 12 (Pages Router, statischer Export), React, TypeScript, Tailwind CSS, D3 (Treemap), Jest + React Testing Library, ESLint/Prettier, Husky.

### Projektstruktur

- `pages/index.tsx` – Startseite
- `pages/visualisierung.tsx` – Treemap + Liste; lädt `public/data/{year}/treemap.json` und `list.json` im Browser (`src/lib/hooks/useBudgetData`)
- `pages/share.tsx` – nur die Treemap, zum Einbetten
- `pages/faq.tsx` – Fragen und Antworten
- `src/components/TreeMap/` – D3-Treemap
- `src/components/TreeMapControls/` – Filter (Politikbereich, Jahr)
- `src/lib/utils/yearValidator/` – verfügbare Jahre, Default, Entwurf-Kennzeichnung
- `src/lib/utils/basePath.ts` – Pfad-Präfix für Hosting unter einem Unterverzeichnis
- `scripts/` – Datenpipeline (siehe oben), Details in `docs/STATIC-DATA-ARCHITECTURE.md`

## Deployment

**GitHub Pages:** `.github/workflows/deploy.yml` baut bei jedem Push auf `main` den statischen Export und veröffentlicht `out/`. Der Pfad-Präfix wird aus dem Repository-Namen abgeleitet (`NEXT_PUBLIC_BASE_PATH=/<repo>`), das Workflow-File funktioniert daher unverändert in Forks. Einmalig in den Repository-Einstellungen unter _Pages_ die Quelle „GitHub Actions“ wählen.

**Netlify / andere statische Hoster:** `npm run build` und den Ordner `out/` veröffentlichen (`netlify.toml` liegt bei). Ohne Unterverzeichnis `NEXT_PUBLIC_BASE_PATH` leer lassen.

## Mitmachen

Issues und Pull Requests sind willkommen: https://github.com/tifa365/haushaltsdaten-leipzig. Die Leipzig-Anpassung entstand im Umfeld von [Code for Leipzig](https://codefor.de/leipzig/); eine Kopie liegt unter [CodeforLeipzig/haushaltsdaten_leipzig](https://github.com/CodeforLeipzig/haushaltsdaten_leipzig).

## Lizenz und Credits

MIT-Lizenz, siehe [LICENSE](LICENSE). Der ursprüngliche Prototyp „Berliner Haushaltsdaten“ wurde von der [Technologiestiftung Berlin](https://www.technologiestiftung-berlin.de/) (ODIS / CityLAB Berlin) entwickelt; die Mitwirkenden sind im [Original-Repository](https://github.com/berlin/haushaltsdaten#contributors) aufgeführt.

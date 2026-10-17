# Static Data Architecture

## Overview

This project uses **static JSON files** instead of a database:

- Zero configuration: no `.env`, no credentials
- Reproducibility: a Git commit is an exact dataset
- Performance: CDN-served, cacheable files
- Zero hosting cost: works on GitHub Pages, Netlify, any static host
- Audit trail: every data change is a reviewable diff

## Data Flow

```
scripts/data-sources.js            one entry per Doppelhaushalt (URL, sheet, column accessors, years, status)
        │
        ▼  npm run data:download   (scripts/download-data.js, skips existing files, --force to refresh)
daten/*.xlsx                       raw Excel files from opendata.leipzig.de (gitignored)
        │
        ▼  npm run data:process    (scripts/process-leipzig-data.js)
src/data/leipzig-budget-data.json  intermediate: { metadata, sources: [{ years, totals, aggregated, items }] }
        │
        ▼  npm run data:generate   (scripts/generate-static-json.js)
public/data/{year}/*.json          served as-is; fetched by the browser via src/lib/hooks/useBudgetData
public/data/meta.json
```

`npm run data:build` runs all three steps.

## File Structure

```
public/data/
├── meta.json                 years, defaultYear, yearInfo[year] = { status, label, stand, sourceUrl, total, ... }
├── 2025/
│   ├── summary.json          totals and per-block shares (~3 KB)
│   ├── treemap.json          hierarchy root → block (A-K) → product → cost types (~1.5 MB)
│   ├── list.json             flat list of all product/cost-type rows, sorted by amount (~2.5 MB)
│   └── blocks/               one file per policy block with its products
├── 2026/ … 2027/ … 2028/     same structure
```

Only the **leaves** of `treemap.json` are summed by the D3 treemap; blocks and products also carry a precomputed `value` for display, which the component must not add again (see `src/components/TreeMap/index.tsx`).

## Processing rules (scripts/process-leipzig-data.js)

1. Keep rows whose `Zuordnung_Kostenart.Ebene` contains `2 ordentliche Aufwendungen` (expenses only). Rows with an empty Ebene (cost types missing in the mapping sheet of the Excel file) are counted and reported, then skipped.
2. Keep rows with `Objektart = PR` (product level) to avoid double counting object-level rows.
3. Map the first two digits of `Zielstruktur.PC` to a policy block A–K (`MAPPING`). Unmapped prefixes are reported.
4. Read one amount per year from the source's `plan(row, year)` accessor.
5. Aggregate per block and validate that block sums equal the overall sum for every year; the script exits non-zero on mismatch.

## Adding a new Doppelhaushalt

1. Add an entry to `scripts/data-sources.js`. Inspect the Excel file first: sheet name and column headers differ between publications (2025/26: `Grunddaten`, `PCBeschreibung`, `Amt`, `KostenartBeschreibung`; 2027/28: `Rohdaten`, `Zielstruktur.PC Bezeichnung`, `Zielstruktur.Amt` + `… Bezeichnung`, `Kostenart` + `Kostenart Beschreibung`). Compose values so that the output format stays `"<code> - <name>"`.
2. Extend `VALID_YEARS`, `DRAFT_YEARS`, `YEAR_INFO` (and `DEFAULT_YEAR` if desired) in `src/lib/utils/yearValidator/index.ts`.
3. Run `npm run data:build`, check the printed totals against the official figures, run `npm run dev`.
4. Update the texts on the start page and FAQ, commit `public/data/` and `src/data/leipzig-budget-data.json`.

## Hosting below a sub-path

Routes handled by `next/link` get the `basePath` automatically. Everything else (`fetch`, `<img>`, `<link>`, `<iframe>`) must use `withBasePath()` / `dataUrl()` from `src/lib/utils/basePath.ts`. Set `NEXT_PUBLIC_BASE_PATH=/<repo>` at build time (the GitHub Pages workflow does this from the repository name).

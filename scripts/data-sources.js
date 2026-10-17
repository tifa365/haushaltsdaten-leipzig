/**
 * Data sources for the Leipzig Ergebnishaushalt.
 *
 * One entry per Doppelhaushalt. Each Excel file from opendata.leipzig.de uses a
 * slightly different sheet name and column layout, so every source declares
 * accessor functions that map a raw row to the fields the pipeline needs.
 *
 * Adding a new budget = adding one entry here + running `npm run data:build`.
 */

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());

const SOURCES = [
  {
    id: '2025_2026',
    label: 'Doppelhaushalt 2025/26',
    status: 'beschlossen', // adopted by Stadtrat, approved by Landesdirektion Sachsen (Sept 2025)
    stand: '2025-06-25',
    years: [2025, 2026],
    file: 'ergebnishaushalt-2025_2026.xlsx',
    url: 'https://opendata.leipzig.de/dataset/60b36fac-bb59-437c-ba18-9d4d1e395ccc/resource/aba9fb3b-3dfb-42ba-9144-913f6658bb83/download/ergebnishaushalt-2025_2026.xlsx',
    portalUrl: 'https://opendata.leipzig.de/dataset/ergebnishaushalt-2025-2026',
    sheet: 'Grunddaten',
    columns: {
      ebene: (row) => str(row['Zuordnung_Kostenart.Ebene']),
      position: (row) => str(row['Zuordnung_Kostenart.Position']),
      objektart: (row) => str(row['Objektart']),
      productCode: (row) => str(row['Zielstruktur.PC']),
      productDescription: (row) => str(row['PCBeschreibung']),
      amt: (row) => str(row['Amt']), // already "50 - Sozialamt"
      teilhaushalt: (row) => str(row['Zielstruktur.Teilhaushalt Bezeichnung']),
      accountDescription: (row) => str(row['KostenartBeschreibung']), // already "401110 - Beamtenbezüge"
      plan: (row, year) => row[`Plan ${year}`],
    },
  },
  {
    id: '2027_2028',
    label: 'Entwurf Doppelhaushalt 2027/28',
    status: 'entwurf', // draft introduced to Stadtrat on 2026-09-02, vote planned Dec 2026
    stand: '2026-09-02',
    years: [2027, 2028],
    file: 'ergebnishaushalt_27_28_final.xlsx',
    url: 'https://opendata.leipzig.de/dataset/e48db0b9-a78f-4684-897d-390ac568773e/resource/87b13915-8a50-4cbd-8af6-921aeea54baf/download/ergebnishaushalt_27_28_final.xlsx',
    portalUrl: 'https://opendata.leipzig.de/de/dataset/doppelhaushalt-2027-2028-unterlagen-und-datensatze-auf-einen-blick',
    sheet: 'Rohdaten',
    columns: {
      ebene: (row) => str(row['Zuordnung_Kostenart.Ebene']),
      position: (row) => str(row['Zuordnung_Kostenart.Position']),
      objektart: (row) => str(row['Objektart']),
      productCode: (row) => str(row['Zielstruktur.PC']),
      productDescription: (row) => str(row['Zielstruktur.PC Bezeichnung']),
      // Compose "98 - Allg. Finanzwirtschaft" to match the 2025/26 format
      amt: (row) =>
        [str(row['Zielstruktur.Amt']), str(row['Zielstruktur.Amt Bezeichnung'])]
          .filter(Boolean)
          .join(' - '),
      teilhaushalt: (row) => str(row['Zielstruktur.Teilhaushalt Bezeichnung']),
      // Compose "30110000 - Grundsteuer A" to match the 2025/26 format
      accountDescription: (row) =>
        [str(row['Kostenart']), str(row['Kostenart Beschreibung'])]
          .filter(Boolean)
          .join(' - '),
      plan: (row, year) => row[`Plan ${year}`],
    },
  },
];

const ALL_YEARS = SOURCES.flatMap((s) => s.years).sort();
const DEFAULT_YEAR = 2027;

module.exports = { SOURCES, ALL_YEARS, DEFAULT_YEAR };

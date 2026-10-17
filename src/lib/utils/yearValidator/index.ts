/**
 * Years available in public/data/{year}/ (see scripts/data-sources.js).
 * Keep in sync with public/data/meta.json after running `npm run data:build`.
 */
export const VALID_YEARS = [2025, 2026, 2027, 2028]

export const DEFAULT_YEAR = 2027

/** Years that stem from a Haushaltsplan*entwurf* (draft), not an adopted budget. */
export const DRAFT_YEARS = [2027, 2028]

export const YEAR_INFO: Record<
  number,
  { label: string; budget: string; stand: string; isDraft: boolean }
> = {
  2025: {
    label: '2025',
    budget: 'Doppelhaushalt 2025/26',
    stand: '25.06.2025',
    isDraft: false,
  },
  2026: {
    label: '2026',
    budget: 'Doppelhaushalt 2025/26',
    stand: '25.06.2025',
    isDraft: false,
  },
  2027: {
    label: '2027 (Entwurf)',
    budget: 'Entwurf Doppelhaushalt 2027/28',
    stand: '02.09.2026',
    isDraft: true,
  },
  2028: {
    label: '2028 (Entwurf)',
    budget: 'Entwurf Doppelhaushalt 2027/28',
    stand: '02.09.2026',
    isDraft: true,
  },
}

export const isValidYear = (yearToCheck: number): boolean =>
  VALID_YEARS.includes(yearToCheck)

export const isDraftYear = (yearToCheck: number): boolean =>
  DRAFT_YEARS.includes(yearToCheck)

export const getYearLabel = (year: number): string =>
  YEAR_INFO[year]?.label ?? `${year}`

import { ListBox } from '@components/ListBox'
// import { ToggleSwitch } from '@components/Toggle'
import { policyAreas } from '@data/policyAreas'
import { mapRawQueryToState, ParsedPageQueryType } from '@lib/utils/queryUtil'
import {
  DEFAULT_YEAR,
  VALID_YEARS,
  getYearLabel,
} from '@lib/utils/yearValidator'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { FC } from 'react'
// import { InternalLink } from '@components/InternalLink'
import { isValidYear } from '@lib/utils/yearValidator'

export type TreeMapControlsPropType = Partial<ParsedPageQueryType> & {
  onChange: (newQuery: Partial<ParsedPageQueryType>) => void
}

const Separator: FC = () => <span className="h-10 w-[1px] bg-gray-200" />

const TreemapIcon: FC = () => (
  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current" aria-hidden>
    <rect x="0" y="0" width="8" height="14" rx="1" />
    <rect x="9" y="0" width="5" height="6" rx="1" />
    <rect x="9" y="8" width="5" height="6" rx="1" />
  </svg>
)

const BarsIcon: FC = () => (
  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current" aria-hidden>
    <rect x="0" y="1" width="14" height="3" rx="1" />
    <rect x="0" y="5.5" width="9" height="3" rx="1" />
    <rect x="0" y="10" width="5" height="3" rx="1" />
  </svg>
)

const VIEW_OPTIONS: { id: 'treemap' | 'bars'; label: string; Icon: FC }[] = [
  { id: 'treemap', label: 'Treemap', Icon: TreemapIcon },
  { id: 'bars', label: 'Balken', Icon: BarsIcon },
]

export const TreeMapControls: FC<TreeMapControlsPropType> = ({
  district,
  onChange,
}) => {
  const { query } = useRouter()
  let { year } = query
  if (year === undefined) {
    year = `${DEFAULT_YEAR}`
  } else if (Array.isArray(year)) {
    year = `${DEFAULT_YEAR}`
  } else if (!isNaN(parseInt(year)) && !isValidYear(parseInt(year))) {
    year = `${DEFAULT_YEAR}`
  }
  const mappedQuery = mapRawQueryToState(query)
  const view = mappedQuery.view === 'bars' ? 'bars' : 'treemap'

  // Policy areas: A-K plus "all" option
  const mappedPolicyAreas = [
    { id: 'all', name: 'Alle Politikbereiche' },
    ...Object.keys(policyAreas)
      .sort()
      .map((key) => ({
        id: key,
        name: policyAreas[key as keyof typeof policyAreas] || ' ',
      })),
  ]
  const foundPolicyArea = mappedPolicyAreas.find(({ id }) => id === district)

  return (
    <div className="w-full">
      <nav
        aria-label="Navigation der Visualisierung"
        className={classNames(
          'w-full',
          'sm:flex gap-6 justify-between items-center'
        )}
      >
        <div
          className={classNames(
            'w-full sm:w-auto',
            'grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr,auto,auto] gap-y-3 sm:gap-x-2 md:gap-x-6 pr-4'
          )}
        >
          <ListBox
            selected={foundPolicyArea}
            onChange={(policyArea) =>
              onChange({
                ...mappedQuery,
                district: `${policyArea}` as ParsedPageQueryType['district'],
              })
            }
            options={mappedPolicyAreas}
            additionalClasses="z-20"
          />
          <div className="hidden sm:inline-flex">
            <Separator />
          </div>
          <ListBox
            selected={{
              id: year,
              name: getYearLabel(parseInt(year)),
            }}
            onChange={(year) =>
              onChange({
                ...mappedQuery,
                year: year as number,
              })
            }
            options={VALID_YEARS.map((year) => ({
              id: `${year}`,
              name: getYearLabel(year),
            }))}
            additionalClasses="z-10"
          />
          <div className="hidden sm:inline-flex">
            <Separator />
          </div>
          <div
            role="group"
            aria-label="Darstellung"
            className="inline-flex rounded border border-gray-200 overflow-hidden self-center"
          >
            {VIEW_OPTIONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => onChange({ ...mappedQuery, view: id })}
                className={classNames(
                  'inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold',
                  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  view === id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

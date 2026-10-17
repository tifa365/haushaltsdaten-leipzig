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
            'grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-y-3 sm:gap-x-2 md:gap-x-6 pr-4'
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
        </div>
      </nav>
    </div>
  )
}

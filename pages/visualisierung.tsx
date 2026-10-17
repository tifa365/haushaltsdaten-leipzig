import { ListItem } from '@components/ListItem'
import { TreeMapWithData } from '@components/TreeMap/withData'
import { mapRawQueryToState } from '@lib/utils/queryUtil'
import { GetStaticProps } from 'next'
import { FC, useState, useEffect, useMemo } from 'react'
import useDimensions from 'react-cool-dimensions'
import { TreeMapControls } from '@components/TreeMapControls'
import classNames from 'classnames'
import { policyAreas, policyAreaColors, PolicyAreaKey } from '@data/policyAreas'
import { useRouter } from 'next/router'
import { EmbeddPopup } from '@components/EmbeddPopup'
import {
  DEFAULT_YEAR,
  isValidYear,
  isDraftYear,
  YEAR_INFO,
} from '@lib/utils/yearValidator'
import { Button } from '@components/Button'
import { useBudgetData } from '@lib/hooks/useBudgetData'
import { BudgetListItem } from '../src/types/budget'

const ALL_POLICY_AREAS = 'all'
const MAX_ROWS = 100

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: 'Visualisierung',
  },
})

/**
 * Filters the flat list by the node currently zoomed into in the treemap.
 * Depth 1 nodes are policy areas (label === group), depth 2 nodes are
 * products (label === title, both formatted as "Name (Code...)").
 */
const filterBySelectedNode = (
  items: BudgetListItem[],
  selectedNode: string | null
): BudgetListItem[] => {
  if (!selectedNode) return items
  const matches = items.filter(
    (item) => item.group === selectedNode || item.title === selectedNode
  )
  return matches.length > 0 ? matches : items
}

export const Visualization: FC = () => {
  const { observe, width, height } = useDimensions()
  const { push, pathname, query, isReady } = useRouter()

  const parsedQuery = mapRawQueryToState(query)
  const queriedPolicyArea: PolicyAreaKey | 'all' =
    parsedQuery.district && parsedQuery.district in policyAreas
      ? (parsedQuery.district as PolicyAreaKey)
      : ALL_POLICY_AREAS
  const queriedYear =
    parsedQuery.year && isValidYear(parsedQuery.year)
      ? parsedQuery.year
      : DEFAULT_YEAR
  const queriedView = parsedQuery.view === 'bars' ? 'bars' : 'treemap'

  const {
    treemap: hierarchyData,
    list: allItems,
    isLoading,
    error,
  } = useBudgetData(isReady ? queriedYear : null)

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [visibleRows, setVisibleRows] = useState<number>(MAX_ROWS)

  const listData = useMemo(() => {
    if (!allItems) return []
    const byArea =
      queriedPolicyArea !== ALL_POLICY_AREAS
        ? allItems.filter((item) => item.groupId === queriedPolicyArea)
        : allItems
    return filterBySelectedNode(byArea, selectedNode)
  }, [allItems, queriedPolicyArea, selectedNode])

  useEffect(() => {
    setVisibleRows(Math.min(MAX_ROWS, listData.length))
  }, [listData])

  const loadMoreRows = (): void => {
    const rowsToAdd = 10
    setVisibleRows(Math.min(visibleRows + rowsToAdd, listData.length))
  }

  const yearInfo = YEAR_INFO[queriedYear]

  return (
    <>
      <div className="min-h-screen pb-12">
        <div
          className={classNames(
            'w-full',
            'sticky top-0',
            'px-4 py-5 sm:py-4',
            'bg-white',
            'border-b border-gray-200 shadow-sm',
            'z-10'
          )}
        >
          <div
            className={classNames(
              'container mx-auto',
              'flex justify-between items-center'
            )}
          >
            <div className="w-full z-10">
              <TreeMapControls
                district={queriedPolicyArea}
                onChange={(newQuery) => {
                  // Clear selected node when filters change
                  setSelectedNode(null)
                  void push({ pathname, query: newQuery }, undefined, {
                    shallow: true,
                  })
                }}
              />
            </div>
            <div className="hidden lg:inline-flex">
              <EmbeddPopup />
            </div>
          </div>
        </div>
        {isDraftYear(queriedYear) && yearInfo && (
          <div className="px-4 mt-4">
            <p
              className="container mx-auto text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded px-4 py-2"
              role="note"
            >
              <strong>Entwurf:</strong> Die Zahlen für {queriedYear} stammen aus
              dem {yearInfo.budget} der Stadtverwaltung (Stand {yearInfo.stand}
              ). Der Stadtrat hat diesen Haushalt noch nicht beschlossen, die
              Beträge können sich daher noch ändern.
            </p>
          </div>
        )}
        <div className="px-4 mt-6">
          <div
            // The bar view can be taller than the box and scrolls. The gutter
            // is always reserved so the measured width does not change when
            // switching views (a width change would rebuild the treemap and
            // lose the current zoom level).
            className="container mx-auto w-full h-[80vh] overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
            ref={observe}
          >
            {error && (
              <p className="text-center py-12 text-red-700" role="alert">
                Die Daten für {queriedYear} konnten nicht geladen werden (
                {error}).
              </p>
            )}
            {!error && isLoading && (
              <p className="text-center py-12">Lädt...</p>
            )}
            {!error && !isLoading && hierarchyData && width && height && (
              <TreeMapWithData
                hierarchy={hierarchyData}
                width={width}
                height={height}
                view={queriedView}
                onChangeLevel={(level: { topicLabel?: string }) => {
                  const label = level.topicLabel || null
                  // Zooming back out to the root resets the list filter
                  setSelectedNode(
                    label && label !== hierarchyData.name ? label : null
                  )
                }}
              />
            )}
          </div>
          <div className="container mx-auto mt-4 flex justify-end lg:hidden">
            <EmbeddPopup />
          </div>
          <div className="container mx-auto">
            <h2 className="mb-6 mt-12 px-4 font-bold text-2xl">
              Höchste Ausgaben {queriedYear}
              {queriedPolicyArea !== ALL_POLICY_AREAS &&
                ` – ${policyAreas[queriedPolicyArea]}`}
            </h2>
            {isLoading ? (
              <div className="text-center py-12">Lädt...</div>
            ) : (
              <>
                <ul className="flex flex-col gap-4">
                  {listData.slice(0, visibleRows).map((item, index) => (
                    <ListItem
                      key={`${item.id}-${item.costType}-${index}`}
                      title={item.title}
                      id={item.id}
                      group={item.group}
                      groupColor={
                        policyAreaColors[item.groupId as PolicyAreaKey] ||
                        '#999999'
                      }
                      district={item.district}
                      price={item.amount}
                    />
                  ))}
                </ul>

                <div className="justify-center flex mt-8">
                  <Button
                    onClick={loadMoreRows}
                    disabled={visibleRows >= listData.length}
                  >
                    <span className="block">
                      Weitere Ausgaben anzeigen
                      <span className="font-normal text-xs block">
                        ({visibleRows}/{listData.length})
                      </span>
                    </span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Visualization

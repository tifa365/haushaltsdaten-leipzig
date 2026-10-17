import { ListItem } from '@components/ListItem'
import { TreeMapWithData } from '@components/TreeMap/withData'
import { mapRawQueryToState } from '@lib/utils/queryUtil'
import { GetStaticProps } from 'next'
import { FC, useState, useMemo, useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { ZOOM_TRANSITION_MS } from '@components/TreeMap'
import useDimensions from 'react-cool-dimensions'
import { TreeMapControls } from '@components/TreeMapControls'
import classNames from 'classnames'
import { policyAreas, policyAreaColors, PolicyAreaKey } from '@data/policyAreas'
import { useRouter } from 'next/router'
import { ShareLinks } from '@components/ShareLinks'
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
// Height of the treemap as a share of the viewport
const CHART_VIEWPORT_SHARE = 0.8

/**
 * Treemap height from the viewport. The container itself is not measured
 * so it can grow with the bar view (shown in full, the page scrolls).
 */
const useChartHeight = (): number => {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const update = (): void =>
      setHeight(Math.round(window.innerHeight * CHART_VIEWPORT_SHARE))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return height
}

/**
 * React updates triggered from inside a d3 click handler render
 * synchronously (outside React's own events) and would delay the start of
 * the zoom animation. The cheap URL update runs after the next frame; the
 * expensive list re-render (100+ rows) waits until the animation is over.
 */
const afterNextFrame = (fn: () => void): void => {
  window.requestAnimationFrame(() =>
    window.setTimeout(() => unstable_batchedUpdates(fn), 0)
  )
}

const afterZoomAnimation = (fn: () => void): void => {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  window.setTimeout(
    () => unstable_batchedUpdates(fn),
    reducedMotion ? 0 : ZOOM_TRANSITION_MS + 50
  )
}

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
  const { observe, width } = useDimensions()
  const height = useChartHeight()
  const { push, replace, pathname, query, isReady } = useRouter()

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
  // The policy area is the first level of the zoom path; a plain
  // ?district=B (older links) opens that area too
  const queriedNode =
    parsedQuery.node ||
    (queriedPolicyArea !== ALL_POLICY_AREAS ? queriedPolicyArea : null)

  const {
    treemap: hierarchyData,
    list: allItems,
    isLoading,
    isListLoading,
    error,
  } = useBudgetData(isReady ? queriedYear : null)

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  // "Weitere anzeigen" count, tied to the list it was requested for so a new
  // list starts at MAX_ROWS again without an extra render pass
  const [rowsFor, setRowsFor] = useState<{
    list: BudgetListItem[] | null
    rows: number
  }>({ list: null, rows: MAX_ROWS })

  const listData = useMemo(() => {
    if (!allItems) return []
    const byArea =
      queriedPolicyArea !== ALL_POLICY_AREAS
        ? allItems.filter((item) => item.groupId === queriedPolicyArea)
        : allItems
    return filterBySelectedNode(byArea, selectedNode)
  }, [allItems, queriedPolicyArea, selectedNode])

  const visibleRows = Math.min(
    rowsFor.list === listData ? rowsFor.rows : MAX_ROWS,
    listData.length
  )

  const loadMoreRows = (): void => {
    const rowsToAdd = 10
    setRowsFor({ list: listData, rows: visibleRows + rowsToAdd })
  }

  const yearInfo = YEAR_INFO[queriedYear]

  const shareLinks = (
    <ShareLinks
      state={{
        year: queriedYear,
        district: queriedPolicyArea,
        view: queriedView,
        node: queriedNode,
      }}
    />
  )

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
                  const district = newQuery.district ?? ALL_POLICY_AREAS
                  if (district !== queriedPolicyArea) {
                    // The dropdown zooms the chart into that policy area
                    // (the treemap animates when the node in the URL changes)
                    if (district === ALL_POLICY_AREAS) {
                      delete newQuery.node
                      delete newQuery.district
                    } else {
                      newQuery.node = district
                    }
                  }
                  // Year and view changes keep the opened level
                  void push({ pathname, query: newQuery }, undefined, {
                    shallow: true,
                  })
                }}
              />
            </div>
            <div className="hidden lg:inline-flex">{shareLinks}</div>
          </div>
        </div>
        {isDraftYear(queriedYear) && yearInfo && (
          <div className="px-4 mt-4">
            <p
              // "Sketch" look: dashed frame and a light hatch say "not final"
              className="container mx-auto flex items-start gap-3 text-sm text-gray-700 leading-relaxed border-2 border-dashed border-gray-400 rounded-lg px-4 py-3 bg-[repeating-linear-gradient(135deg,#fff_0_14px,#f9fafb_14px_28px)]"
              role="note"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                ✏️
              </span>
              <span>
                <span className="inline-block font-mono text-xs tracking-widest bg-gray-900 text-white rounded px-1.5 py-0.5 mr-2 align-text-bottom">
                  ENTWURF
                </span>
                Die Zahlen für {queriedYear} stammen aus dem {yearInfo.budget}{' '}
                der Stadtverwaltung (Stand {yearInfo.stand}). Der Stadtrat hat
                diesen Haushalt noch nicht beschlossen, die Beträge können sich
                daher noch ändern.
              </span>
            </p>
          </div>
        )}
        <div className="px-4 mt-6">
          <div
            // Grows with the bar view; only the width is measured here (a
            // width change rebuilds the treemap and loses the zoom level,
            // see html { scrollbar-gutter } in global.css)
            className="container mx-auto w-full"
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
                node={queriedNode}
                onChangeLevel={(level) => {
                  const label = level.topicLabel || null
                  const nodePath = level.nodePath || ''
                  const district = nodePath.split('/')[0] || ''
                  // Keep the opened level (and its policy area, shown in the
                  // dropdown) in the URL so the view can be shared
                  afterNextFrame(() => {
                    if (
                      nodePath === (queriedNode || '') &&
                      (district || ALL_POLICY_AREAS) === queriedPolicyArea
                    )
                      return
                    const nextQuery = { ...query }
                    if (nodePath) nextQuery.node = nodePath
                    else delete nextQuery.node
                    if (district) nextQuery.district = district
                    else delete nextQuery.district
                    void replace({ pathname, query: nextQuery }, undefined, {
                      shallow: true,
                    })
                  })
                  // Zooming back out to the root resets the list filter
                  afterZoomAnimation(() =>
                    setSelectedNode(
                      label && label !== hierarchyData.name ? label : null
                    )
                  )
                }}
              />
            )}
          </div>
          <div className="container mx-auto mt-4 flex justify-end lg:hidden">
            {shareLinks}
          </div>
          <div className="container mx-auto">
            <h2 className="mb-6 mt-12 px-4 font-bold text-2xl">
              Höchste Ausgaben {queriedYear}
              {queriedPolicyArea !== ALL_POLICY_AREAS &&
                ` – ${policyAreas[queriedPolicyArea]}`}
            </h2>
            {isListLoading ? (
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

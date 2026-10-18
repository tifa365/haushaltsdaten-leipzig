import { TreeMapWithData } from '@components/TreeMap/withData'
import { mapRawQueryToState } from '@lib/utils/queryUtil'
import { GetStaticProps } from 'next'
import { FC } from 'react'
import useDimensions from 'react-cool-dimensions'
import { useRouter } from 'next/router'
import { DEFAULT_YEAR, isValidYear } from '@lib/utils/yearValidator'
import { useBudgetData } from '@lib/hooks/useBudgetData'
import { withBasePath } from '@lib/utils/basePath'
import { buildShareQuery } from '@lib/utils/shareUrl'

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: 'Visualisierung',
  },
})

/**
 * SVG-only treemap for embedding via <iframe>; reads ?year= from the URL.
 * With ?link=1 a click opens that level on the visualisation page instead of
 * zooming inside the frame (preview on the start page).
 */
export const SharePage: FC = () => {
  const { observe, width, height } = useDimensions()
  const { query, isReady } = useRouter()

  const parsedQuery = mapRawQueryToState(query)
  const queriedYear =
    parsedQuery.year && isValidYear(parsedQuery.year)
      ? parsedQuery.year
      : DEFAULT_YEAR
  const queriedView = parsedQuery.view === 'bars' ? 'bars' : 'treemap'
  const queriedNode =
    parsedQuery.node ||
    (parsedQuery.district && parsedQuery.district !== 'all'
      ? parsedQuery.district
      : null)
  const linkToPage = query.link === '1'

  const openOnPage = ({ nodePath }: { nodePath?: string }): void => {
    const pageQuery = buildShareQuery({
      year: queriedYear,
      district: 'all',
      view: queriedView,
      node: nodePath || null,
    })
    window.open(withBasePath(`/visualisierung/${pageQuery}`), '_top')
  }

  const {
    treemap: hierarchyData,
    isLoading,
    error,
  } = useBudgetData(isReady ? queriedYear : null, { withList: false })

  return (
    <>
      <div className="w-full h-screen overflow-hidden" ref={observe}>
        {error && (
          <p className="text-center py-12 text-red-700" role="alert">
            Die Daten für {queriedYear} konnten nicht geladen werden.
          </p>
        )}
        {!error && isLoading && <p className="text-center py-12">Lädt...</p>}
        {!error && !isLoading && hierarchyData && width && height && (
          <TreeMapWithData
            hierarchy={hierarchyData}
            width={width}
            // Leave room for the level chips and the header row (iframe
            // content has a fixed height and does not scroll)
            height={Math.max(120, height - 76)}
            view={queriedView}
            node={queriedNode}
            onChangeLevel={linkToPage ? openOnPage : undefined}
          />
        )}
      </div>
    </>
  )
}

export default SharePage

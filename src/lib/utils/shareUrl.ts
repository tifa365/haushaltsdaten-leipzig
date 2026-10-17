import { DEFAULT_YEAR } from './yearValidator'

export interface ShareState {
  year: number
  district: string
  view: 'treemap' | 'bars'
  /** Path of node ids the treemap is zoomed into, e.g. "C/3151" */
  node?: string | null
}

/**
 * Query string for the current view, leaving out everything that is the
 * default so shared links stay short ("" for the start view).
 */
export const buildShareQuery = ({
  year,
  district,
  view,
  node,
}: ShareState): string => {
  const params = new URLSearchParams()
  if (year !== DEFAULT_YEAR) params.set('year', String(year))
  // The first segment of the node path is the policy area, so the district
  // is only needed when there is no path
  if (district && district !== 'all' && !node) params.set('district', district)
  if (view === 'bars') params.set('view', view)
  if (node) params.set('node', node)
  const query = params.toString()
  // Keep the "/" in node paths readable
  return query ? `?${query.replace(/%2F/g, '/')}` : ''
}

export const buildShareUrls = (
  origin: string,
  basePath: string,
  state: ShareState
): { pageUrl: string; embedUrl: string; iframeSnippet: string } => {
  const query = buildShareQuery(state)
  const pageUrl = `${origin}${basePath}/visualisierung/${query}`
  const embedUrl = `${origin}${basePath}/share/${query}`
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="600" style="border:0" title="Leipzig Haushaltsdaten"></iframe>`
  return { pageUrl, embedUrl, iframeSnippet }
}

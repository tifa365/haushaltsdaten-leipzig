/**
 * The app can be served below a sub-path (e.g. GitHub Pages:
 * https://<user>.github.io/<repo>/). Next.js prefixes routes handled by
 * next/link automatically, but plain <img src>, <link href>, <iframe src> and
 * fetch() calls do not get the prefix, so they must go through this helper.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const withBasePath = (path: string): string =>
  `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`

/** URL of a generated data file below public/data, e.g. dataUrl('2027/treemap.json') */
export const dataUrl = (relativePath: string): string =>
  withBasePath(`/data/${relativePath.replace(/^\/+/, '')}`)

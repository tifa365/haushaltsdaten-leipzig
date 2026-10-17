const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

/**
 * The site is exported as static HTML (`next build && next export`) and can be
 * served below a sub-path, e.g. GitHub Pages: set NEXT_PUBLIC_BASE_PATH=/<repo>.
 * Redirects/rewrites are not available in a static export; /search forwards
 * client-side instead.
 */
module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: { unoptimized: true },
})

import { GetStaticProps } from 'next'
import { FC, useEffect } from 'react'
import { useRouter } from 'next/router'
import { InternalLink } from '@components/InternalLink'

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: 'Suche',
  },
})

/**
 * The full-text search needs a database and is not available in the static
 * Leipzig version. Visitors of old /search links are forwarded client-side
 * (server redirects are not possible with a static export).
 */
const SearchPage: FC = () => {
  const { replace, isReady } = useRouter()

  useEffect(() => {
    if (isReady) void replace('/visualisierung')
  }, [isReady, replace])

  return (
    <div className="px-8">
      <div className="md:w-4/5 m-auto mt-12 md:mt-20">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl lg:ml-28">
          Suchfunktion
        </h1>
        <div className="lg:w-3/6 m-auto mt-6 md:mt-16">
          <p className="mb-4">
            Die Textsuche ist in dieser Version nicht verfügbar. Sie werden zur{' '}
            <InternalLink href="/visualisierung" className="text-brand">
              interaktiven Visualisierung
            </InternalLink>{' '}
            weitergeleitet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SearchPage

import { CopyTextField } from '@components/CopyTextField'
import { Code, Share } from '@components/Icons'
import { Paragraph } from '@components/Paragraph'
import { buildShareUrls, ShareState } from '@lib/utils/shareUrl'
import { Popover, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { FC, Fragment, ReactNode, useEffect, useState } from 'react'

const IconPopover: FC<{
  label: string
  icon: ReactNode
  children: ReactNode
}> = ({ label, icon, children }) => (
  <Popover className="relative">
    {({ open }) => (
      <>
        <Popover.Button
          title={label}
          aria-label={label}
          className={classNames(
            'inline-flex items-center justify-center rounded w-10 h-10',
            'transition-colors focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-brand',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            open
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          {icon}
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute right-0 z-10 mt-3 w-80" static>
            <div className="overflow-hidden rounded shadow-lg shadow-gray-900/5 ring-1 ring-gray-200">
              <div className="bg-white px-5 py-4">{children}</div>
            </div>
          </Popover.Panel>
        </Transition>
      </>
    )}
  </Popover>
)

/** "Teilen" and "Einbetten" icon buttons for the current view */
export const ShareLinks: FC<{ state: ShareState }> = ({ state }) => {
  const { basePath } = useRouter()
  // window is not available during the static build
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])

  const { pageUrl, embedUrl, iframeSnippet } = buildShareUrls(
    origin,
    basePath,
    state
  )

  return (
    <div className="inline-flex items-center gap-1">
      <IconPopover label="Ansicht teilen" icon={<Share size={22} />}>
        <h3 className="text-lg font-bold">Ansicht teilen</h3>
        <Paragraph className="leading-normal text-gray-500">
          Dieser Link öffnet genau die aktuelle Ansicht: Jahr, Politikbereich,
          Darstellung und die geöffnete Ebene.
        </Paragraph>
        <CopyTextField
          contentToCopy={pageUrl}
          name="share-url"
          label="Link zum Kopieren (anklicken)"
        >
          {pageUrl}
        </CopyTextField>
      </IconPopover>
      <IconPopover label="Einbetten" icon={<Code size={22} />}>
        <h3 className="text-lg font-bold">Ansicht einbetten</h3>
        <Paragraph className="leading-normal text-gray-500">
          Die Grafik lässt sich als{' '}
          <code className="rounded-md bg-gray-100 px-1 py-0.5">iframe</code> in
          andere Webseiten einbetten.
        </Paragraph>
        <CopyTextField
          contentToCopy={iframeSnippet}
          name="embed-snippet"
          label="HTML-Code zum Kopieren (anklicken)"
        >
          {iframeSnippet}
        </CopyTextField>
        <CopyTextField
          contentToCopy={embedUrl}
          name="embed-url"
          label="Nur die URL"
        >
          {embedUrl}
        </CopyTextField>
      </IconPopover>
    </div>
  )
}

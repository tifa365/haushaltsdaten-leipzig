import { FC } from 'react'

const REPO_URL = 'https://github.com/tifa365/haushaltsdaten-leipzig'
const CODE_FOR_LEIPZIG_URL = 'https://codefor.de/leipzig/'
const ORIGINAL_REPO_URL = 'https://github.com/berlin/haushaltsdaten'
const OPEN_DATA_URL =
  'https://opendata.leipzig.de/de/dataset/doppelhaushalt-2027-2028-unterlagen-und-datensatze-auf-einen-blick'

const linkClasses =
  'text-sm hover:text-brand transition-colors text-gray-700 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-[1px] outline-none'

export const Footer: FC = () => {
  return (
    <footer id="main-footer">
      <section className="bg-gray-50 border-t border-gray-200 px-4 xl:px-8">
        <div className="container max-w-8xl mx-auto py-8 grid gap-6 md:grid-cols-3 text-sm text-gray-700">
          <div>
            <h3 className="font-bold mb-2">Daten</h3>
            <p>
              Ergebnishaushalt der Stadt Leipzig: Doppelhaushalt 2025/26
              (beschlossen) und Entwurf Doppelhaushalt 2027/28 (Stand
              02.09.2026). Quelle:{' '}
              <a
                href={OPEN_DATA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Open-Data-Portal der Stadt Leipzig
              </a>
              .
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Projekt</h3>
            <p>
              Ein ehrenamtliches Open-Data-Projekt aus dem Umfeld von{' '}
              <a
                href={CODE_FOR_LEIPZIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Code for Leipzig
              </a>
              . Kein Angebot der Stadt Leipzig.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Basis</h3>
            <p>
              Basiert auf dem Prototyp{' '}
              <a
                href={ORIGINAL_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                „Berliner Haushaltsdaten“
              </a>{' '}
              der Technologiestiftung Berlin / ODIS (MIT-Lizenz).
            </p>
          </div>
        </div>
      </section>
      <section className="bg-gray-100 border-t border-gray-200 px-4 xl:px-8">
        <div className="container max-w-8xl mx-auto py-6 block sm:flex justify-between">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              &copy; {new Date().getFullYear()} Leipzig Haushaltsdaten (Open
              Source, MIT-Lizenz)
            </p>
          </div>
          <ul className="flex items-center mt-2 sm:mt-0 flex-wrap gap-x-4 gap-y-2">
            <li>
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                Kontakt
              </a>
            </li>
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                Quellcode
              </a>
            </li>
            <li>
              {/* TODO: replace with the Impressum of the hosting organisation */}
              <a
                href={`${REPO_URL}#impressum`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                Impressum
              </a>
            </li>
            <li>
              {/* TODO: replace with the Datenschutzerklärung of the hosting organisation */}
              <a
                href={`${REPO_URL}#datenschutz`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                Datenschutzerklärung
              </a>
            </li>
          </ul>
        </div>
      </section>
    </footer>
  )
}

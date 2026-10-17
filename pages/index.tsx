import { FadeInWrapper } from '@components/FadeInWrapper'
import { GetStaticProps } from 'next'
import { FC } from 'react'
import TypeAnimation from 'react-type-animation'
import { InternalLink } from '@components/InternalLink'
import { withBasePath } from '@lib/utils/basePath'
import { DEFAULT_YEAR } from '@lib/utils/yearValidator'

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      title: 'Startseite',
    },
  }
}

export const HomePage: FC = () => {
  return (
    <div className="px-8">
      <div className="md:w-4/5 m-auto mt-12 lg:mt-20">
        <div className="flex flex-wrap justify-between">
          <div className="flex-col lg:w-1/2 lg:pr-12">
            <span className="flex justify-center mt-10 md:mt-20 ">
              {/* <Building className="fill-gray-400"/> */}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold xl:text-right mb-3">
              Leipzig <br></br>Haushaltsdaten
            </h1>
            <h1 className="text-2xl md:text-4xl md:text-right">
              2025/26 und Entwurf 2027/28
            </h1>
          </div>
          <div className="flex-col italic xl:w-1/2 mt-6 md:mt-12 xl:mt-24 xl:pr-28">
            Der Leipziger Ergebnishaushalt zeigt, wofür die Stadt ihre
            Ressourcen einsetzt. Diese Webseite bietet einen Überblick über die
            geplanten Ausgaben der Stadt Leipzig für den beschlossenen
            Doppelhaushalt 2025/26 sowie den im September 2026 vorgelegten
            Entwurf des Doppelhaushalts 2027/28, aufgeschlüsselt nach
            Politikbereichen wie Soziales, Bildung, Verwaltung und weiteren
            Bereichen. Sie steht als{' '}
            <span className="text-brand">
              <InternalLink href={'/faq'} query={{ hashId: 'Open-Source' }}>
                Open Source Projekt
              </InternalLink>{' '}
            </span>
            zur Weiterentwicklung zur Verfügung!
          </div>
        </div>

        <div className="lg:w-3/6 m-auto mt-12 md:mt-20">
          <div className="text-2xl md:text-4xl flex-col">
            <h1 className="flex lg:mt-28">
              Wie viel Geld gibt Leipzig aus für
            </h1>
            <h1 className="font-bold flex text-brand">
              <TypeAnimation
                cursor={false}
                sequence={[
                  'Soziales & Jugend?',
                  2000,
                  'Bildung & Kultur?',
                  2000,
                  'Verwaltung?',
                  2000,
                  'Verkehr & Mobilität?',
                  2000,
                  'Umwelt & Grün?',
                  2000,
                ]}
                wrapper={'p'}
                repeat={Infinity}
              />
              <span className="text-white"> .</span>
            </h1>
          </div>
          <div className="m-auto mt-6 md:mt-8">
            Das Leben und Zusammenleben in Leipzig verursacht viele laufende
            Kosten: Gehälter für Lehrerinnen und Lehrer, der Betrieb
            öffentlicher Gebäude, die Förderung von kulturellen Einrichtungen,
            Sozialleistungen, Verkehrsinfrastruktur. Hinzu kommen Investitionen
            in Schulen, den öffentlichen Nahverkehr, Parks und Erholungsflächen.
            All diese Ausgaben trägt die Stadt Leipzig. Doch wofür wird wieviel
            Geld ausgegeben?
            <br></br>
            <br></br>
            Die Ausgaben legt der Leipziger Stadtrat im Haushaltsplan fest. Sie
            lassen sich in elf Politikbereiche (A-K) untergliedern: von
            Verwaltung & Sicherheit über Bildung & Kultur bis hin zu
            Finanzwirtschaft. Diese können als Struktur in einer so genannten
            Tree Map dargestellt werden:
          </div>
        </div>

        <div className="md:flex justify-center m-auto mt-6 md:mt-12 ">
          <div className="flex-col mb-6 md:my-auto inline-block">
            <FadeInWrapper>
              <div className="pr-12">
                <ul>
                  <span className="font-bold text-xl text-brand">
                    <InternalLink href={'/visualisierung'}>
                      {'→ Zur Visualisierung'}
                    </InternalLink>
                  </span>
                  <li>
                    <p className="pl-6">
                      Alle Ausgaben der Jahre 2025 bis 2028<br></br>in der Tree
                      Map erkunden
                    </p>
                  </li>
                </ul>
              </div>
            </FadeInWrapper>
          </div>
          <div className="flex-col inline-block my-auto justify-center md:pr-10">
            <iframe
              style={{ width: '100%' }}
              title="Beispiel-Visualisierung der Haushaltsdaten"
              width="400rem"
              height="400"
              src={withBasePath(`/share/?year=${DEFAULT_YEAR}`)}
            ></iframe>
          </div>
        </div>

        <div className="lg:w-3/6 m-auto mt-6 md:mt-12">
          Im Leipziger Haushaltsplan sind die Ausgaben verschiedenen
          Politikbereichen und Produkten zugeordnet. Dabei werden die Beträge
          für die einzelnen Haushaltsjahre getrennt angegeben. Mittels der
          Visualisierung, die über den Link oben erreichbar ist, können die
          einzelnen Politikbereiche und Jahre im Detail erkundet werden.
          <br></br>
          <br></br>
          Die detailliertesten Angaben zu spezifischen Beträgen im Haushaltsplan
          sind die einzelnen Produkte. Sie können über die Visualisierung
          gefiltert werden und erscheinen dann unter der Tree Map.
          <div className="flex-col mt-6 md:mt-16">
            Wie kommt der Haushalt zustande? Die Stadt Leipzig muss alle
            voraussichtlichen Einnahmen und Ausgaben eines Jahres in einem
            Haushaltsplan ausweisen. Die Verwaltung stellt einen
            Haushaltsplanentwurf auf und legt ihn dem Stadtrat vor. Die
            Stadträtinnen und Stadträte können daraufhin Änderungen vornehmen.
            Am Ende der Beratungen beschließen sie den Haushalt. Nähere
            Informationen finden sich auf der Info-Seite.
          </div>
          <div className="flex justify-center mt-6 md:mt-12 mb-16 md:mb-24">
            <FadeInWrapper>
              <ul>
                <span className="font-bold text-xl text-brand">
                  <InternalLink href={'/faq'}>
                    {'→ Zur Informationsseite'}
                  </InternalLink>
                </span>
                <li>
                  <p className="pl-6">
                    Mehr erfahren in den Fragen und Antworten zum Leipziger
                    Haushalt
                  </p>
                </li>
              </ul>
            </FadeInWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

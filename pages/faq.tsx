import { GetStaticProps } from 'next'
import React, { useState } from 'react'
import { FC } from 'react'

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: 'Infos',
  },
})

const ReadMore: FC = ({ children }) => {
  const text = children as string
  const [isReadMore, setIsReadMore] = useState(true)
  const toggleReadMore = (): void => {
    setIsReadMore(!isReadMore)
  }

  return (
    <div className="mt-6">
      <span
        dangerouslySetInnerHTML={{
          __html: isReadMore ? `${text.slice(0, 300)}` : text,
        }}
      ></span>
      <button
        onClick={toggleReadMore}
        className="font-medium text-brand cursor-pointer"
      >
        {isReadMore ? ' ...mehr anzeigen' : ' weniger anzeigen'}
      </button>
    </div>
  )
}

export const FaqPage: FC = () => {
  return (
    <div className="px-8">
      <div className="md:w-4/5 m-auto mt-12 md:mt-20">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl lg:ml-28">
          Wissenswertes zum Leipziger Haushalt
        </h1>
        <div className="lg:w-3/6 m-auto mt-6 md:mt-16">
          <div className="flex-col mt-6">
            Wie genau funktioniert das eigentlich mit dem Haushalt? Die Stadt
            Leipzig muss alle voraussichtlichen Einnahmen und Ausgaben eines
            Jahres im sogenannten Haushaltsplan ausweisen. Für jedes Jahr stellt
            die Verwaltung einen Haushaltsplanentwurf auf.
            <br></br>
            Haushaltsrechtlich möglich ist es auch, Haushalte für zwei Jahre
            aufzustellen, jeweils nach Jahren getrennt. Leipzig macht von dieser
            Möglichkeit Gebrauch und plant mit einem Doppelhaushalt.
          </div>

          <p className="text-2xl text-center mt-6 md:mt-16">
            ~2,4 bis 2,7 Milliarden Euro
          </p>
          <p className="text-gray-500 text-xs md:text-sm text-center">
            ordentliche Aufwendungen pro Jahr im Ergebnishaushalt 2025 bis 2028
            (2027/28 laut Entwurf)
          </p>

          <div className="mt-6 md:mt-16">
            Im Haushaltsplan ist festgelegt, wie viel Geld in den einzelnen
            Politikbereichen ausgegeben werden darf. Gleichzeitig wird damit das
            Budget für die Erfüllung der öffentlichen Aufgaben Leipzigs jährlich
            festgeschrieben. Die zu erwartenden Einnahmen aus Steuern, Gebühren
            und weiteren Einnahmen dienen zur Finanzierung aller Aufgaben der
            Stadt. Mit den Einnahmen steht ein klar begrenzter Rahmen an Mitteln
            zur Verfügung, der zum großen Teil durch Verpflichtungen der Stadt
            (beispielsweise im Sozialbereich und der Bildung) bereits rechtlich
            gebunden ist. Die Finanzierung weiterer Aufgaben der Verwaltung (z.
            B. Kultur, Wirtschaftsförderung, Stadtentwicklung) erfolgt nach
            Vorlage durch die Verwaltung im politischen Abstimmungsprozess mit
            dem Stadtrat.
          </div>

          <div className="mt-6 md:mt-16">
            Der Leipziger Haushalt gliedert sich in verschiedene Politikbereiche
            (A-K), die sich an den Aufgabenbereichen der Stadtverwaltung
            orientieren. Die größten Ausgabenblöcke liegen traditionell in den
            Bereichen Soziales & Jugend, Verwaltung & Sicherheit sowie Bildung &
            Kultur.
          </div>
        </div>

        <div className="lg:w-3/6 m-auto mt-6 md:mt-12 mb-16 md:mb-28 ">
          <h2 className="font-bold text-xl md:text-2xl">
            Politikbereiche im Leipziger Haushalt
          </h2>
          <div className="mt-6">
            Der Leipziger Ergebnishaushalt ist in elf Politikbereiche (A-K)
            gegliedert:
            <br></br>
            <br></br>
            <ul className="list-disc pl-6">
              <li>
                <strong>A - Verwaltung & Sicherheit:</strong> Innere Verwaltung,
                öffentliche Ordnung, Feuerwehr
              </li>
              <li>
                <strong>B - Bildung & Kultur:</strong> Schulen,
                Volkshochschulen, Museen, Theater, Bibliotheken
              </li>
              <li>
                <strong>C - Soziales & Jugend:</strong> Kinder- und Jugendhilfe,
                Sozialleistungen, Kindertagesbetreuung
              </li>
              <li>
                <strong>D - Gesundheit:</strong> Gesundheitsamt,
                Gesundheitsschutz
              </li>
              <li>
                <strong>E - Sport & Bäder:</strong> Sportförderung, Schwimmbäder
              </li>
              <li>
                <strong>F - Stadtentwicklung & Wohnen:</strong> Stadtplanung,
                Wohnungsbau
              </li>
              <li>
                <strong>G - Ver- & Entsorgung:</strong> Abwasser, Abfall
              </li>
              <li>
                <strong>H - Verkehr & Mobilität:</strong> Straßen, öffentlicher
                Nahverkehr
              </li>
              <li>
                <strong>I - Umwelt & Grün:</strong> Umweltschutz, Grünflächen,
                Parks
              </li>
              <li>
                <strong>J - Wirtschaft & Tourismus:</strong>
                Wirtschaftsförderung, Tourismusförderung
              </li>
              <li>
                <strong>K - Finanzwirtschaft:</strong> Allgemeine
                Finanzwirtschaft, Zinsen, Rücklagen
              </li>
            </ul>
          </div>

          <h2 className="font-bold text-xl md:text-2xl mt-6 md:mt-12 md:mt-20">
            Fragen und Antworten
          </h2>
          <h2 className=" text-xl mt-6 md:mt-12" id="Warum-Haushaltsdaten">
            Warum werden die Haushaltsdaten visualisiert?
          </h2>
          <ReadMore>
            {`Der Leipziger Haushalt ist aufgrund seiner Länge und Komplexität
            nicht für jede und jeden intuitiv verständlich. Da der Haushalt
            allerdings von besonderer Relevanz für das Leben in Leipzig ist,
            sollte er möglichst transparent dargestellt und für alle
            Leipzigerinnen und Leipziger zugänglich sein. Diese Webseite wurde
            entwickelt, um ein möglichst niedrigschwelliges Angebot zu schaffen,
            sich mit den Haushaltsdaten auseinanderzusetzen.
            <br><br>Vorlage für die Darstellung der Daten war das Projekt
            <a class="text-brand" href="https://offenerhaushalt.de">
              "Offener Haushalt"
            </a>
            der
            <a class="text-brand" href="https://okfn.de">
              Open Knowledge Foundation</a>. Dabei handelte es sich um eine Webseite, die Haushaltsdaten für
            Städte und Kommunen für Deutschland zentral und standardisiert
            einsehbar gemacht hat. Seit 2021 kann „Offener Haushalt" jedoch
            nicht mehr aktiv gepflegt werden. Diese Leipzig-Implementation baut
            auf dem ursprünglichen Berlin-Prototyp auf und verwendet statische
            JSON-Dateien statt einer Datenbank, was die Wartung und
            Weiterentwicklung vereinfacht.`}
          </ReadMore>

          <h2 className=" text-xl mt-6 md:mt-12">
            Was genau zeigt die Visualisierung?
          </h2>
          <ReadMore>
            {`Die interaktive Visualisierung (Tree Map) zeigt eine Übersicht der
              Ausgaben des Leipziger Ergebnishaushalts: die Jahre 2025 und 2026
              aus dem beschlossenen Doppelhaushalt 2025/26 sowie die Jahre 2027
              und 2028 aus dem Entwurf des Doppelhaushalts 2027/28 (Stand
              02.09.2026, vom Stadtrat noch nicht beschlossen). Die Flächen
              der Rechtecke sind dabei proportional zur Größe der
              darzustellenden Beträge. Die gezeigten Beträge gelten jeweils für
              ein einzelnes Haushaltsjahr. Über das Dropdown-Menü kann zwischen
              den Jahren gewechselt werden. Durch Klick auf eine der Flächen in
              der Tree Map lässt sich die nächst tiefere Detailstufe anzeigen,
              um einzelne Politikbereiche und Produkte näher zu erkunden. Die
              unterste detaillierte Angabe zu spezifischen Ausgaben sind die
              einzelnen Produkte (z.B. "Kitas", "Straßenreinigung"). Die zu der
              aktuell im Diagramm ausgewählten Gruppe gehörenden Produkte werden
              unter der Tree Map als Liste angezeigt.`}
          </ReadMore>

          <h2
            className=" text-xl mt-6 md:mt-12"
            id="Einzelplaene-und-Funktionen"
          >
            Was sind Politikbereiche und Produkte?
          </h2>
          <ReadMore>
            {`Der Leipziger Haushalt ist nach Politikbereichen (A-K) gegliedert.
            Diese Politikbereiche fassen thematisch zusammenhängende Aufgaben
            zusammen, z.B. "Soziales & Jugend" oder "Bildung & Kultur". Jeder
            Politikbereich enthält mehrere Produkte. Ein Produkt ist eine
            konkrete Leistung der Verwaltung, z.B. "Kitas", "Museen" oder
            "Straßenreinigung". Die Produkte werden durch einen Produktcode
            (z.B. 3650 für Kitas) identifiziert. Die ersten beiden Ziffern des
            Produktcodes bestimmen den Politikbereich. Diese Struktur
            ermöglicht eine klare Zuordnung und Transparenz der Ausgaben.`}
          </ReadMore>

          <h2 className=" text-xl mt-6 md:mt-12">Wo kommen die Daten her?</h2>
          <ReadMore>
            {`Die Daten dieser Anwendung stammen aus dem Leipziger
             Ergebnishaushalt: dem Doppelhaushalt 2025/2026 und dem Entwurf des
             Doppelhaushalts 2027/2028, beide veröffentlicht im Open-Data-Portal
             der Stadt Leipzig (opendata.leipzig.de). Gezeigt werden die
             ordentlichen Aufwendungen auf Produktebene. Die Originaldaten
             liegen als Excel-Dateien (XLSX) vor und werden mit einem automatisierten
             Node.js-basierten Prozess verarbeitet und in statische JSON-Dateien
             konvertiert. Diese Architektur ermöglicht eine vollständige
             Nachvollziehbarkeit: Jede Änderung der Daten wird in Git
             versioniert und ist transparent nachvollziehbar. Die verarbeiteten
             Daten können frei weiterverwendet werden.`}
          </ReadMore>

          <h2 className=" text-xl mt-6 md:mt-12" id="Open-Source">
            Ist die Anwendung Open Source? Wie kann sie weiterentwickelt werden?
          </h2>
          <ReadMore>
            {`Nicht nur die Haushaltsdaten sind offen als Open Data verfügbar -
            auch der Quellcode dieser Anwendung steht frei unter MIT-Lizenz zur
            Verfügung. Die Digital-Community in Leipzig und darüber hinaus ist
            eingeladen, kollaborativ an der Entwicklung und Verbesserung der
            Seite mitzuwirken oder Komponenten davon für eigene Arbeiten und
            Projekte zu verwenden. Über 
            <a
              class="text-brand"
              href="https://github.com/tifa365/haushaltsdaten-leipzig"
            >
              GitHub
            </a> 
            können Issues angelegt und Code-Verbesserungen oder neue Features
            via Pull Request eingereicht werden.`}
          </ReadMore>

          <h2 className=" text-xl mt-6 md:mt-12">
            Ist die Anwendung auch auf andere Städte und Kommunen übertragbar?
          </h2>
          <ReadMore>
            {`Ja! Die Anwendung bzw. der Quellcode können von anderen Kommunen
            verwendet werden, um ihre eigenen Haushaltsdaten zu präsentieren und
            transparent bereitzustellen. Voraussetzung ist, dass die jeweiligen
            Haushaltsdaten in einem maschinenlesbaren Format (z.B. Excel)
            vorliegen. Die Haushaltsdaten müssen auf Kommunalebene zwar per
            Gesetz veröffentlicht werden, oft passiert dies jedoch in Form von
            PDF-Berichten. Diese PDFs können zwar von Menschen gut gelesen
            werden, für eine weitere Verarbeitung sind sie aber nicht geeignet.
            Die Leipzig-Version verwendet statische JSON-Dateien statt einer
            Datenbank, was die Wartung und den Betrieb stark vereinfacht. Der
            komplette Quellcode steht auf GitHub zur Verfügung und kann von
            anderen Städten angepasst und weiterentwickelt werden.`}
          </ReadMore>
        </div>
      </div>
    </div>
  )
}

export default FaqPage

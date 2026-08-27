export const metadata = {
  title: 'Datenschutz - Phil4Kids',
  description: 'Datenschutzerklärung von Phil4Kids',
};

export default function DatenschutzPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-8 font-[family-name:var(--font-poppins)]">
          Datenschutzerklärung
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">1. Datenschutz auf einen Blick</h2>
            <p className="text-[#2C3E50]">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">2. Datenerfassung auf dieser Website</h2>
            <p className="text-[#2C3E50]">
              Die Datenverarbeitung erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">3. Ihre Rechte</h2>
            <p className="text-[#2C3E50]">
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">4. Cookies</h2>
            <p className="text-[#2C3E50]">
              Unsere Website verwendet keine Cookies. Falls in der Zukunft Cookies eingesetzt werden, werden wir Sie hier entsprechend informieren.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">5. Externe Dienste</h2>
            <p className="text-[#2C3E50]">
              Diese Website enthält Links zu externen Websites Dritter (YouTube, Spotify, Social Media), auf deren Datenschutzerklärungen wir keinen Einfluss haben.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">6. Kontaktformular</h2>
            <p className="text-[#2C3E50]">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Hinweis: Dies ist eine Muster-Datenschutzerklärung. Bitte passen Sie die Inhalte an Ihre tatsächliche Datenerhebung an und lassen Sie die Erklärung von einem Juristen prüfen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

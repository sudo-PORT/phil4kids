
export const metadata = {
  title: 'Shop - Phil4Kids',
  description: 'Shop für "Tierisch in Bewegung" – das Bewegungskartenspiel für Kinder.',
};

export default function ShopPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">
            Shop
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Entdecke unsere Produkte und bringe Bewegung ins Kinderzimmer!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="bg-gradient-to-br from-[#2ECC71] to-[#27ae60] flex items-center justify-center min-h-[400px]">
              <div className="text-center text-white px-8">
                <div className="w-48 h-48 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">Kartenspiel</span>
                </div>
                <h2 className="text-3xl font-bold mb-2 font-[family-name:var(--font-poppins)]">
                  Tierisch in Bewegung
                </h2>
                <p className="text-lg opacity-90">Bewegungskartenspiel</p>
              </div>
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">
                Tierisch in Bewegung – Bewegungskartenspiel
              </h2>
              <p className="text-[#2C3E50] mb-6">
                Das Bewegungskartenspiel für die ganze Familie! Jede Karte zeigt ein Tier mit einer lustigen Bewegungsaufgabe.
                Kinder lernen die Tiere kennen, imitieren ihre Bewegungen und kommen dabei richtig in Schwung.
                Ideal für drinnen und draußen, zu Hause und auf Reisen.
              </p>

              <div className="mb-6">
                <h3 className="font-semibold text-[#2C3E50] mb-3">Inhalt:</h3>
                <ul className="space-y-2">
                  {[
                    '36 farbig illustrierte Tierkarten',
                    'Alter ab 3 Jahren',
                    'Fördert Motorik, Kreativität und Tierkenntnisse',
                    'Hergestellt aus recyceltem Karton',
                    'Inklusive Spielanleitung mit zusätzlichen Bewegungsspielen',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#2C3E50]">
                      <svg className="w-5 h-5 text-[#2ECC71] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-[#2C3E50]">19,99 €</span>
                <span className="text-sm text-gray-500">inkl. MwSt., zzgl. Versand</span>
              </div>

              <a
                href="mailto:shop@phil4kids.de?subject=Tierisch%20in%20Bewegung%20Kartenspiel"
                className="inline-block bg-[#F39C12] hover:bg-[#E67E22] text-white font-bold py-3 px-8 rounded-full text-lg transition-colors text-center"
              >
                Jetzt bestellen
              </a>
              <p className="text-xs text-gray-500 mt-3">
                Oder schreibe uns eine E-Mail an <a href="mailto:shop@phil4kids.de" className="text-[#2ECC71]">shop@phil4kids.de</a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🚚', title: 'Versand', desc: 'Kostenloser Versand ab 30 €' },
            { icon: '🔄', title: 'Rückgabe', desc: '30 Tage Rückgaberecht' },
            { icon: '🔒', title: 'Sicher', desc: 'Sichere Zahlung' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-bold text-[#2C3E50] mt-3">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

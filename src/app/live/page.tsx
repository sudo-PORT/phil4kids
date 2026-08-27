import { events } from '@/data/content';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata = {
  title: 'Live Events - Phil4Kids',
  description: 'Besuche Philipp Greifenberg live auf Festivals, in Schulen und bei Kinderfeiern.',
};

export default function LivePage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">
            Live Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Triff Philipp live! Von Festivals über Schulworkshops bis hin zu Familienfeiern – hier findest du alle kommenden Termine.
          </p>
        </div>

        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} hover>
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-0">
                <div className="bg-[#3498DB] flex flex-col items-center justify-center p-6 text-white">
                  <span className="text-3xl font-bold">{new Date(event.date).getDate()}</span>
                  <span className="text-sm uppercase">
                    {new Date(event.date).toLocaleDateString('de-DE', { month: 'short' })}
                  </span>
                  <span className="text-xs">{new Date(event.date).getFullYear()}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#2C3E50] mb-2 font-[family-name:var(--font-poppins)]">
                    {event.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    📍 {event.location}
                  </p>
                  <p className="text-[#2C3E50] text-sm mb-4">{event.description}</p>
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center gap-1 text-[#2ECC71] hover:text-[#27ae60] font-medium text-sm"
                  >
                    Anmeldung & Infos
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">
            Philipp für dein Event buchen
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Du möchtest Philipp für eine Geburtstagsfeier, ein Schulfest oder ein Kinderfestival buchen?
            Schreibe uns eine Nachricht!
          </p>
          <Link
            href="/kontakt"
            className="inline-block bg-[#F39C12] hover:bg-[#E67E22] text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { albums, getAlbumBySlug } from '@/data/content';

export function generateStaticParams() {
  return albums.map((album) => ({ album: album.slug }));
}

type AlbumPageProps = {
  params: Promise<{ album: string }>;
};

export async function generateMetadata({ params }: AlbumPageProps) {
  const { album: albumSlug } = await params;
  const album = getAlbumBySlug(albumSlug);
  return {
    title: album ? `${album.title} - Phil4Kids Musik` : 'Musik - Phil4Kids',
    description: album ? album.description : 'Hören Sie die Musik von Philipp Greifenberg',
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { album: albumSlug } = await params;
  const album = getAlbumBySlug(albumSlug);

  if (!album) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">Album nicht gefunden</h1>
        <p className="text-[#2C3E50]">Das gesuchte Album existiert nicht.</p>
        <Link href="/musik" className="inline-block mt-6 text-[#2ECC71] hover:underline font-medium">← Zurück zur Musik</Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/musik" className="inline-block mb-6 text-[#2ECC71] hover:underline font-medium">← Zurück zur Musik</Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="aspect-square bg-gradient-to-br from-[#2ECC71] to-[#3498DB] rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl font-semibold">Album Cover</span>
          </div>

          <div>
            <p className="text-sm text-[#3498DB] font-medium mb-2">{album.year}</p>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">{album.title}</h1>
            <p className="text-[#2C3E50] mb-6">{album.description}</p>
            <a
              href={album.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1aa048] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.3 17.6c-.2.3-.5.4-.8.2-2.6-1.6-5.8-2-8.9-1.1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 3.4-1 6.9-.5 9.7 1.2.3.2.4.5.3.9zm1.1-3.8c-.3.4-.7.5-1.1.3-2.9-1.8-7-2.1-10.4-1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.9-1.2 8.4-.8 11.6 1.2.3.2.4.6.3.9zm.2-4c-3.4-2-8.6-2.2-12.5-.8-.5.2-1-.1-1.1-.5-.2-.5.1-1 .6-1.1 4.4-1.6 10.1-1.3 14 1 .4.2.5.7.3 1.1-.2.3-.6.4-.9.3z"/>
              </svg>
              Auf Spotify hören
            </a>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6 font-[family-name:var(--font-poppins)]">Tracklist</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {album.tracks.map((track, index) => (
              <div
                key={track.title}
                className={`flex items-center gap-4 px-6 py-4 ${index !== album.tracks.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="text-gray-400 w-8 text-right font-mono">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-[#2C3E50]">{track.title}</p>
                </div>
                <span className="text-gray-500 text-sm">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-xl font-bold text-[#2C3E50] mb-4 font-[family-name:var(--font-poppins)]">Jetzt streamen</h3>
          <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Spotify Embed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

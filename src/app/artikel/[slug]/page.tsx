import { notFound } from 'next/navigation';
import { articles } from '@/data/content';
import Link from 'next/link';

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return {
    title: article ? `${article.title} - Phil4Kids` : 'Artikel nicht gefunden',
    description: article ? article.excerpt : '',
  };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/artikel"
          className="text-[#3498DB] hover:text-[#2ECC71] text-sm font-medium mb-8 inline-block"
        >
          ← Zurück zu allen Artikeln
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-[#2ECC71] uppercase">{article.category}</span>
            <span className="text-sm text-gray-400">{formatDate(article.date)}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2C3E50] font-[family-name:var(--font-poppins)]">
            {article.title}
          </h1>
        </div>

        <div className="aspect-video bg-[#3498DB] rounded-2xl flex items-center justify-center mb-8">
          <span className="text-white text-xl font-medium">{article.category}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <article className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-poppins)] prose-headings:text-[#2C3E50] prose-p:text-[#2C3E50] prose-a:text-[#2ECC71] prose-strong:text-[#2C3E50]">
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={i} className="italic text-[#2C3E50] my-3">{line.replace(/\*/g, '')}</p>;
              }
              if (line.startsWith('**') && line.includes(':')) {
                return <p key={i} className="font-bold text-[#2C3E50] mt-4">{line}</p>;
              }
              if (line.trim() === '') return <div key={i} className="h-4" />;
              return <p key={i} className="text-[#2C3E50] my-3">{line}</p>;
            })}
          </article>
        </div>
      </div>
    </div>
  );
}

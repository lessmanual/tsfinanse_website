import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LegalPageLayoutProps {
  title: string;
  content: string;
}

export function LegalPageLayout({ title, content }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#C5A572] hover:text-[#B39562] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Powrót do strony głównej</span>
        </Link>

        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
          {title}
        </h1>

        {/* Legal Content */}
        <div className="prose prose-lg prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
          prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-ul:my-6 prose-ul:space-y-2
          prose-ol:my-6 prose-ol:space-y-2
          prose-li:text-gray-700
          prose-a:text-[#C5A572] prose-a:no-underline hover:prose-a:text-[#B39562] hover:prose-a:underline
          prose-table:border-collapse prose-table:w-full
          prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold
          prose-td:border prose-td:border-gray-300 prose-td:p-3
          prose-hr:my-8 prose-hr:border-gray-300
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Back to Top */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#C5A572] hover:text-[#B39562] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Powrót do strony głównej</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

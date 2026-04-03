import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SEO, blogPostingSchema, breadcrumbSchema } from '../components/SEO';
import { getPostBySlug, Post } from '../lib/posts';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      const foundPost = await getPostBySlug(slug);
      setPost(foundPost || null);
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#3D1F1F] text-lg">Ładowanie wpisu...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-3xl font-bold text-[#3D1F1F] mb-4">Nie znaleziono wpisu</h1>
        <p className="text-gray-600 mb-8">Artykuł, którego szukasz, nie istnieje lub został przeniesiony.</p>
        <Link 
          to="/blog" 
          className="px-6 py-3 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-colors"
        >
          Wróć do bloga
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        canonicalUrl={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featuredImage || undefined}
        schema={[
          blogPostingSchema({
            title: post.title,
            description: post.description,
            date: post.date,
            author: post.author,
            image: post.featuredImage,
            slug: post.slug,
          }),
          breadcrumbSchema([
            { name: 'Strona główna', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <Navigation />

      <main className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" style={{ paddingTop: '140px' }}>
          {/* Back link */}
          <Link 
            to="/blog" 
            className="inline-flex items-center text-[#3D1F1F]/60 hover:text-[#C5A572] transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Wróć do listy wpisów
          </Link>

          {/* Header */}
          <header className="mb-12">
            {post.category && (
              <span className="inline-block px-3 py-1 bg-[#D4AF7A]/20 text-[#3D1F1F] rounded-full text-sm font-medium mb-4">
                {post.category}
              </span>
            )}
            
            <h1 className="font-bold text-[#3D1F1F] mb-6 leading-tight" style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-[#3D1F1F]/60 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <time dateTime={post.date}>{formattedDate}</time>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{readTime} min czytania</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-[#3D1F1F]/10 aspect-video">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
                width="800"
                height="450"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className="max-w-none">
            {/* Wykryj czy content to HTML (nowe wpisy) czy Markdown (stare wpisy) */}
            {post.content.trim().startsWith('<') ? (
              // Nowe wpisy - renderuj HTML bezpośrednio
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              // Stare wpisy - renderuj Markdown
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-3xl md:text-4xl font-bold text-[#3D1F1F] mt-12 mb-6" {...props} />,
                  h2: ({...props}) => <h2 className="text-2xl md:text-3xl font-bold text-[#3D1F1F] mt-12 mb-6 border-l-4 border-[#C5A572] pl-4" {...props} />,
                  h3: ({...props}) => <h3 className="text-xl md:text-2xl font-extrabold text-[#3D1F1F] mt-10 mb-4" {...props} />,
                  p: ({...props}) => <p className="text-lg text-gray-700 leading-relaxed mb-6" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-gray-700" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg text-gray-700" {...props} />,
                  li: ({...props}) => <li className="pl-2" {...props} />,
                  a: ({...props}) => <a className="text-[#C5A572] font-medium hover:text-[#3D1F1F] hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                  blockquote: ({...props}) => <blockquote className="border-l-4 border-[#C5A572] pl-4 italic text-gray-600 my-6 bg-gray-50 py-4 pr-4 rounded-r-lg" {...props} />,
                  strong: ({...props}) => <strong className="font-bold text-[#3D1F1F]" {...props} />,
                  img: ({src, alt, ...props}) => <img src={src} alt={alt} loading="lazy" className="rounded-lg my-6 w-full" {...props} />,
                  table: ({...props}) => (
                    <div className="overflow-x-auto my-8">
                      <table className="w-full border-collapse text-base" {...props} />
                    </div>
                  ),
                  thead: ({...props}) => <thead className="bg-[#3D1F1F] text-white" {...props} />,
                  th: ({...props}) => <th className="px-4 py-3 text-left font-semibold text-sm" {...props} />,
                  td: ({...props}) => <td className="px-4 py-3 border-b border-gray-200 text-gray-700" {...props} />,
                  tr: ({...props}) => <tr className="even:bg-gray-50" {...props} />,
                }}
              >
                {post.content}
              </Markdown>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    <Tag size={14} className="mr-1.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}

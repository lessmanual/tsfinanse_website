import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
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
      <Helmet>
        <title>{`${post.title} - TS Finanse Blog`}</title>
        <meta name="description" content={post.description} />
        {post.tags && <meta name="keywords" content={post.tags.join(', ')} />}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
      </Helmet>

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
            
            <h1 className="text-3xl md:text-5xl font-bold text-[#3D1F1F] mb-6 leading-tight">
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
              />
            </div>
          )}

          {/* Content */}
          <div className="max-w-none">
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({...props}) => <h1 className="text-3xl md:text-4xl font-bold text-[#3D1F1F] mt-12 mb-6" {...props} />,
                h2: ({...props}) => <h2 className="text-2xl md:text-3xl font-bold text-[#3D1F1F] mt-12 mb-6 border-l-4 border-[#C5A572] pl-4" {...props} />,
                h3: ({...props}) => <h3 className="text-xl md:text-2xl font-bold text-[#3D1F1F] mt-8 mb-4" {...props} />,
                p: ({...props}) => <p className="text-lg text-gray-700 leading-relaxed mb-6" {...props} />,
                ul: ({...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-gray-700" {...props} />,
                ol: ({...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg text-gray-700" {...props} />,
                li: ({...props}) => <li className="pl-2" {...props} />,
                a: ({...props}) => <a className="text-[#C5A572] font-medium hover:text-[#3D1F1F] hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                blockquote: ({...props}) => <blockquote className="border-l-4 border-[#C5A572] pl-4 italic text-gray-600 my-6 bg-gray-50 py-4 pr-4 rounded-r-lg" {...props} />,
                strong: ({...props}) => <strong className="font-bold text-[#3D1F1F]" {...props} />,
              }}
            >
              {post.content}
            </Markdown>
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

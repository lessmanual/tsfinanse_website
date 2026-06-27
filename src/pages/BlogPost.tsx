import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import {
  SEO,
  blogFaqPageSchema,
  blogPostingSchema,
  breadcrumbSchema,
  editorialTrustProfile,
  editorialTrustStatement,
  officialReferenceLinks,
} from '../components/SEO';
import { getAllPosts, getPostBySlug, Post, selectRelatedPosts } from '../lib/posts';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';

interface BlogAnswerBlock {
  directAnswer: string;
  sections: string[];
}

interface ArticleTocItem {
  id: string;
  title: string;
}

const maxAnswerBlockLength = 340;

function normaliseAnswerText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function compactAnswerText(value = '') {
  const answer = normaliseAnswerText(value);
  if (answer.length <= maxAnswerBlockLength) return answer;
  return `${answer.slice(0, maxAnswerBlockLength - 3).trim()}...`;
}

function stripInlineMarkup(value = '') {
  return normaliseAnswerText(value
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]+/g, ' '));
}

function extractAnswerSections(content = '') {
  const htmlHeadings = [...content.matchAll(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi)]
    .map((match) => stripInlineMarkup(match[1]));
  const markdownHeadings = [...content.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((match) => stripInlineMarkup(match[1]));
  const seen = new Set<string>();

  return [...htmlHeadings, ...markdownHeadings]
    .filter((heading) => heading.length >= 8 && heading.length <= 90)
    .filter((heading) => !/^(powiązane artykuły|spis treści|faq)$/i.test(heading))
    .filter((heading) => {
      const key = heading.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function slugifyHeading(value = '') {
  return stripInlineMarkup(value)
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'sekcja';
}

function buildArticleToc(content = ''): ArticleTocItem[] {
  const htmlHeadings = [...content.matchAll(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi)]
    .map((match) => stripInlineMarkup(match[1]));
  const markdownHeadings = [...content.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((match) => stripInlineMarkup(match[1]));
  const slugs = new Map<string, number>();

  return [...htmlHeadings, ...markdownHeadings]
    .filter((heading) => heading.length >= 4 && heading.length <= 120)
    .filter((heading) => !/^(powiązane artykuły|spis treści|w skrócie)$/i.test(heading))
    .map((title) => {
      const baseId = slugifyHeading(title);
      const count = slugs.get(baseId) || 0;
      slugs.set(baseId, count + 1);

      return {
        id: count === 0 ? baseId : `${baseId}-${count + 1}`,
        title,
      };
    });
}

function withHeadingAnchors(content = '', toc: ArticleTocItem[]) {
  let index = 0;

  return content.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const item = toc[index];
    index += 1;
    if (!item) return match;

    const cleanAttrs = String(attrs || '').replace(/\s+id=(["'])[^"']+\1/gi, '');
    return `<h${level}${cleanAttrs} id="${item.id}">${inner}</h${level}>`;
  });
}

function buildBlogAnswerBlock(post: Post): BlogAnswerBlock | undefined {
  const directAnswer = compactAnswerText(post.description);
  if (directAnswer.length < 70) return undefined;
  const extractedSections = extractAnswerSections(post.content);
  const fallbackSections = [post.category, ...post.tags].filter(Boolean).slice(0, 3);

  return {
    directAnswer,
    sections: extractedSections.length > 0 ? extractedSections : fallbackSections,
  };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      const [foundPost, allPosts] = await Promise.all([
        getPostBySlug(slug),
        getAllPosts(),
      ]);
      setPost(foundPost || null);
      setRelatedPosts(foundPost ? selectRelatedPosts(foundPost, allPosts, 4) : []);
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
          to="/blog/"
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
  const updatedAt = post.updatedAt || post.date;
  const formattedUpdatedAt = new Date(updatedAt).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  const faqSchema = blogFaqPageSchema({
    slug: post.slug,
    content: post.content,
  });
  const answerBlock = buildBlogAnswerBlock(post);
  const articleToc = buildArticleToc(post.content);
  const htmlContent = post.content.trim().startsWith('<')
    ? withHeadingAnchors(post.content, articleToc)
    : post.content;
  let markdownHeadingIndex = 0;
  const nextMarkdownHeadingId = () => {
    const item = articleToc[markdownHeadingIndex];
    markdownHeadingIndex += 1;
    return item?.id;
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        canonicalUrl={`/blog/${post.slug}/`}
        ogType="article"
        ogImage={post.featuredImage || undefined}
        publishedTime={post.date}
        modifiedTime={updatedAt}
        schema={[
          blogPostingSchema({
            title: post.title,
            description: post.description,
            date: post.date,
            updatedAt,
            author: post.author,
            image: post.featuredImage,
            slug: post.slug,
            category: post.category,
            tags: post.tags,
            content: post.content,
          }),
          ...(faqSchema ? [faqSchema] : []),
          breadcrumbSchema([
            { name: 'Strona główna', url: '/' },
            { name: 'Blog', url: '/blog/' },
            { name: post.title, url: `/blog/${post.slug}/` },
          ]),
        ]}
      />

      <Navigation />

      <main className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" style={{ paddingTop: '140px' }}>
          {/* Back link */}
          <Link
            to="/blog/"
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
                <span>
                  Opublikowano: <time dateTime={post.date}>{formattedDate}</time>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Aktualizacja: <time dateTime={updatedAt}>{formattedUpdatedAt}</time>
                </span>
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

          {answerBlock && (
            <section
              data-ai-answer="summary"
              aria-labelledby="answer-summary-heading"
              className="mb-10 border-l-4 border-[#C5A572] bg-[#F8F5EF] px-5 py-5"
            >
              <h2 id="answer-summary-heading" className="text-xl font-bold text-[#3D1F1F] mb-3">
                W skrócie
              </h2>
              <p className="text-base text-[#3D1F1F]/85 leading-relaxed mb-4">
                <strong>Krótka odpowiedź:</strong> {answerBlock.directAnswer}
              </p>
              {answerBlock.sections.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-sm text-[#3D1F1F]/75">
                  {answerBlock.sections.map((section) => (
                    <li key={section}>{section}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {articleToc.length >= 2 && (
            <nav
              data-ai-toc="article"
              aria-labelledby="article-toc-heading"
              className="mb-10 rounded-lg border border-[#3D1F1F]/10 bg-white p-5"
            >
              <h2 id="article-toc-heading" className="text-lg font-bold text-[#3D1F1F] mb-3">
                Spis treści
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-[#3D1F1F]/75">
                {articleToc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="hover:text-[#C5A572] hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

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
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              // Stare wpisy - renderuj Markdown
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h2 id={nextMarkdownHeadingId()} className="text-3xl md:text-4xl font-bold text-[#3D1F1F] mt-12 mb-6" {...props} />,
                  h2: ({...props}) => <h2 id={nextMarkdownHeadingId()} className="text-2xl md:text-3xl font-bold text-[#3D1F1F] mt-12 mb-6 border-l-4 border-[#C5A572] pl-4" {...props} />,
                  h3: ({...props}) => <h3 id={nextMarkdownHeadingId()} className="text-xl md:text-2xl font-extrabold text-[#3D1F1F] mt-10 mb-4" {...props} />,
                  p: ({...props}) => <p className="text-lg text-gray-700 leading-relaxed mb-6" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-gray-700" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg text-gray-700" {...props} />,
                  li: ({...props}) => <li className="pl-2" {...props} />,
                  a: ({href, ...props}) => {
                    const isInternal = href?.startsWith('/') || href?.startsWith('https://tsfinanse.com');
                    return <a href={href} className="text-[#C5A572] font-medium hover:text-[#3D1F1F] hover:underline transition-colors" {...(!isInternal && { target: "_blank", rel: "noopener noreferrer" })} {...props} />;
                  },
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

          <section
            data-ai-sources="official"
            aria-labelledby="official-sources-heading"
            className="mt-12 pt-8 border-t border-gray-100"
          >
            <h2 id="official-sources-heading" className="text-2xl font-bold text-[#3D1F1F] mb-4">
              Źródła i weryfikacja
            </h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Przed decyzją finansową sprawdź aktualne rejestry, ostrzeżenia publiczne i informacje urzędowe.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-gray-700">
              {officialReferenceLinks.map((reference) => (
                <li key={reference.url}>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C5A572] font-medium hover:text-[#3D1F1F] hover:underline transition-colors"
                  >
                    {reference.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section
            data-ai-author="editorial"
            aria-labelledby="editorial-trust-heading"
            className="mt-12 pt-8 border-t border-gray-100"
          >
            <h2 id="editorial-trust-heading" className="text-2xl font-bold text-[#3D1F1F] mb-4">
              Autor i weryfikacja merytoryczna
            </h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {editorialTrustStatement}
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              Podmiot odpowiedzialny: {editorialTrustProfile.name} ({editorialTrustProfile.legalName}), kontakt:{' '}
              <a
                href={`mailto:${editorialTrustProfile.email}`}
                className="text-[#C5A572] font-medium hover:text-[#3D1F1F] hover:underline transition-colors"
              >
                {editorialTrustProfile.email}
              </a>
              .
            </p>
          </section>

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

          {relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-100" aria-labelledby="related-posts-heading">
              <h2 id="related-posts-heading" className="text-2xl font-bold text-[#3D1F1F] mb-6">
                Powiązane artykuły
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    to={`/blog/${relatedPost.slug}/`}
                    className="group block rounded-lg border border-[#3D1F1F]/10 p-5 transition-colors hover:border-[#C5A572]/70"
                  >
                    <span className="block text-sm text-[#3D1F1F]/50 mb-2">
                      {relatedPost.category || 'Finansowanie'}
                    </span>
                    <span className="block font-semibold text-[#3D1F1F] group-hover:text-[#C5A572] transition-colors">
                      {relatedPost.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}

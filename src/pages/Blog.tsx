import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SEO, blogIndexSchemas, breadcrumbSchema } from '../components/SEO';
import { getAllPosts, Post } from '../lib/posts';
import { BLOG_CATEGORIES } from '../lib/constants';
import { Calendar, ArrowRight, Clock, Search, X } from 'lucide-react';

function normaliseSearchText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function postMatchesSearch(post: Post, normalisedQuery: string) {
  if (!normalisedQuery) return true;
  const haystack = normaliseSearchText([
    post.title,
    post.description,
    post.category,
    post.content,
    ...(post.tags || []),
  ].filter(Boolean).join(' '));

  return normalisedQuery
    .split(' ')
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const normalisedSearchQuery = useMemo(() => normaliseSearchText(searchQuery), [searchQuery]);

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setLoading(false);
    }
    loadPosts();
  }, []);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  function updateSearchQuery(nextQuery: string) {
    const nextParams = new URLSearchParams(searchParams);
    const trimmed = nextQuery.trim();
    if (trimmed) {
      nextParams.set('q', trimmed);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearchQuery(searchInput);
  }

  function clearSearch() {
    setSearchInput('');
    updateSearchQuery('');
  }

  return (
    <>
      <SEO
        title="Blog - Aktualności i Porady Finansowe"
        description="Blog TS Finanse - aktualności ze świata finansów dla przedsiębiorców, porady dotyczące pożyczek hipotecznych i finansowania biznesu."
        canonicalUrl="/blog/"
        schema={[
          breadcrumbSchema([
            { name: 'Strona główna', url: '/' },
            { name: 'Blog', url: '/blog/' },
          ]),
          ...blogIndexSchemas(posts),
        ]}
      />

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-white via-[#D4AF7A]/5 to-white pb-24" style={{ paddingTop: '140px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3D1F1F] mb-4">
              Blog TS Finanse
            </h1>
            <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
              Aktualności, porady i wiedza o finansowaniu dla przedsiębiorców
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-[#3D1F1F]/60">Ładowanie wpisów...</div>
            </div>
          ) : posts.length === 0 ? (
            /* Empty State */
            <div className="max-w-3xl mx-auto text-center py-12">
               <div className="bg-white rounded-2xl shadow-xl border border-[#3D1F1F]/10 p-12">
                <p className="text-[#3D1F1F]/70 mb-4">
                  Brak wpisów w tym momencie.
                </p>
                <p>Wróć do nas wkrótce!</p>
               </div>
            </div>
          ) : (
            <>
              <form
                role="search"
                action="/blog/"
                method="get"
                onSubmit={submitSearch}
                className="max-w-2xl mx-auto mb-8"
              >
                <label htmlFor="blog-search" className="sr-only">
                  Szukaj w blogu TS Finanse
                </label>
                <div className="flex items-center gap-2 bg-white border border-[#3D1F1F]/10 shadow-sm px-4 py-3" style={{ borderRadius: '8px' }}>
                  <Search size={20} className="text-[#3D1F1F]/45 flex-shrink-0" aria-hidden="true" />
                  <input
                    id="blog-search"
                    type="search"
                    name="q"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Szukaj po temacie, problemie lub finansowaniu"
                    className="min-w-0 flex-1 bg-transparent text-[#3D1F1F] placeholder:text-[#3D1F1F]/45 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Wyczyść wyszukiwanie"
                      className="p-2 text-[#3D1F1F]/45 hover:text-[#3D1F1F] transition-colors"
                      style={{ borderRadius: '8px' }}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3D1F1F] text-white text-sm font-medium hover:bg-[#2b1515] transition-colors"
                    style={{ borderRadius: '8px' }}
                  >
                    Szukaj
                  </button>
                </div>
              </form>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {BLOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === cat.id
                        ? 'bg-[#3D1F1F] text-white'
                        : 'bg-white text-[#3D1F1F]/70 border border-[#3D1F1F]/10 hover:border-[#D4AF7A]/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {(() => {
                const categoryPosts = activeCategory === 'all'
                  ? posts
                  : posts.filter(p => p.category === activeCategory);
                const filteredPosts = normalisedSearchQuery
                  ? categoryPosts.filter((post) => postMatchesSearch(post, normalisedSearchQuery))
                  : categoryPosts;

                return filteredPosts.length > 0 ? (
                  <>
                    {searchQuery && (
                      <p className="text-center text-sm text-[#3D1F1F]/60 mb-8">
                        {filteredPosts.length} wyników dla "{searchQuery}"
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredPosts.map((post) => {
                        // Calculate reading time (rough estimate: 200 words per minute)
                        const wordCount = post.content.split(/\s+/).length;
                        const readTime = Math.ceil(wordCount / 200);

                        return (
                          <article
                            key={post.slug}
                            className="bg-white rounded-2xl shadow-lg border border-[#3D1F1F]/5 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                          >
                            {post.featuredImage && (
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                  width="800"
                                  height="450"
                                  loading="lazy"
                                />
                              </div>
                            )}

                            <div className="p-8 flex flex-col flex-grow">
                              <div className="flex items-center justify-between mb-4 text-sm">
                                <span className="px-3 py-1 bg-[#D4AF7A]/20 text-[#3D1F1F] rounded-full font-medium">
                                  {post.category}
                                </span>
                                <div className="flex items-center text-[#3D1F1F]/60">
                                  <Clock size={14} className="mr-1" />
                                  <span>{readTime} min</span>
                                </div>
                              </div>

                              <h2 className="font-bold text-[#3D1F1F] mb-3 group-hover:text-[#C5A572] transition-colors line-clamp-3" style={{ fontSize: '1.375rem' }}>
                                <Link to={`/blog/${post.slug}/`}>
                                  {post.title}
                                </Link>
                              </h2>

                              {post.description && (
                                <p className="text-sm text-[#3D1F1F]/60 mb-6 line-clamp-2 flex-grow">
                                  {post.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                                <div className="flex items-center text-[#3D1F1F]/50 text-sm">
                                  <Calendar size={16} className="mr-2" />
                                  <time dateTime={post.date}>
                                    {new Date(post.date).toLocaleDateString('pl-PL')}
                                  </time>
                                </div>

                                <Link
                                  to={`/blog/${post.slug}/`}
                                  className="flex items-center font-medium text-[#C5A572] hover:text-[#3D1F1F] transition-colors"
                                >
                                  Czytaj dalej
                                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-[#3D1F1F]/60">
                    Brak wpisów dla wybranych filtrów.
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

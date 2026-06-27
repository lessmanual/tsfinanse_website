import { supabase } from './supabase';

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  tags?: string[];
  category?: string;
  featuredImage?: string;
  author?: string;
}

const siteUrl = 'https://tsfinanse.com';
let publishedSlugCache: Set<string> | null = null;

function normalizeSlug(slug = '') {
  return decodeURIComponent(String(slug))
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function canonicalizeInternalUrl(rawUrl: string, publishedSlugs: Set<string>) {
  if (!rawUrl || rawUrl.startsWith('#') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) {
    return rawUrl;
  }

  let url: URL;
  try {
    url = new URL(rawUrl, siteUrl);
  } catch {
    return rawUrl;
  }

  if (url.origin !== siteUrl) {
    return rawUrl;
  }

  if (url.pathname === '/kontakt') {
    return `/${url.hash || '#contact'}`;
  }

  if (/\.[a-z0-9]{2,8}$/i.test(url.pathname)) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  if (url.pathname.startsWith('/blog/')) {
    const slug = normalizeSlug(url.pathname.replace(/^\/blog\//, '').replace(/\/$/, ''));
    if (!slug) {
      return `/blog/${url.search}${url.hash}`;
    }
    if (publishedSlugs.size > 0 && !publishedSlugs.has(slug)) {
      return '/blog/';
    }
    return `/blog/${slug}/${url.search}${url.hash}`;
  }

  if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
    return `${url.pathname}/${url.search}${url.hash}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function normalizeContentLinks(content: string, publishedSlugs: Set<string>) {
  return content
    .replace(/href=(["'])([^"']+)\1/gi, (_match, quote, href) => {
      return `href=${quote}${canonicalizeInternalUrl(href, publishedSlugs)}${quote}`;
    })
    .replace(/\]\(([^)]+)\)/g, (_match, href) => {
      return `](${canonicalizeInternalUrl(href, publishedSlugs)})`;
    });
}

function normalizeStaleTsFinansePricingClaims(content: string) {
  // Older CMS rows quoted fixed TS Finanse commission rates. Keep rendering aligned with the current offer until CMS is cleaned.
  return content
    .replace(/Prowizja TS Finanse wynosi standardowo 1% od wartości pożyczki\s*-\s*jest transparentnie ujawniana w pisemnej ofercie przed podpisaniem umowy\./gi, 'Warunki kosztowe TS Finanse są ustalane indywidualnie i transparentnie ujawniane w pisemnej ofercie przed podpisaniem umowy.')
    .replace(/Prowizja TS Finanse wynosi 1% od wartości pożyczki\s*-\s*jest transparentnie podawana w ofercie indywidualnej\./gi, 'Warunki kosztowe TS Finanse są ustalane indywidualnie i transparentnie podawane w ofercie.')
    .replace(/<strong>Prowizja TS Finanse:<\/strong>\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '<strong>Warunki kosztowe TS Finanse:</strong> ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/<strong>Prowizja:<\/strong>\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '<strong>Warunki kosztowe:</strong> ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/\*\*Prowizja TS Finanse:\*\*\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '**Warunki kosztowe TS Finanse:** ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/\*\*Prowizja:\*\*\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '**Warunki kosztowe:** ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/Prowizja TS Finanse:\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, 'Warunki kosztowe TS Finanse: ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/Prowizja:\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, 'Warunki kosztowe: ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/Prowizja za udzielenie pożyczki wynosi 1% wartości pożyczki\. Jest podawana transparentnie w ofercie indywidualnej przed podpisaniem umowy\./gi, 'Warunki kosztowe udzielenia pożyczki są ustalane indywidualnie i podawane transparentnie w ofercie przed podpisaniem umowy.')
    .replace(/Prowizja za udzielenie pożyczki wynosi 1%\./gi, 'Warunki kosztowe udzielenia pożyczki są ustalane indywidualnie.')
    .replace(/Prowizja partnerska dla pośredników finansowych i doradców wynosi 1% od wartości pożyczki\. Jest transparentnie ujawniana w ofercie indywidualnej\./gi, 'Warunki współpracy partnerskiej dla pośredników finansowych i doradców są ustalane indywidualnie przed obsługą klienta i transparentnie ujawniane w ofercie.')
    .replace(/w kontekście TS Finanse prowizja partnerska\s*-\s*dla pośredników finansowych\s*-\s*wynosi 1% od wartości pożyczki\. Jest transparentnie ujawniana w ofercie indywidualnej przed podpisaniem umowy\./gi, 'w kontekście TS Finanse warunki współpracy partnerskiej dla pośredników finansowych są ustalane indywidualnie przed obsługą klienta i transparentnie ujawniane w ofercie.')
    .replace(/Jeśli trafiasz do TS Finanse przez pośrednika finansowego lub doradcę\s*-\s*prowizja partnerska wynosi 1% od wartości pożyczki\. Jest ona transparentnie ujawniana w ofercie indywidualnej\./gi, 'Jeśli trafiasz do TS Finanse przez pośrednika finansowego lub doradcę, warunki współpracy partnerskiej są ustalane indywidualnie przed obsługą klienta i transparentnie ujawniane w ofercie.')
    .replace(/Oprócz kosztów hipoteki, przy pożyczkach od TS Finanse obowiązuje prowizja 1% od wartości pożyczki\./gi, 'Oprócz kosztów hipoteki, warunki kosztowe pożyczek od TS Finanse są ustalane indywidualnie w ofercie.')
    .replace(/Prowizja TS Finanse za udzielenie pożyczki wynosi 1%/gi, 'Warunki kosztowe TS Finanse za udzielenie pożyczki są ustalane indywidualnie')
    .replace(/prowizja \(1%\)/gi, 'warunki kosztowe ustalane indywidualnie')
    .replace(/Oprocentowanie i prowizja \(1%\) są kosztami z tytułu finansowania/gi, 'Oprocentowanie i indywidualnie ustalane warunki kosztowe są kosztami z tytułu finansowania')
    .replace(/standardowa prowizja wynosi 1% od kwoty\. Przy 3 mln PLN to 30 000 PLN jednorazowo\./gi, 'warunki kosztowe są ustalane indywidualnie w ofercie.')
    .replace(/Prowizja:\s*1%/gi, 'Warunki kosztowe: indywidualnie ustalane')
    .replace(/Prowizja 1%/gi, 'Koszty ustalane indywidualnie')
    .replace(/prowizja 1% od wartości pożyczki/gi, 'warunki kosztowe ustalane indywidualnie w ofercie')
    .replace(/prowizja 1%/gi, 'warunki kosztowe ustalane indywidualnie');
}

function normalizeArticleContent(content: string, publishedSlugs: Set<string>) {
  return normalizeStaleTsFinansePricingClaims(normalizeContentLinks(content, publishedSlugs))
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
}

function toPublishedSlugSet(rows: Array<{ slug?: string | null }>) {
  return new Set(rows.map((row) => normalizeSlug(row.slug || '')).filter(Boolean));
}

async function getPublishedSlugSet() {
  if (publishedSlugCache) {
    return publishedSlugCache;
  }

  if (!supabase) {
    return new Set<string>();
  }

  const { data } = await supabase
    .from('ts_finanse_posts')
    .select('slug')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString());

  publishedSlugCache = toPublishedSlugSet(data || []);
  return publishedSlugCache;
}

export async function getAllPosts(): Promise<Post[]> {
  if (!supabase) {
    console.error('Supabase not configured');
    return [];
  }

  const { data, error } = await supabase
    .from('ts_finanse_posts')
    .select('*')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const publishedSlugs = toPublishedSlugSet(data);
  publishedSlugCache = publishedSlugs;

  return data.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.published_at || post.created_at,
    description: post.description || '',
    content: normalizeArticleContent(post.content || '', publishedSlugs),
    tags: post.tags || [],
    category: post.category || 'Finansowanie',
    featuredImage: post.featured_image,
    author: post.author || 'TS Finanse',
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  if (!supabase) {
    console.error('Supabase not configured');
    return undefined;
  }

  const { data, error } = await supabase
    .from('ts_finanse_posts')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return undefined;
  }

  const publishedSlugs = await getPublishedSlugSet();

  return {
    slug: data.slug,
    title: data.title,
    date: data.published_at || data.created_at,
    description: data.description || '',
    content: normalizeArticleContent(data.content || '', publishedSlugs),
    tags: data.tags || [],
    category: data.category || 'Finansowanie',
    featuredImage: data.featured_image,
    author: data.author || 'TS Finanse',
  };
}

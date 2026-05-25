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
    content: normalizeContentLinks(post.content || '', publishedSlugs),
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
    content: normalizeContentLinks(data.content || '', publishedSlugs),
    tags: data.tags || [],
    category: data.category || 'Finansowanie',
    featuredImage: data.featured_image,
    author: data.author || 'TS Finanse',
  };
}

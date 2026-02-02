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

export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('ts_finanse_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.published_at || post.created_at,
    description: post.description || '',
    content: post.content,
    tags: post.tags || [],
    category: post.category || 'Finansowanie',
    featuredImage: post.featured_image,
    author: post.author || 'TS Finanse',
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const { data, error } = await supabase
    .from('ts_finanse_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    slug: data.slug,
    title: data.title,
    date: data.published_at || data.created_at,
    description: data.description || '',
    content: data.content,
    tags: data.tags || [],
    category: data.category || 'Finansowanie',
    featuredImage: data.featured_image,
    author: data.author || 'TS Finanse',
  };
}

import yaml from 'js-yaml';

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

function parseFrontmatter(fileContent: string): { data: any; content: string } {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    return { data: {}, content: fileContent };
  }

  const frontmatterBlock = match[1];
  const content = fileContent.replace(match[0], '').trim();
  
  try {
    const data = yaml.load(frontmatterBlock);
    return { data, content };
  } catch (e) {
    console.error('Error parsing frontmatter:', e);
    return { data: {}, content };
  }
}

export async function getAllPosts(): Promise<Post[]> {
  // Vite glob import for raw content
  const modules = import.meta.glob('../../content/blog/*.md', { query: '?raw', import: 'default' });

  const posts: Post[] = [];

  for (const path in modules) {
    try {
      const rawContent = await modules[path]() as string;
      const { data, content } = parseFrontmatter(rawContent);
      
      // Extract slug from filename
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      
      posts.push({
        slug: filename,
        title: data.title || 'Bez tytułu',
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        description: data.description || '',
        content: content,
        tags: data.tags || [],
        category: data.category || 'Aktualności',
        featuredImage: data.featuredImage || undefined,
        author: data.author || 'TS Finanse',
      });
    } catch (e) {
      console.error(`Error loading post from ${path}:`, e);
    }
  }

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

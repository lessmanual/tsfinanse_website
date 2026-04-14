import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://www.tsfinanse.com';

// Static routes with priorities
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly', lastmod: null },
  { path: '/blog', priority: '0.8', changefreq: 'daily', lastmod: null },
  { path: '/programpartnerski', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-01' },
  { path: '/polityka-prywatnosci', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
  { path: '/polityka-cookies', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
  { path: '/regulamin', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
  { path: '/rodo', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
];

async function getBlogPosts() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, generating sitemap without blog posts');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('ts_finanse_posts')
    .select('slug, title, description, published_at, updated_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error.message);
    return [];
  }

  return data || [];
}

function generateSitemap(posts) {
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of staticRoutes) {
    const mod = route.lastmod || today;
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${mod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const post of posts) {
    const lastmod = (post.updated_at || post.published_at || today).split('T')[0];
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += '</urlset>\n';
  return xml;
}

function generateRSS(posts) {
  const now = new Date().toUTCString();

  let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
  rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
  rss += '  <channel>\n';
  rss += '    <title>TS Finanse Blog</title>\n';
  rss += `    <link>${SITE_URL}/blog</link>\n`;
  rss += '    <description>Aktualności i porady finansowe dla przedsiębiorców - pożyczki hipoteczne, finansowanie biznesu, rozwój firm.</description>\n';
  rss += '    <language>pl</language>\n';
  rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
  rss += `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  for (const post of posts) {
    const pubDate = new Date(post.published_at).toUTCString();
    rss += '    <item>\n';
    rss += `      <title>${escapeXml(post.title || post.slug)}</title>\n`;
    rss += `      <link>${SITE_URL}/blog/${post.slug}</link>\n`;
    rss += `      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    if (post.description) {
      rss += `      <description>${escapeXml(post.description)}</description>\n`;
    }
    rss += '    </item>\n';
  }

  rss += '  </channel>\n';
  rss += '</rss>\n';
  return rss;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('Generating sitemap and RSS feed...');
  const posts = await getBlogPosts();

  const distDir = resolve(process.cwd(), 'dist');

  const sitemap = generateSitemap(posts);
  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap);
  console.log(`Sitemap generated with ${staticRoutes.length + posts.length} URLs`);

  const rss = generateRSS(posts);
  writeFileSync(resolve(distDir, 'rss.xml'), rss);
  console.log(`RSS feed generated with ${posts.length} posts`);
}

main().catch(console.error);

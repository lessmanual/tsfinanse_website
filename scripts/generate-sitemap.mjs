import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env manually since this script runs outside Vite
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && value) process.env[key] = value;
  });
}

const SITE_URL = 'https://tsfinanse.com';

function canonicalPath(path) {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function absoluteImageUrl(rawUrl) {
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl, SITE_URL);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function latestDateValue(first, second) {
  const firstValue = first || '';
  const secondValue = second || '';
  const firstTime = Date.parse(firstValue);
  const secondTime = Date.parse(secondValue);

  if (!Number.isFinite(firstTime)) return secondValue || firstValue;
  if (!Number.isFinite(secondTime)) return firstValue;

  return firstTime >= secondTime ? firstValue : secondValue;
}

function sitemapHrefLangLinks(loc) {
  return `    <xhtml:link rel="alternate" hreflang="pl-PL" href="${loc}" />\n`
    + `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
}

// Static routes with priorities
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly', lastmod: null },
  { path: '/blog/', priority: '0.8', changefreq: 'daily', lastmod: null },
  { path: '/programpartnerski/', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-01' },
  { path: '/polityka-prywatnosci/', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
  { path: '/polityka-cookies/', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
  { path: '/regulamin/', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
  { path: '/rodo/', priority: '0.3', changefreq: 'yearly', lastmod: '2025-11-24' },
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
    .select('slug, title, description, featured_image, published_at, updated_at')
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
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const route of staticRoutes) {
    const mod = route.lastmod || today;
    const loc = `${SITE_URL}${canonicalPath(route.path)}`;
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += sitemapHrefLangLinks(loc);
    xml += `    <lastmod>${mod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const post of posts) {
    const lastmod = (latestDateValue(post.updated_at, post.published_at) || today).split('T')[0];
    const postPath = canonicalPath(`/blog/${post.slug}`);
    const loc = `${SITE_URL}${postPath}`;
    const imageUrl = absoluteImageUrl(post.featured_image);
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += sitemapHrefLangLinks(loc);
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    if (imageUrl) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(post.title || post.slug)}</image:title>\n`;
      if (post.description) {
        xml += `      <image:caption>${escapeXml(post.description)}</image:caption>\n`;
      }
      xml += `    </image:image>\n`;
    }
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
  rss += `    <link>${SITE_URL}/blog/</link>\n`;
  rss += '    <description>Aktualności i porady finansowe dla przedsiębiorców - pożyczki hipoteczne, finansowanie biznesu, rozwój firm.</description>\n';
  rss += '    <language>pl</language>\n';
  rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
  rss += `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  for (const post of posts) {
    const pubDate = new Date(post.published_at).toUTCString();
    const postUrl = `${SITE_URL}${canonicalPath(`/blog/${post.slug}`)}`;
    rss += '    <item>\n';
    rss += `      <title>${escapeXml(post.title || post.slug)}</title>\n`;
    rss += `      <link>${postUrl}</link>\n`;
    rss += `      <guid isPermaLink="true">${postUrl}</guid>\n`;
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

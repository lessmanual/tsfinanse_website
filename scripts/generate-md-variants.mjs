import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach((line) => {
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
const DIST_DIR = resolve(process.cwd(), 'dist');

function canonicalPath(path) {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
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

function markdownOutputPath(routePath) {
  if (routePath === '/') return resolve(DIST_DIR, 'md', 'index.md');
  const normalised = routePath.endsWith('/') ? routePath.slice(0, -1) : routePath;
  return resolve(DIST_DIR, `md${normalised}.md`);
}

function canonicalUrl(routePath) {
  return `${SITE_URL}${canonicalPath(routePath)}`;
}

function frontmatter(fields) {
  const rows = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${JSON.stringify(String(value))}`);
  return `---\n${rows.join('\n')}\n---\n\n`;
}

function writeMarkdown(routePath, body) {
  const outputPath = markdownOutputPath(routePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${body.trim()}\n`, 'utf8');
}

async function getBlogPosts() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('  Supabase not configured - markdown variants will only include static pages');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('ts_finanse_posts')
    .select('slug, title, description, content, tags, category, author, published_at, updated_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('  Supabase error:', error.message);
    return [];
  }

  return (data || []).map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description || '',
    content: post.content || '',
    tags: post.tags || [],
    category: post.category || 'Finansowanie',
    author: post.author || 'TS Finanse',
    date: post.published_at,
    updatedAt: latestDateValue(post.updated_at, post.published_at),
  }));
}

function normalizeContentLinks(content = '', publishedSlugs = new Set()) {
  return String(content)
    .replace(/href=(["'])([^"']+)\1/gi, (_match, quote, href) => {
      return `href=${quote}${canonicalizeInternalUrl(href, publishedSlugs)}${quote}`;
    })
    .replace(/\]\(([^)]+)\)/g, (_match, href) => {
      return `](${canonicalizeInternalUrl(href, publishedSlugs)})`;
    });
}

function normalizeStaleTsFinansePricingClaims(content = '') {
  return String(content)
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

function normalizeArticleContent(content = '', publishedSlugs = new Set()) {
  return normalizeStaleTsFinansePricingClaims(normalizeContentLinks(content, publishedSlugs))
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
    .replace(/^#\s+/gm, '## ');
}

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

const relatedStopWords = new Set([
  'dla',
  'czy',
  'jak',
  'kiedy',
  'oraz',
  'firm',
  'firmy',
  '2026',
  'poradnik',
  'kompletny',
  'przewodnik',
]);

function relatedTerms(post = {}) {
  const raw = [
    post.title,
    post.category,
    ...(Array.isArray(post.tags) ? post.tags : []),
  ].join(' ');

  return new Set(raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4 && !relatedStopWords.has(term)));
}

function postTime(post = {}) {
  const value = Date.parse(post.updatedAt || post.date || '');
  return Number.isFinite(value) ? value : 0;
}

function selectRelatedPosts(currentPost, posts, limit = 4) {
  const currentTerms = relatedTerms(currentPost);
  const currentTags = new Set((currentPost.tags || []).map((tag) => String(tag).toLowerCase()));

  return posts
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      const candidateTerms = relatedTerms(candidate);
      const candidateTags = new Set((candidate.tags || []).map((tag) => String(tag).toLowerCase()));
      const sharedTerms = [...candidateTerms].filter((term) => currentTerms.has(term)).length;
      const sharedTags = [...candidateTags].filter((tag) => currentTags.has(tag)).length;
      const categoryScore = candidate.category && candidate.category === currentPost.category ? 20 : 0;
      const score = categoryScore + sharedTags * 8 + sharedTerms * 2;

      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || postTime(b.candidate) - postTime(a.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

function canonicalizeInternalUrl(rawUrl, publishedSlugs = new Set()) {
  if (!rawUrl) return rawUrl;
  const value = String(rawUrl).trim();
  if (!value || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:')) return rawUrl;
  if (/^(?:https?:)?\/\//i.test(value) && !value.startsWith(SITE_URL)) return rawUrl;

  try {
    const parsed = value.startsWith('http') ? new URL(value) : new URL(value, SITE_URL);
    if (parsed.origin !== SITE_URL) return rawUrl;
    const path = canonicalPath(parsed.pathname);
    const postSlug = path.startsWith('/blog/') ? normalizeSlug(path.replace(/^\/blog\//, '').replace(/\/$/, '')) : '';
    if (postSlug && !publishedSlugs.has(postSlug)) return '/blog/';
    return `${path}${parsed.search}${parsed.hash}`;
  } catch {
    return rawUrl;
  }
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(value = '') {
  return decodeEntities(String(value).replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function htmlToMarkdown(html = '') {
  return decodeEntities(String(html))
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_match, text) => `\n\n## ${stripTags(text)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_match, text) => `\n\n### ${stripTags(text)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_match, text) => `\n\n#### ${stripTags(text)}\n\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, text) => `\n\n${stripTags(text)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, text) => `\n- ${stripTags(text)}`)
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, text) => `[${stripTags(text)}](${href})`)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function contentToMarkdown(content = '') {
  const normalised = String(content).trim();
  if (!normalised) return '';
  if (normalised.startsWith('<')) return htmlToMarkdown(normalised);
  return normalised.replace(/\n{3,}/g, '\n\n').trim();
}

function staticPageMarkdown({ title, description, path, content }) {
  return `${frontmatter({
    title,
    description,
    canonical: canonicalUrl(path),
    content_type: 'WebPage',
  })}# ${title}

${description}

Źródło kanoniczne: ${canonicalUrl(path)}

${content}`;
}

function legalSourceMarkdown(sourceFile, fallback) {
  if (!existsSync(sourceFile)) return fallback;
  return readFileSync(sourceFile, 'utf8').trim();
}

function writeStaticPages(posts) {
  writeMarkdown('/', staticPageMarkdown({
    path: '/',
    title: 'TS Finanse - Pożyczki hipoteczne dla przedsiębiorców',
    description: 'Pożyczki dla firm pod zabezpieczenie hipoteczne od 1 do 20 mln PLN, z indywidualnie ustalanymi warunkami.',
    content: `## Co oferuje TS Finanse

TS Finanse finansuje przedsiębiorców pod zabezpieczenie hipoteczne. Oferta obejmuje pożyczki od 1 do 20 mln PLN, analizę wstępną w 24 godziny, decyzję nawet w 3 dni robocze oraz własny kapitał niezależny od banków.

## Dla kogo

- przedsiębiorcy z nieruchomością jako zabezpieczeniem,
- firmy finansujące inwestycje, zakup nieruchomości albo kapitał obrotowy,
- projekty, które wymagają indywidualnej analizy zamiast standardowej ścieżki bankowej.

## Najważniejsze fakty

- Kwota: 1-20 mln PLN.
- LTV: do 60% wartości nieruchomości.
- Okres: zwykle 12-36 miesięcy.
- Warunki kosztowe: ustalane indywidualnie i przedstawiane w ofercie przed podpisaniem umowy.

Kontakt: kontakt@tsfinanse.com, +48 506 711 242.`,
  }));

  writeMarkdown('/blog/', staticPageMarkdown({
    path: '/blog/',
    title: 'Blog TS Finanse',
    description: 'Porady i analizy o finansowaniu przedsiębiorców, pożyczkach hipotecznych, faktoringu, leasingu i płynności firm.',
    content: posts.map((post) => `- [${post.title}](${canonicalPath(`/blog/${post.slug}`)}) - ${post.description}`).join('\n'),
  }));

  writeMarkdown('/programpartnerski/', staticPageMarkdown({
    path: '/programpartnerski/',
    title: 'Program Partnerski TS Finanse',
    description: 'Program partnerski dla pośredników kredytowych, doradców finansowych, agentów nieruchomości i kancelarii.',
    content: `## Dla kogo

Program jest dla pośredników kredytowych, doradców finansowych, agentów nieruchomości i kancelarii, które pracują z przedsiębiorcami szukającymi finansowania pod zabezpieczenie hipoteczne.

## Zasady współpracy

Warunki współpracy są ustalane indywidualnie przed obsługą klienta. TS Finanse nie komunikuje publicznie stałej prowizji procentowej od wartości pożyczki.

Kontakt: kontakt@tsfinanse.com, +48 506 711 242.`,
  }));

  const legalPages = [
    ['/polityka-prywatnosci/', 'Polityka prywatności TS Finanse', 'polityka-prywatnosci.md'],
    ['/polityka-cookies/', 'Polityka cookies TS Finanse', 'polityka-cookies.md'],
    ['/regulamin/', 'Regulamin TS Finanse', 'regulamin.md'],
    ['/rodo/', 'Klauzula informacyjna RODO TS Finanse', 'klauzula-rodo.md'],
  ];

  for (const [path, title, source] of legalPages) {
    const content = legalSourceMarkdown(resolve(process.cwd(), source), `${title}\n\nŹródło kanoniczne: ${canonicalUrl(path)}`);
    writeMarkdown(path, staticPageMarkdown({
      path,
      title,
      description: title,
      content,
    }));
  }
}

function writeBlogPosts(posts) {
  const publishedSlugs = new Set(posts.map((post) => normalizeSlug(post.slug)).filter(Boolean));

  for (const post of posts) {
    const path = canonicalPath(`/blog/${post.slug}`);
    const markdownContent = contentToMarkdown(normalizeArticleContent(post.content, publishedSlugs));
    const relatedPosts = selectRelatedPosts(post, posts, 4);
    const relatedMarkdown = relatedPosts.length
      ? `\n\n## Powiązane artykuły\n\n${relatedPosts.map((item) => `- [${item.title}](${canonicalPath(`/blog/${item.slug}`)})`).join('\n')}`
      : '';
    const tags = Array.isArray(post.tags) && post.tags.length ? post.tags.join(', ') : '';
    const body = `${frontmatter({
      title: post.title,
      description: post.description,
      canonical: canonicalUrl(path),
      date_published: post.date,
      date_modified: post.updatedAt,
      author: post.author,
      category: post.category,
      tags,
      content_type: 'BlogPosting',
    })}# ${post.title}

${post.description}

Źródło kanoniczne: ${canonicalUrl(path)}

Autor: ${post.author}

Data publikacji: ${post.date ? post.date.slice(0, 10) : ''}

${markdownContent}${relatedMarkdown}`;

    writeMarkdown(path, body);
  }
}

async function main() {
  console.log('Generating markdown variants...');
  const posts = await getBlogPosts();
  writeStaticPages(posts);
  writeBlogPosts(posts);
  console.log(`Markdown variants generated with ${7 + posts.length} pages`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const root = process.cwd();
const sitemapPath = join(root, 'dist', 'sitemap.xml');
const edgeFunctionPath = join(root, 'netlify', 'edge-functions', 'markdown-negotiation.js');

const stalePatterns = [
  /Prowizja TS Finanse:?\s*1%/i,
  /Prowizja:\s*1%/i,
  /Prowizja 1%/i,
  /prowizja\s+1%\b/i,
  /1% od wartości pożyczki/i,
  /1% wartości pożyczki/i,
  /prowizja partnerska wynosi 1%/i,
  /Prowizja za udzielenie pożyczki wynosi 1%/i,
  /prowizja \(1%\)/i,
];

function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function htmlPathForUrl(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  return pathname === '/' ? join(root, 'dist', 'index.html') : join(root, 'dist', pathname, 'index.html');
}

function markdownPathForUrl(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  if (pathname === '/') return join(root, 'dist', 'md', 'index.md');
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return join(root, 'dist', `md${normalised}.md`);
}

function extractCanonical(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
}

function hasAlternateMarkdown(html, loc) {
  const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const relFirst = new RegExp(`<link[^>]+rel=["']alternate["'][^>]+type=["']text/markdown["'][^>]+href=["']${escaped}["']`, 'i');
  const hrefFirst = new RegExp(`<link[^>]+href=["']${escaped}["'][^>]+rel=["']alternate["'][^>]+type=["']text/markdown["']`, 'i');
  return relFirst.test(html) || hrefFirst.test(html);
}

function scanStale(content, loc, surface, hits) {
  for (const pattern of stalePatterns) {
    const match = content.match(pattern);
    if (match) hits.push({ loc, surface, pattern: pattern.toString(), sample: match[0] });
  }
}

async function verifyMarkdownEdgeFunction(failures) {
  if (!existsSync(edgeFunctionPath)) {
    failures.push({ type: 'missing-edge-function', file: edgeFunctionPath });
    return;
  }

  const source = readFileSync(edgeFunctionPath, 'utf8');
  const moduleUrl = `data:text/javascript,${encodeURIComponent(source)}#${Date.now()}`;
  const edge = await import(moduleUrl);

  const cases = [
    {
      url: 'https://tsfinanse.com/',
      accept: 'text/markdown',
      expectedPath: '/md/index.md',
    },
    {
      url: 'https://tsfinanse.com/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/',
      accept: 'text/markdown; q=1, text/html; q=0.8',
      expectedPath: '/md/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca.md',
    },
    {
      url: 'https://tsfinanse.com/sitemap.xml',
      accept: 'text/markdown',
      expectedPath: undefined,
    },
    {
      url: 'https://tsfinanse.com/blog/',
      accept: 'text/html',
      expectedPath: undefined,
    },
  ];

  for (const testCase of cases) {
    const result = edge.default(new Request(testCase.url, { headers: { accept: testCase.accept } }));
    const actualPath = result instanceof URL ? result.pathname : undefined;
    if (actualPath !== testCase.expectedPath) {
      failures.push({
        type: 'edge-markdown-mapping',
        url: testCase.url,
        accept: testCase.accept,
        expectedPath: testCase.expectedPath,
        actualPath,
      });
    }
  }
}

if (!existsSync(sitemapPath)) {
  console.error('dist/sitemap.xml does not exist. Run npm run build first.');
  process.exit(1);
}

const sitemap = readFileSync(sitemapPath, 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const failures = [];
const staleHits = [];

for (const loc of locs) {
  const url = new URL(loc);
  const expectedCanonical = `${SITE_URL}${canonicalPath(url.pathname)}`;
  const htmlPath = htmlPathForUrl(loc);
  const mdPath = markdownPathForUrl(loc);

  if (!existsSync(htmlPath)) {
    failures.push({ type: 'missing-html', loc });
    continue;
  }

  const html = readFileSync(htmlPath, 'utf8');
  const canonical = extractCanonical(html);
  if (canonical !== expectedCanonical) failures.push({ type: 'canonical', loc, canonical });
  if (!hasAlternateMarkdown(html, expectedCanonical)) failures.push({ type: 'missing-markdown-alternate', loc });
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) failures.push({ type: 'noindex', loc });

  const noscripts = (html.match(/<noscript\b/gi) || []).length;
  if (noscripts !== 1) failures.push({ type: 'noscript-count', loc, noscripts });

  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s !== 1) failures.push({ type: 'h1-count', loc, h1s });

  scanStale(html, loc, 'html', staleHits);

  if (!existsSync(mdPath)) {
    failures.push({ type: 'missing-markdown', loc });
    continue;
  }

  const markdown = readFileSync(mdPath, 'utf8');
  if (!markdown.includes(`canonical: "${expectedCanonical}"`)) failures.push({ type: 'markdown-canonical', loc });
  if (!/^#\s+.+/m.test(markdown)) failures.push({ type: 'markdown-h1', loc });
  scanStale(markdown, loc, 'markdown', staleHits);
}

await verifyMarkdownEdgeFunction(failures);

const result = {
  locCount: locs.length,
  failureCount: failures.length,
  staleHitCount: staleHits.length,
  failures: failures.slice(0, 20),
  staleHits: staleHits.slice(0, 20),
};

console.log(JSON.stringify(result, null, 2));

if (failures.length || staleHits.length) {
  process.exit(1);
}

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const root = process.cwd();
const sitemapPath = join(root, 'dist', 'sitemap.xml');
const robotsPath = join(root, 'dist', 'robots.txt');
const edgeFunctionPath = join(root, 'netlify', 'edge-functions', 'markdown-negotiation.js');

const expectedContentSignal = 'Content-Signal: search=yes, ai-train=no, ai-input=yes';

const robotsPolicy = {
  allowed: [
    'Googlebot',
    'Bingbot',
    'Applebot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Google-Extended',
  ],
  disallowed: [
    'GPTBot',
    'ClaudeBot',
    'anthropic-ai',
    'CCBot',
    'Applebot-Extended',
  ],
};

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

function extractMetaProperty(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, 'i'))?.[1];
}

function parseSitemapLastmods(sitemap) {
  return new Map([...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
    .map((match) => [match[1], match[2]]));
}

function datePart(value) {
  return String(value || '').slice(0, 10);
}

function normaliseBlogPostUrl(rawUrl, validBlogLocs) {
  try {
    const url = new URL(rawUrl, SITE_URL);
    if (url.origin !== SITE_URL) return undefined;
    if (!url.pathname.startsWith('/blog/') || url.pathname === '/blog/') return undefined;
    const candidate = `${SITE_URL}${canonicalPath(url.pathname)}`;
    return validBlogLocs.has(candidate) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

function extractHtmlBlogPostLinks(html, validBlogLocs, currentLoc) {
  return new Set([...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => normaliseBlogPostUrl(match[1], validBlogLocs))
    .filter((target) => target && target !== currentLoc));
}

function extractMarkdownBlogPostLinks(markdown, validBlogLocs, currentLoc) {
  return new Set([...markdown.matchAll(/\]\(([^)]+)\)/g)]
    .map((match) => normaliseBlogPostUrl(match[1], validBlogLocs))
    .filter((target) => target && target !== currentLoc));
}

function collectJsonLd(html, failures, loc) {
  const objects = [];
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1].trim());
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      for (const entry of entries) {
        objects.push(entry);
        if (entry && Array.isArray(entry['@graph'])) objects.push(...entry['@graph']);
      }
    } catch (error) {
      failures.push({ type: 'json-ld-parse', loc, message: error.message });
    }
  }

  return objects;
}

function verifyBlogFreshness({ html, markdown, loc, lastmod, failures }) {
  const objects = collectJsonLd(html, failures, loc);
  const blogPosting = objects.find((entry) => entry && entry['@type'] === 'BlogPosting');
  if (!blogPosting) {
    failures.push({ type: 'blogposting-schema', loc });
    return;
  }

  if (!blogPosting.datePublished) failures.push({ type: 'blogposting-date-published', loc });
  if (!blogPosting.dateModified) failures.push({ type: 'blogposting-date-modified', loc });
  if (lastmod && datePart(blogPosting.dateModified) !== lastmod) {
    failures.push({ type: 'blogposting-date-modified-lastmod', loc, dateModified: blogPosting.dateModified, lastmod });
  }

  const publishedMeta = extractMetaProperty(html, 'article:published_time');
  const modifiedMeta = extractMetaProperty(html, 'article:modified_time');
  if (!publishedMeta) failures.push({ type: 'article-published-meta', loc });
  if (!modifiedMeta) failures.push({ type: 'article-modified-meta', loc });
  if (lastmod && datePart(modifiedMeta) !== lastmod) {
    failures.push({ type: 'article-modified-meta-lastmod', loc, modifiedMeta, lastmod });
  }

  const markdownModified = markdown.match(/^date_modified:\s+"([^"]+)"/m)?.[1];
  if (!markdownModified) failures.push({ type: 'markdown-date-modified', loc });
  if (lastmod && datePart(markdownModified) !== lastmod) {
    failures.push({ type: 'markdown-date-modified-lastmod', loc, markdownModified, lastmod });
  }
}

function verifyBlogCrawlLinks({ html, markdown, loc, locs, failures }) {
  const validBlogLocs = new Set(locs.filter((item) => {
    const pathname = new URL(item).pathname;
    return pathname.startsWith('/blog/') && pathname !== '/blog/';
  }));
  const htmlLinks = extractHtmlBlogPostLinks(html, validBlogLocs, loc);
  const markdownLinks = extractMarkdownBlogPostLinks(markdown, validBlogLocs, loc);

  if (htmlLinks.size < 4) {
    failures.push({ type: 'blog-html-outgoing-links', loc, expectedMin: 4, actual: htmlLinks.size });
  }
  if (markdownLinks.size < 4) {
    failures.push({ type: 'blog-markdown-outgoing-links', loc, expectedMin: 4, actual: markdownLinks.size });
  }
}

function verifyBlogIndexSchema({ html, locs, failures }) {
  const loc = `${SITE_URL}/blog/`;
  const blogPostLocs = locs.filter((item) => {
    const pathname = new URL(item).pathname;
    return pathname.startsWith('/blog/') && pathname !== '/blog/';
  });

  const objects = collectJsonLd(html, failures, loc);
  const blog = objects.find((entry) => entry && entry['@type'] === 'Blog');
  const itemList = objects.find((entry) => entry && entry['@type'] === 'ItemList');

  if (!blog) {
    failures.push({ type: 'blog-index-schema', loc });
    return;
  }
  if (!Array.isArray(blog.blogPost)) {
    failures.push({ type: 'blog-index-blogpost-list', loc });
  } else if (blog.blogPost.length !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-blogpost-count', loc, expected: blogPostLocs.length, actual: blog.blogPost.length });
  }

  if (!itemList) {
    failures.push({ type: 'blog-index-itemlist-schema', loc });
    return;
  }
  if (itemList.numberOfItems !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-itemlist-count', loc, expected: blogPostLocs.length, actual: itemList.numberOfItems });
  }
  if (!Array.isArray(itemList.itemListElement)) {
    failures.push({ type: 'blog-index-itemlist-elements', loc });
  } else if (itemList.itemListElement.length !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-itemlist-element-count', loc, expected: blogPostLocs.length, actual: itemList.itemListElement.length });
  }
}

function scanStale(content, loc, surface, hits) {
  for (const pattern of stalePatterns) {
    const match = content.match(pattern);
    if (match) hits.push({ loc, surface, pattern: pattern.toString(), sample: match[0] });
  }
}

function parseRobotsGroups(robots) {
  const groups = [];
  let currentGroup;

  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '').trim();
    if (!line) continue;

    const directive = line.match(/^([^:]+):\s*(.*)$/);
    if (!directive) continue;

    const name = directive[1].toLowerCase();
    const value = directive[2].trim();

    if (name === 'user-agent') {
      if (!currentGroup || currentGroup.directives.length > 0) {
        currentGroup = { agents: [], directives: [] };
        groups.push(currentGroup);
      }
      currentGroup.agents.push(value);
      continue;
    }

    if (currentGroup && currentGroup.agents.length > 0) {
      currentGroup.directives.push({ name, value });
    }
  }

  return groups;
}

function hasRobotsDirective(groups, agent, directiveName, directiveValue) {
  const normalisedAgent = agent.toLowerCase();
  const normalisedDirective = directiveName.toLowerCase();

  return groups.some((group) => (
    group.agents.some((groupAgent) => groupAgent.toLowerCase() === normalisedAgent)
    && group.directives.some((directive) => (
      directive.name === normalisedDirective
      && directive.value === directiveValue
    ))
  ));
}

function verifyRobotsPolicy(failures) {
  if (!existsSync(robotsPath)) {
    failures.push({ type: 'missing-robots', file: robotsPath });
    return;
  }

  const robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes(expectedContentSignal)) {
    failures.push({ type: 'robots-content-signal', expected: expectedContentSignal });
  }

  const groups = parseRobotsGroups(robots);
  for (const userAgent of robotsPolicy.allowed) {
    if (!hasRobotsDirective(groups, userAgent, 'allow', '/')) {
      failures.push({ type: 'robots-allow', userAgent });
    }
  }

  for (const userAgent of robotsPolicy.disallowed) {
    if (!hasRobotsDirective(groups, userAgent, 'disallow', '/')) {
      failures.push({ type: 'robots-disallow', userAgent });
    }
    if (hasRobotsDirective(groups, userAgent, 'allow', '/')) {
      failures.push({ type: 'robots-conflicting-allow', userAgent });
    }
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
const sitemapLastmods = parseSitemapLastmods(sitemap);
const failures = [];
const staleHits = [];

verifyRobotsPolicy(failures);

for (const loc of locs) {
  const url = new URL(loc);
  const expectedCanonical = `${SITE_URL}${canonicalPath(url.pathname)}`;
  const isBlogPost = url.pathname.startsWith('/blog/') && url.pathname !== '/blog/';
  const isBlogIndex = url.pathname === '/blog/';
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

  if (isBlogPost) {
    verifyBlogFreshness({
      html,
      markdown,
      loc,
      lastmod: sitemapLastmods.get(loc),
      failures,
    });
    verifyBlogCrawlLinks({
      html,
      markdown,
      loc,
      locs,
      failures,
    });
  }

  if (isBlogIndex) {
    verifyBlogIndexSchema({ html, locs, failures });
  }
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

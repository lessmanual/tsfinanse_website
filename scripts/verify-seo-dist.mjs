import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const SITE_URL = 'https://tsfinanse.com';
const root = process.cwd();
const sourceSitemapPath = join(root, 'public', 'sitemap.xml');
const sitemapPath = join(root, 'dist', 'sitemap.xml');
const rssPath = join(root, 'dist', 'rss.xml');
const robotsPath = join(root, 'dist', 'robots.txt');
const headersPath = join(root, 'dist', '_headers');
const llmsPath = join(root, 'dist', 'llms.txt');
const netlifyTomlPath = join(root, 'netlify.toml');
const apiCatalogPath = join(root, 'dist', '.well-known', 'api-catalog');
const agentSkillsIndexPath = join(root, 'dist', '.well-known', 'agent-skills', 'index.json');
const edgeFunctionPath = join(root, 'netlify', 'edge-functions', 'markdown-negotiation.js');
const notFoundPath = join(root, 'dist', '404.html');
const adminIndexPath = join(root, 'dist', 'admin', 'index.html');
const indexNowKeyFilePattern = /^[A-Za-z0-9_-]{8,128}\.txt$/;

const EXPECTED_LOC_COUNT = 73;
const expectedContentSignal = 'Content-Signal: search=yes, ai-train=no, ai-input=yes';
const minimumSitemapLastmodDate = '2026-06-27';
const minimumLlmsUpdatedDate = '2026-06-01';
const minMetaTitleLength = 20;
const maxMetaTitleLength = 70;
const minMetaDescriptionLength = 70;
const maxMetaDescriptionLength = 180;
const minAnswerBlockLength = 70;
const maxAnswerBlockLength = 360;
const minArticleTocLinks = 2;
const officialReferenceUrls = [
  'https://www.knf.gov.pl/dla_konsumenta/ostrzezenia_publiczne',
  'https://uokik.gov.pl/',
  'https://www.biznes.gov.pl/pl/portal/00120',
  'https://prs.ms.gov.pl/krs',
];
const websiteSchemaId = `${SITE_URL}/#website`;
const websiteSearchUrlTemplate = `${SITE_URL}/blog/?q={search_term_string}`;
const editorialTrustFragments = [
  'TS Finanse',
  '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
  'kontakt@tsfinanse.com',
  'warunki finansowania są ustalane indywidualnie',
];

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
    'Perplexity-User',
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

function markdownUrlForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return `${SITE_URL}/md/index.md`;
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${SITE_URL}/md${normalised}.md`;
}

function indexHtmlRedirectPathForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return '/index.html';
  return `${canonicalPath(pathname)}index.html`;
}

function redirectTargetForLoc(loc) {
  return new URL(loc).pathname;
}

function noSlashRedirectPathForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return undefined;
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function collectMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) return collectMarkdownFiles(path);
      return path.endsWith('.md') ? [path] : [];
    });
}

function collectHtmlFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) return collectHtmlFiles(path);
      return path.endsWith('.html') ? [path] : [];
    });
}

function collectDistPaths(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) return [path, ...collectDistPaths(path)];
      return [path];
    });
}

function readIndexNowKeyCandidates(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((fileName) => indexNowKeyFilePattern.test(fileName))
    .map((fileName) => {
      const path = join(dir, fileName);
      return {
        fileName,
        key: fileName.replace(/\.txt$/, ''),
        content: readFileSync(path, 'utf8').trim(),
        path,
      };
    });
}

function parseRedirectRules(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });
}

function hasRedirectRule(rules, { from, to, status = '301' }) {
  return rules.some((rule) => rule.from === from && rule.to === to && rule.status === status);
}

function verifyCanonicalRedirectRules({ locs, failures }) {
  if (!existsSync(headersPath)) {
    failures.push({ type: 'missing-headers', file: headersPath });
  }

  const redirectsPath = join(root, 'dist', '_redirects');
  if (!existsSync(redirectsPath)) {
    failures.push({ type: 'missing-redirects', file: redirectsPath });
    return;
  }

  const rules = parseRedirectRules(readFileSync(redirectsPath, 'utf8'));
  for (const rule of rules) {
    if (rule.from === '/*' && rule.status === '200' && /index\.html|^\/$/.test(rule.to || '')) {
      failures.push({ type: 'spa-fallback-soft-404-risk', rule });
    }
  }

  for (const loc of locs) {
    const expected = {
      from: indexHtmlRedirectPathForLoc(loc),
      to: redirectTargetForLoc(loc),
      status: '301',
    };
    if (!hasRedirectRule(rules, expected)) {
      failures.push({ type: 'index-html-canonical-redirect-rule', ...expected });
    }
  }

  for (const loc of locs) {
    const from = noSlashRedirectPathForLoc(loc);
    if (!from) continue;

    const expected = {
      from,
      to: redirectTargetForLoc(loc),
      status: '301',
    };
    if (!hasRedirectRule(rules, expected)) {
      failures.push({ type: 'no-slash-canonical-redirect-rule', ...expected });
    }
  }

  for (const expected of [
    { from: '/kontakt', to: '/#contact', status: '301' },
    { from: '/kontakt/', to: '/#contact', status: '301' },
  ]) {
    if (!hasRedirectRule(rules, expected)) {
      failures.push({ type: 'contact-alias-redirect-rule', ...expected });
    }
  }
}

function extractCanonical(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
}

function extractTitle(html) {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
}

function hasAlternateMarkdown(html, markdownUrl) {
  const escaped = markdownUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const relFirst = new RegExp(`<link[^>]+rel=["']alternate["'][^>]+type=["']text/markdown["'][^>]+href=["']${escaped}["']`, 'i');
  const hrefFirst = new RegExp(`<link[^>]+href=["']${escaped}["'][^>]+rel=["']alternate["'][^>]+type=["']text/markdown["']`, 'i');
  return relFirst.test(html) || hrefFirst.test(html);
}

function hasAlternateHrefLang(html, hrefLang, href) {
  const escapedHrefLang = hrefLang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const relFirst = new RegExp(`<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${escapedHrefLang}["'][^>]+href=["']${escapedHref}["']`, 'i');
  const hrefFirst = new RegExp(`<link[^>]+href=["']${escapedHref}["'][^>]+rel=["']alternate["'][^>]+hreflang=["']${escapedHrefLang}["']`, 'i');
  return relFirst.test(html) || hrefFirst.test(html);
}

function hasAlternateRss(html) {
  return /<link[^>]+rel=["']alternate["'][^>]+type=["']application\/rss\+xml["'][^>]+href=["']https:\/\/tsfinanse\.com\/rss\.xml["']/i.test(html)
    || /<link[^>]+href=["']https:\/\/tsfinanse\.com\/rss\.xml["'][^>]+rel=["']alternate["'][^>]+type=["']application\/rss\+xml["']/i.test(html);
}

function extractMetaProperty(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, 'i'))?.[1];
}

function extractMetaName(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["']`, 'i'))?.[1];
}

function hasNoindexNofollow(value = '') {
  const tokens = String(value).toLowerCase().split(',').map((token) => token.trim());
  return tokens.includes('noindex') && tokens.includes('nofollow');
}

function verifyNotFoundArtifact(failures) {
  if (!existsSync(notFoundPath)) {
    failures.push({ type: 'missing-not-found-artifact', file: notFoundPath });
    return;
  }

  const html = readFileSync(notFoundPath, 'utf8');
  const robots = extractMetaName(html, 'robots') || '';
  if (!hasNoindexNofollow(robots)) {
    failures.push({ type: 'not-found-robots', file: notFoundPath, robots });
  }

  const canonical = extractCanonical(html);
  if (canonical) {
    failures.push({ type: 'not-found-canonical', file: notFoundPath, canonical });
  }

  const title = extractTitle(html) || '';
  if (!title.includes('Nie znaleziono strony') || !title.includes('TS Finanse')) {
    failures.push({ type: 'not-found-title', file: notFoundPath, title });
  }

  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s !== 1) {
    failures.push({ type: 'not-found-h1-count', file: notFoundPath, h1s });
  }

  if (!/<a\b[^>]+href=["']\/["']/i.test(html)) {
    failures.push({ type: 'not-found-home-link', file: notFoundPath });
  }
}

function verifyAdminSurface(failures) {
  if (!existsSync(adminIndexPath)) {
    failures.push({ type: 'missing-admin-artifact', file: adminIndexPath });
    return;
  }

  const html = readFileSync(adminIndexPath, 'utf8');
  const robots = extractMetaName(html, 'robots') || '';
  if (!hasNoindexNofollow(robots)) {
    failures.push({ type: 'admin-robots', file: adminIndexPath, robots });
  }

  const canonical = extractCanonical(html);
  if (canonical) {
    failures.push({ type: 'admin-canonical', file: adminIndexPath, canonical });
  }

  const headers = existsSync(headersPath) ? readFileSync(headersPath, 'utf8') : '';
  const adminBlock = extractNetlifyHeaderBlock(headers, '/admin/*').toLowerCase();
  const requiredAdminHeaders = [
    'x-robots-tag: noindex, nofollow',
    'cache-control: no-store',
  ];

  for (const requiredAdminHeader of requiredAdminHeaders) {
    if (!adminBlock.includes(requiredAdminHeader)) {
      failures.push({ type: 'admin-header-policy', expected: requiredAdminHeader });
    }
  }
}

function rememberSnippetValue(map, value, loc) {
  if (!value) return;
  map.set(value, [...(map.get(value) || []), loc]);
}

function verifySnippetMetadata({ html, loc, failures, titlesByValue, descriptionsByValue }) {
  const title = extractTitle(html) || '';
  const metaTitle = extractMetaName(html, 'title') || '';
  const description = extractMetaName(html, 'description') || '';
  const ogTitle = extractMetaProperty(html, 'og:title') || '';
  const ogDescription = extractMetaProperty(html, 'og:description') || '';
  const twitterTitle = extractMetaName(html, 'twitter:title') || '';
  const twitterDescription = extractMetaName(html, 'twitter:description') || '';

  if (title.length < minMetaTitleLength || title.length > maxMetaTitleLength) {
    failures.push({ type: 'snippet-title-length', loc, length: title.length, title });
  }
  if (description.length < minMetaDescriptionLength || description.length > maxMetaDescriptionLength) {
    failures.push({ type: 'snippet-description-length', loc, length: description.length, description });
  }
  if (metaTitle !== title) failures.push({ type: 'snippet-meta-title-mismatch', loc, title, metaTitle });
  if (ogTitle !== title) failures.push({ type: 'snippet-og-title-mismatch', loc, title, ogTitle });
  if (ogDescription !== description) failures.push({ type: 'snippet-og-description-mismatch', loc });
  if (twitterTitle !== title) failures.push({ type: 'snippet-twitter-title-mismatch', loc, title, twitterTitle });
  if (twitterDescription !== description) failures.push({ type: 'snippet-twitter-description-mismatch', loc });

  rememberSnippetValue(titlesByValue, title, loc);
  rememberSnippetValue(descriptionsByValue, description, loc);
}

function verifyUniqueSnippetMetadata({ titlesByValue, descriptionsByValue, failures }) {
  for (const [title, locs] of titlesByValue.entries()) {
    if (locs.length > 1) failures.push({ type: 'snippet-title-duplicate', title, locs });
  }
  for (const [description, locs] of descriptionsByValue.entries()) {
    if (locs.length > 1) failures.push({ type: 'snippet-description-duplicate', description, locs });
  }
}

function extractAnswerBlockText(html) {
  const block = html.match(/<section[^>]+data-ai-answer=["']summary["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] || '';
  const answer = block.match(/Krótka odpowiedź:<\/strong>\s*([^<]+)/i)?.[1]?.trim() || '';
  const sections = [...block.matchAll(/<li>([^<]+)<\/li>/gi)].map((match) => match[1].trim());

  return { answer, sections };
}

function verifyAnswerBlock({ html, markdown, loc, failures }) {
  const url = new URL(loc);
  const isBlogPost = url.pathname.startsWith('/blog/') && url.pathname !== '/blog/';
  if (!isBlogPost) return;

  const { answer, sections } = extractAnswerBlockText(html);
  if (!answer) {
    failures.push({ type: 'answer-block-missing', loc });
  } else if (answer.length < minAnswerBlockLength || answer.length > maxAnswerBlockLength) {
    failures.push({ type: 'answer-block-length', loc, length: answer.length, answer });
  }
  if (sections.length === 0) failures.push({ type: 'answer-block-sections', loc });
  if (!/^## W skrócie\s+[\s\S]*\*\*Krótka odpowiedź:\*\*/m.test(markdown)) {
    failures.push({ type: 'answer-block-markdown-missing', loc });
  }
  if (answer && !markdown.includes(answer)) {
    failures.push({ type: 'answer-block-markdown-mismatch', loc });
  }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractArticleTocLinks(html) {
  const block = html.match(/<nav[^>]+data-ai-toc=["']article["'][^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
  return [...block.matchAll(/<a[^>]+href=["'](#[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: match[1].trim(),
      title: stripHtml(match[2]),
    }));
}

function extractMarkdownArticleTocLinks(markdown) {
  const start = markdown.indexOf('## Spis treści');
  if (start === -1) return [];

  const afterHeading = markdown.slice(start).replace(/^## Spis treści[^\n]*\n+/, '');
  const stops = ['\nŹródło kanoniczne:', '\nAutor:']
    .map((marker) => afterHeading.indexOf(marker))
    .filter((index) => index >= 0);
  const block = stops.length > 0 ? afterHeading.slice(0, Math.min(...stops)) : afterHeading;

  return [...block.matchAll(/\]\((#[^)]+)\)/g)].map((match) => match[1].trim());
}

function htmlHasId(html, id) {
  const escaped = escapeRegExp(id);
  return new RegExp(`<h[2-3][^>]+id=["']${escaped}["']`, 'i').test(html);
}

function verifyArticleToc({ html, markdown, loc, failures }) {
  const url = new URL(loc);
  const isBlogPost = url.pathname.startsWith('/blog/') && url.pathname !== '/blog/';
  if (!isBlogPost) return;

  const tocLinks = extractArticleTocLinks(html);
  if (tocLinks.length < minArticleTocLinks) {
    failures.push({ type: 'article-toc-links', loc, expectedMin: minArticleTocLinks, actual: tocLinks.length });
  }

  for (const link of tocLinks) {
    if (!/^#[a-z0-9-]+$/.test(link.href)) {
      failures.push({ type: 'article-toc-invalid-anchor', loc, href: link.href });
      continue;
    }
    if (!htmlHasId(html, link.href.slice(1))) {
      failures.push({ type: 'article-toc-missing-heading-id', loc, href: link.href, title: link.title });
    }
  }

  const markdownLinks = extractMarkdownArticleTocLinks(markdown);
  if (markdownLinks.length < minArticleTocLinks) {
    failures.push({ type: 'article-toc-markdown-links', loc, expectedMin: minArticleTocLinks, actual: markdownLinks.length });
  }
  for (const link of tocLinks) {
    if (!markdownLinks.includes(link.href)) {
      failures.push({ type: 'article-toc-markdown-mismatch', loc, href: link.href });
    }
  }
}

function extractOfficialReferenceLinksFromHtml(html) {
  const block = html.match(/<section[^>]+data-ai-sources=["']official["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] || '';
  return new Set([...block.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)].map((match) => match[1].trim()));
}

function extractOfficialReferenceLinksFromMarkdown(markdown) {
  const start = markdown.indexOf('## Źródła i weryfikacja');
  if (start === -1) return new Set();
  const section = markdown.slice(start);
  const nextSection = section.slice(1).search(/\n##\s+/);
  const block = nextSection >= 0 ? section.slice(0, nextSection + 1) : section;
  return new Set([...block.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1].trim()));
}

function verifyOfficialReferences({ html, markdown, loc, failures }) {
  const url = new URL(loc);
  const isBlogPost = url.pathname.startsWith('/blog/') && url.pathname !== '/blog/';
  if (!isBlogPost) return;

  const htmlLinks = extractOfficialReferenceLinksFromHtml(html);
  const markdownLinks = extractOfficialReferenceLinksFromMarkdown(markdown);
  const objects = collectJsonLd(html, failures, loc);
  const blogPosting = objects.find((entry) => entry && entry['@type'] === 'BlogPosting');
  const citations = Array.isArray(blogPosting?.citation) ? blogPosting.citation : [];

  for (const referenceUrl of officialReferenceUrls) {
    if (!htmlLinks.has(referenceUrl)) {
      failures.push({ type: 'official-reference-html-link', loc, referenceUrl });
    }
    if (!markdownLinks.has(referenceUrl)) {
      failures.push({ type: 'official-reference-markdown-link', loc, referenceUrl });
    }
    if (!citations.includes(referenceUrl)) {
      failures.push({ type: 'official-reference-citation', loc, referenceUrl });
    }
  }
}

function extractEditorialTrustTextFromHtml(html) {
  const block = html.match(/<section[^>]+data-ai-author=["']editorial["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] || '';
  return stripHtml(block)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractEditorialTrustTextFromMarkdown(markdown) {
  const start = markdown.indexOf('## Autor i weryfikacja merytoryczna');
  if (start === -1) return '';
  const section = markdown.slice(start);
  const nextSection = section.slice(1).search(/\n##\s+/);
  return nextSection >= 0 ? section.slice(0, nextSection + 1) : section;
}

function verifyBlogEditorialTrust({ html, markdown, loc, failures }) {
  const url = new URL(loc);
  const isBlogPost = url.pathname.startsWith('/blog/') && url.pathname !== '/blog/';
  if (!isBlogPost) return;

  const htmlTrustText = extractEditorialTrustTextFromHtml(html);
  const markdownTrustText = extractEditorialTrustTextFromMarkdown(markdown);
  for (const fragment of editorialTrustFragments) {
    if (!htmlTrustText.includes(fragment)) {
      failures.push({ type: 'blog-editorial-trust-html', loc, fragment });
    }
    if (!markdownTrustText.includes(fragment)) {
      failures.push({ type: 'blog-editorial-trust-markdown', loc, fragment });
    }
  }

  const objects = collectJsonLd(html, failures, loc);
  const blogPosting = objects.find((entry) => entry && entry['@type'] === 'BlogPosting');
  if (!blogPosting) return;

  const author = blogPosting.author || {};
  if (
    author['@type'] !== 'Organization'
    || author.name !== 'TS Finanse'
    || author.legalName !== '"TRANSBUD" NOWAK SPÓŁKA JAWNA'
    || author.url !== SITE_URL
    || author.email !== 'kontakt@tsfinanse.com'
  ) {
    failures.push({ type: 'blog-editorial-trust-author', loc, author });
  }

  const reviewedBy = blogPosting.reviewedBy || {};
  if (
    reviewedBy['@type'] !== 'Organization'
    || reviewedBy.name !== 'TS Finanse'
    || reviewedBy.legalName !== '"TRANSBUD" NOWAK SPÓŁKA JAWNA'
    || reviewedBy.url !== SITE_URL
  ) {
    failures.push({ type: 'blog-editorial-trust-reviewed-by', loc, reviewedBy });
  }

  const copyrightHolder = blogPosting.copyrightHolder || {};
  if (copyrightHolder['@type'] !== 'Organization' || copyrightHolder.name !== 'TS Finanse') {
    failures.push({ type: 'blog-editorial-trust-copyright-holder', loc, copyrightHolder });
  }
}

function parseSitemapLastmods(sitemap) {
  const lastmods = new Map();
  const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);

  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (loc && lastmod) lastmods.set(loc, lastmod);
  }

  return lastmods;
}

function verifySitemapLastmods({ sitemapLastmods, locs, failures }) {
  for (const loc of locs) {
    const lastmod = sitemapLastmods.get(loc);
    if (!lastmod) {
      failures.push({ type: 'sitemap-lastmod-missing', loc });
      continue;
    }
    if (datePart(lastmod) < minimumSitemapLastmodDate) {
      failures.push({ type: 'sitemap-lastmod-stale', loc, lastmod, minimum: minimumSitemapLastmodDate });
    }
  }
}

function parseSitemapImages(sitemap) {
  const images = new Map();
  const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);

  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const imageLocs = [...block.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((match) => match[1]);
    images.set(loc, imageLocs);
  }

  return images;
}

function extractXmlAttribute(tag, attribute) {
  return tag.match(new RegExp(`${attribute}="([^"]+)"`))?.[1];
}

function parseSitemapHrefLangs(sitemap) {
  const links = new Map();
  const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);

  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    links.set(loc, [...block.matchAll(/<xhtml:link\b[^>]*\/?>/g)].map((match) => ({
      rel: extractXmlAttribute(match[0], 'rel'),
      hreflang: extractXmlAttribute(match[0], 'hreflang'),
      href: extractXmlAttribute(match[0], 'href'),
    })));
  }

  return links;
}

function datePart(value) {
  return String(value || '').slice(0, 10);
}

function isChronologicallyBefore(value, baseline) {
  const valueTime = Date.parse(value || '');
  const baselineTime = Date.parse(baseline || '');
  return Number.isFinite(valueTime) && Number.isFinite(baselineTime) && valueTime < baselineTime;
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

function verifyMarkdownCanonicalLinks({ markdown, loc, failures }) {
  const links = [...markdown.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1].trim());

  for (const href of links) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/')) {
      failures.push({ type: 'markdown-relative-internal-link', loc, href });
      continue;
    }

    try {
      const url = new URL(href);
      if (url.origin === SITE_URL) {
        const canonical = `${SITE_URL}${canonicalPath(url.pathname)}${url.search}${url.hash}`;
        if (href !== canonical) {
          failures.push({ type: 'markdown-noncanonical-internal-link', loc, href, canonical });
        }
      }
    } catch {
      failures.push({ type: 'markdown-invalid-link', loc, href });
    }
  }
}

function verifyHtmlInternalLinks({ html, loc, locs, failures }) {
  const locSet = new Set(locs);
  const allowedFiles = new Set([
    '/robots.txt',
    '/sitemap.xml',
    '/rss.xml',
    '/llms.txt',
    '/BF7B57E849D44AF48F0B5D95B0D5B154.txt',
  ]);
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1].trim());

  for (const href of anchors) {
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('#')) {
      if (!htmlHasId(html, href.slice(1))) {
        failures.push({ type: 'html-internal-link-missing-hash-target', loc, href });
      }
      continue;
    }
    if (/^(javascript:|data:)/i.test(href)) {
      failures.push({ type: 'html-internal-link-unsafe-scheme', loc, href });
      continue;
    }

    let url;
    try {
      url = new URL(href, loc);
    } catch {
      failures.push({ type: 'html-internal-link-invalid-url', loc, href });
      continue;
    }

    if (url.origin !== SITE_URL) continue;

    const pathname = decodeURIComponent(url.pathname);
    if (
      allowedFiles.has(pathname)
      || pathname.startsWith('/assets/')
      || pathname.startsWith('/uploads/')
      || pathname.startsWith('/.well-known/')
      || pathname.startsWith('/md/')
    ) {
      continue;
    }

    const canonical = `${SITE_URL}${canonicalPath(pathname)}`;
    if (!locSet.has(canonical)) {
      failures.push({ type: 'html-internal-link-not-in-sitemap', loc, href, canonical });
      continue;
    }

    if (url.search) {
      failures.push({ type: 'html-internal-link-query', loc, href });
      continue;
    }

    const expectedHref = `${canonical}${url.hash}`;
    if (href !== expectedHref) {
      failures.push({ type: 'html-internal-link-noncanonical', loc, href, expectedHref });
    }
    if (url.hash && canonical === loc && !htmlHasId(html, url.hash.slice(1))) {
      failures.push({ type: 'html-internal-link-missing-hash-target', loc, href });
    }
  }
}

const minBlogFaqEntries = 3;
const maxBlogFaqEntries = 8;

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMarkdown(value = '') {
  return stripHtml(value)
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanFaqQuestion(value = '') {
  return stripHtml(value)
    .replace(/^Q:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanFaqAnswer(value = '') {
  const answer = stripMarkdown(value);
  return answer.length > 700 ? `${answer.slice(0, 697).trim()}...` : answer;
}

function expectedFaqEntry(question, answer) {
  const cleanedQuestion = cleanFaqQuestion(question);
  const cleanedAnswer = cleanFaqAnswer(answer);

  if (!cleanedQuestion.includes('?')) return undefined;
  if (cleanedQuestion.length < 12 || cleanedAnswer.length < 40) return undefined;

  return { question: cleanedQuestion, answer: cleanedAnswer };
}

function extractExpectedFaqEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^#{2,4}\s+(.+\?)\s*$/);
    if (!heading) continue;

    const answerLines = [];
    for (let answerIndex = index + 1; answerIndex < lines.length; answerIndex += 1) {
      if (/^#{1,4}\s+/.test(lines[answerIndex])) break;
      answerLines.push(lines[answerIndex]);
    }

    const entry = expectedFaqEntry(heading[1], answerLines.join(' '));
    if (entry) entries.push(entry);
  }

  const seen = new Set();
  return entries.filter((entry) => {
    const key = entry.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, maxBlogFaqEntries);
}

function isAbsoluteHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
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

function verifyBreadcrumbSchema({ html, loc, failures }) {
  const objects = collectJsonLd(html, failures, loc);
  const breadcrumb = objects.find((entry) => entry && entry['@type'] === 'BreadcrumbList');
  if (!breadcrumb) {
    failures.push({ type: 'breadcrumb-schema-missing', loc });
    return;
  }

  const items = Array.isArray(breadcrumb.itemListElement) ? breadcrumb.itemListElement : [];
  if (!items.length) {
    failures.push({ type: 'breadcrumb-schema-empty', loc });
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  if (first?.item !== `${SITE_URL}/`) {
    failures.push({ type: 'breadcrumb-schema-first-item', loc, actual: first?.item });
  }
  if (last?.item !== loc) {
    failures.push({ type: 'breadcrumb-schema-last-item', loc, expected: loc, actual: last?.item });
  }

  items.forEach((item, index) => {
    const expectedPosition = index + 1;
    if (item?.['@type'] !== 'ListItem') {
      failures.push({ type: 'breadcrumb-schema-item-type', loc, position: expectedPosition, actual: item?.['@type'] });
    }
    if (item?.position !== expectedPosition) {
      failures.push({ type: 'breadcrumb-schema-position', loc, expected: expectedPosition, actual: item?.position });
    }
    if (typeof item?.name !== 'string' || !item.name.trim()) {
      failures.push({ type: 'breadcrumb-schema-name', loc, position: expectedPosition });
    }
  });
}

function verifyWebPageSchema({ html, loc, failures }) {
  const objects = collectJsonLd(html, failures, loc);
  const webPage = objects.find((entry) => entry && entry['@type'] === 'WebPage' && entry.url === loc);

  if (!webPage) {
    failures.push({ type: 'webpage-schema-missing', loc });
    return;
  }

  if (webPage['@id'] !== `${loc}#webpage`) {
    failures.push({ type: 'webpage-schema-id', loc, actual: webPage['@id'] });
  }
  if (webPage.inLanguage !== 'pl-PL') {
    failures.push({ type: 'webpage-schema-language', loc, inLanguage: webPage.inLanguage });
  }
  if (typeof webPage.name !== 'string' || webPage.name.length < minMetaTitleLength || webPage.name.length > maxMetaTitleLength) {
    failures.push({ type: 'webpage-schema-name', loc, name: webPage.name });
  }
  if (typeof webPage.description !== 'string' || webPage.description.length < minMetaDescriptionLength || webPage.description.length > maxMetaDescriptionLength) {
    failures.push({ type: 'webpage-schema-description', loc, description: webPage.description });
  }
  if (webPage.isPartOf?.['@id'] !== `${SITE_URL}/#website`) {
    failures.push({ type: 'webpage-schema-is-part-of', loc, isPartOf: webPage.isPartOf });
  }
  if (webPage.publisher?.name !== 'TS Finanse') {
    failures.push({ type: 'webpage-schema-publisher', loc, publisher: webPage.publisher });
  }
  if (webPage.breadcrumb?.['@id'] !== `${loc}#breadcrumb`) {
    failures.push({ type: 'webpage-schema-breadcrumb', loc, breadcrumb: webPage.breadcrumb });
  }
}

function verifyWebSiteSearchSchema({ html, loc, failures }) {
  const objects = collectJsonLd(html, failures, loc);
  const webSite = objects.find((entry) => entry && entry['@type'] === 'WebSite' && entry.url === SITE_URL);
  if (!webSite) {
    failures.push({ type: 'website-schema-missing', loc });
    return;
  }

  if (webSite['@id'] !== websiteSchemaId) {
    failures.push({ type: 'website-schema-id', loc, actual: webSite['@id'], expected: websiteSchemaId });
  }
  if (webSite.name !== 'TS Finanse') {
    failures.push({ type: 'website-schema-name', loc, actual: webSite.name });
  }
  if (webSite.inLanguage !== 'pl-PL') {
    failures.push({ type: 'website-schema-language', loc, actual: webSite.inLanguage });
  }

  const action = webSite.potentialAction || {};
  const target = action.target || {};
  if (action['@type'] !== 'SearchAction') {
    failures.push({ type: 'website-search-action-type', loc, actual: action['@type'] });
  }
  if (target['@type'] !== 'EntryPoint' || target.urlTemplate !== websiteSearchUrlTemplate) {
    failures.push({ type: 'website-search-action-target', loc, target, expected: websiteSearchUrlTemplate });
  }
  if (action['query-input'] !== 'required name=search_term_string') {
    failures.push({ type: 'website-search-action-query-input', loc, actual: action['query-input'] });
  }
}

function verifyBlogSearchForm({ html, loc, failures }) {
  if (new URL(loc).pathname !== '/blog/') return;

  const form = html.match(/<form\b[^>]*role=["']search["'][^>]*>[\s\S]*?<\/form>/i)?.[0] || '';
  if (!form) {
    failures.push({ type: 'blog-search-form-missing', loc });
    return;
  }
  if (!/\bmethod=["']get["']/i.test(form)) {
    failures.push({ type: 'blog-search-form-method', loc });
  }
  if (!/\baction=["']\/blog\/["']/i.test(form)) {
    failures.push({ type: 'blog-search-form-action', loc });
  }
  if (!/<input\b[^>]*type=["']search["'][^>]*name=["']q["'][^>]*>/i.test(form)
    && !/<input\b[^>]*name=["']q["'][^>]*type=["']search["'][^>]*>/i.test(form)) {
    failures.push({ type: 'blog-search-input', loc });
  }
}

function verifyBlogImageSignals({ html, loc, sitemapImages, failures }) {
  const objects = collectJsonLd(html, failures, loc);
  const blogPosting = objects.find((entry) => entry && entry['@type'] === 'BlogPosting');
  const sitemapImageLocs = sitemapImages.get(loc) || [];
  const sitemapImage = sitemapImageLocs[0];
  const ogImage = extractMetaProperty(html, 'og:image');
  const twitterImage = extractMetaName(html, 'twitter:image');
  const blogPostingImage = typeof blogPosting?.image === 'string' ? blogPosting.image : undefined;

  if (sitemapImageLocs.length !== 1) {
    failures.push({ type: 'blog-sitemap-image-count', loc, actual: sitemapImageLocs.length });
  }

  for (const [surface, imageUrl] of [
    ['sitemap', sitemapImage],
    ['og', ogImage],
    ['twitter', twitterImage],
    ['blogposting', blogPostingImage],
  ]) {
    if (!imageUrl || !isAbsoluteHttpUrl(imageUrl)) {
      failures.push({ type: 'blog-image-absolute-url', loc, surface, imageUrl });
    }
  }

  if (sitemapImage && ogImage && sitemapImage !== ogImage) {
    failures.push({ type: 'blog-image-og-sitemap', loc, sitemapImage, ogImage });
  }
  if (sitemapImage && twitterImage && sitemapImage !== twitterImage) {
    failures.push({ type: 'blog-image-twitter-sitemap', loc, sitemapImage, twitterImage });
  }
  if (sitemapImage && blogPostingImage && sitemapImage !== blogPostingImage) {
    failures.push({ type: 'blog-image-schema-sitemap', loc, sitemapImage, blogPostingImage });
  }

  if (sitemapImage?.startsWith(SITE_URL)) {
    const imagePath = join(root, 'dist', decodeURIComponent(new URL(sitemapImage).pathname));
    if (!existsSync(imagePath)) {
      failures.push({ type: 'blog-image-file', loc, imageUrl: sitemapImage, file: imagePath });
    }
  }
}

function verifySitemapHrefLangs({ sitemap, locs, failures }) {
  if (!sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) {
    failures.push({ type: 'sitemap-xhtml-namespace' });
  }

  const hreflangByLoc = parseSitemapHrefLangs(sitemap);
  for (const loc of locs) {
    const links = hreflangByLoc.get(loc) || [];
    const hasPl = links.some((link) => link.rel === 'alternate' && link.hreflang === 'pl-PL' && link.href === loc);
    const hasDefault = links.some((link) => link.rel === 'alternate' && link.hreflang === 'x-default' && link.href === loc);
    if (!hasPl) failures.push({ type: 'sitemap-hreflang-pl', loc });
    if (!hasDefault) failures.push({ type: 'sitemap-hreflang-default', loc });
  }
}

function verifyBlogFaqSchema({ html, markdown, loc, failures }) {
  const expectedEntries = extractExpectedFaqEntries(markdown);
  const objects = collectJsonLd(html, failures, loc);
  const faqPage = objects.find((entry) => entry && entry['@type'] === 'FAQPage' && entry.url === loc);

  if (expectedEntries.length < minBlogFaqEntries) {
    if (faqPage) failures.push({ type: 'blog-faq-schema-unexpected', loc, expectedEntries: expectedEntries.length });
    return;
  }

  if (!faqPage) {
    failures.push({ type: 'blog-faq-schema', loc, expectedEntries: expectedEntries.length });
    return;
  }
  if (faqPage.inLanguage !== 'pl-PL') failures.push({ type: 'blog-faq-language', loc, inLanguage: faqPage.inLanguage });
  if (faqPage.mainEntityOfPage !== loc || faqPage['@id'] !== `${loc}#faq`) {
    failures.push({ type: 'blog-faq-main-entity', loc, mainEntityOfPage: faqPage.mainEntityOfPage, id: faqPage['@id'] });
  }
  if (!Array.isArray(faqPage.mainEntity)) {
    failures.push({ type: 'blog-faq-main-entity-list', loc });
    return;
  }
  if (faqPage.mainEntity.length < minBlogFaqEntries || faqPage.mainEntity.length > maxBlogFaqEntries) {
    failures.push({
      type: 'blog-faq-count',
      loc,
      expectedMin: minBlogFaqEntries,
      expectedMax: maxBlogFaqEntries,
      sourceQuestions: expectedEntries.length,
      actual: faqPage.mainEntity.length,
    });
  }

  const questions = new Set();
  for (const item of faqPage.mainEntity) {
    if (item?.['@type'] !== 'Question') failures.push({ type: 'blog-faq-question-type', loc, item });
    const question = item?.name;
    if (!question || !question.includes('?') || questions.has(question)) failures.push({ type: 'blog-faq-question', loc, question });
    questions.add(question);
    const answer = item?.acceptedAnswer?.text;
    if (item?.acceptedAnswer?.['@type'] !== 'Answer' || typeof answer !== 'string' || answer.length < 40) {
      failures.push({ type: 'blog-faq-answer', loc, question, answer });
    }
  }
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
  if (blogPosting.inLanguage !== 'pl-PL') failures.push({ type: 'blogposting-language', loc, inLanguage: blogPosting.inLanguage });
  if (!blogPosting.articleSection) failures.push({ type: 'blogposting-article-section', loc });
  if (!Array.isArray(blogPosting.keywords) || blogPosting.keywords.length === 0) {
    failures.push({ type: 'blogposting-keywords', loc, keywords: blogPosting.keywords });
  }
  if (blogPosting.isAccessibleForFree !== true) {
    failures.push({ type: 'blogposting-accessible-free', loc, isAccessibleForFree: blogPosting.isAccessibleForFree });
  }
  if (!Number.isInteger(blogPosting.wordCount) || blogPosting.wordCount <= 0) {
    failures.push({ type: 'blogposting-word-count', loc, wordCount: blogPosting.wordCount });
  }
  if (blogPosting.mainEntityOfPage?.['@id'] !== loc) {
    failures.push({ type: 'blogposting-main-entity', loc, mainEntityOfPage: blogPosting.mainEntityOfPage });
  }
  if (blogPosting.author?.name !== 'TS Finanse' || blogPosting.publisher?.name !== 'TS Finanse') {
    failures.push({ type: 'blogposting-attribution', loc, author: blogPosting.author, publisher: blogPosting.publisher });
  }
  if (isChronologicallyBefore(blogPosting.dateModified, blogPosting.datePublished)) {
    failures.push({
      type: 'blogposting-date-modified-before-published',
      loc,
      datePublished: blogPosting.datePublished,
      dateModified: blogPosting.dateModified,
    });
  }
  if (lastmod && datePart(blogPosting.dateModified) !== lastmod) {
    failures.push({ type: 'blogposting-date-modified-lastmod', loc, dateModified: blogPosting.dateModified, lastmod });
  }

  const publishedMeta = extractMetaProperty(html, 'article:published_time');
  const modifiedMeta = extractMetaProperty(html, 'article:modified_time');
  if (!publishedMeta) failures.push({ type: 'article-published-meta', loc });
  if (!modifiedMeta) failures.push({ type: 'article-modified-meta', loc });
  if (isChronologicallyBefore(modifiedMeta, publishedMeta)) {
    failures.push({ type: 'article-modified-meta-before-published', loc, publishedMeta, modifiedMeta });
  }
  if (lastmod && datePart(modifiedMeta) !== lastmod) {
    failures.push({ type: 'article-modified-meta-lastmod', loc, modifiedMeta, lastmod });
  }

  const markdownPublished = markdown.match(/^date_published:\s+"([^"]+)"/m)?.[1];
  const markdownModified = markdown.match(/^date_modified:\s+"([^"]+)"/m)?.[1];
  if (!markdownPublished) failures.push({ type: 'markdown-date-published', loc });
  if (!markdownModified) failures.push({ type: 'markdown-date-modified', loc });
  if (isChronologicallyBefore(markdownModified, markdownPublished)) {
    failures.push({ type: 'markdown-date-modified-before-published', loc, markdownPublished, markdownModified });
  }
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

function verifyBlogIndexMarkdownLinks({ markdown, locs, failures }) {
  const loc = `${SITE_URL}/blog/`;
  const blogPostLocs = locs.filter((item) => {
    const pathname = new URL(item).pathname;
    return pathname.startsWith('/blog/') && pathname !== '/blog/';
  });

  const linkedLocs = new Set([...markdown.matchAll(/\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .filter((href) => href.startsWith(SITE_URL))
    .map((href) => {
      const url = new URL(href);
      return `${SITE_URL}${canonicalPath(url.pathname)}${url.search}${url.hash}`;
    })
    .filter((href) => blogPostLocs.includes(href)));

  if (linkedLocs.size !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-markdown-link-count', loc, expected: blogPostLocs.length, actual: linkedLocs.size });
  }

  for (const blogPostLoc of blogPostLocs) {
    if (!linkedLocs.has(blogPostLoc)) {
      failures.push({ type: 'blog-index-markdown-missing-link', loc, missing: blogPostLoc });
    }
  }
}

function verifyHomepageEntitySchema({ html, failures }) {
  const loc = `${SITE_URL}/`;
  const objects = collectJsonLd(html, failures, loc);
  const financialService = objects.find((entry) => (
    entry
    && entry['@type'] === 'FinancialService'
    && entry.alternateName === 'TS Finanse'
  ));

  if (!financialService) {
    failures.push({ type: 'homepage-financial-service-schema', loc });
    return;
  }

  for (const [field, expected] of [
    ['name', '"TRANSBUD" NOWAK SPÓŁKA JAWNA'],
    ['url', SITE_URL],
    ['logo', `${SITE_URL}/logo.webp`],
    ['email', 'kontakt@tsfinanse.com'],
    ['telephone', '+48506711242'],
    ['taxID', '9581565078'],
    ['vatID', 'PL9581565078'],
    ['legalName', '"TRANSBUD" NOWAK SPÓŁKA JAWNA'],
  ]) {
    if (financialService[field] !== expected) {
      failures.push({ type: 'homepage-financial-service-field', loc, field, actual: financialService[field], expected });
    }
  }

  const address = financialService.address || {};
  for (const [field, expected] of [
    ['@type', 'PostalAddress'],
    ['streetAddress', 'ul. Gdańska 60'],
    ['addressLocality', 'Reda'],
    ['postalCode', '84-240'],
    ['addressCountry', 'PL'],
  ]) {
    if (address[field] !== expected) {
      failures.push({ type: 'homepage-financial-service-address', loc, field, actual: address[field], expected });
    }
  }

  if (financialService.areaServed?.['@type'] !== 'Country' || financialService.areaServed?.name !== 'Polska') {
    failures.push({ type: 'homepage-financial-service-area', loc, areaServed: financialService.areaServed });
  }
  if (financialService.geo?.['@type'] !== 'GeoCoordinates' || financialService.geo?.latitude !== 54.6025 || financialService.geo?.longitude !== 18.3464) {
    failures.push({ type: 'homepage-financial-service-geo', loc, geo: financialService.geo });
  }

  const contactPoint = financialService.contactPoint || {};
  if (
    contactPoint['@type'] !== 'ContactPoint'
    || contactPoint.telephone !== '+48506711242'
    || contactPoint.email !== 'kontakt@tsfinanse.com'
    || contactPoint.areaServed !== 'PL'
    || !Array.isArray(contactPoint.availableLanguage)
    || !contactPoint.availableLanguage.includes('pl')
  ) {
    failures.push({ type: 'homepage-financial-service-contact', loc, contactPoint });
  }

  const hours = Array.isArray(financialService.openingHoursSpecification)
    ? financialService.openingHoursSpecification[0]
    : undefined;
  if (!hours || hours.opens !== '08:00' || hours.closes !== '16:00' || !Array.isArray(hours.dayOfWeek) || hours.dayOfWeek.length !== 5) {
    failures.push({ type: 'homepage-financial-service-hours', loc, openingHoursSpecification: financialService.openingHoursSpecification });
  }

  const loan = objects.find((entry) => entry && entry['@type'] === 'LoanOrCredit');
  if (
    !loan
    || loan.provider?.name !== 'TS Finanse'
    || loan.currency !== 'PLN'
    || loan.loanType !== 'Business Loan'
    || loan.amount?.minValue !== 1000000
    || loan.amount?.maxValue !== 20000000
    || loan.offers?.availability !== 'https://schema.org/InStock'
  ) {
    failures.push({ type: 'homepage-loan-schema', loc, loan });
  }

  const service = objects.find((entry) => entry && entry['@type'] === 'Service' && entry.serviceType === 'Pożyczki hipoteczne dla przedsiębiorców');
  if (
    !service
    || service.provider?.name !== 'TS Finanse'
    || service.provider?.url !== SITE_URL
    || service.areaServed?.name !== 'Polska'
    || service.offers?.availability !== 'https://schema.org/InStock'
  ) {
    failures.push({ type: 'homepage-service-schema', loc, service });
  }
}

function decodeXml(value = '') {
  return String(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function normaliseRssSignal(value = '') {
  return decodeXml(value).replace(/\s+/g, ' ').trim();
}

function rememberBlogTopicSignals({ html, loc, failures, blogTopicSignalsByLoc }) {
  const objects = collectJsonLd(html, failures, loc);
  const blogPosting = objects.find((entry) => entry && entry['@type'] === 'BlogPosting');
  if (!blogPosting) return;

  const keywords = Array.isArray(blogPosting.keywords) ? blogPosting.keywords : [];
  const topics = [blogPosting.articleSection, ...keywords]
    .map(normaliseRssSignal)
    .filter(Boolean);

  blogTopicSignalsByLoc.set(loc, {
    authorName: normaliseRssSignal(blogPosting.author?.name || ''),
    topics: [...new Set(topics)],
  });
}

function verifyRssFeed({ rss, locs, sitemapLastmods, blogTopicSignalsByLoc, failures }) {
  const blogPostLocs = new Set(locs.filter((item) => {
    const pathname = new URL(item).pathname;
    return pathname.startsWith('/blog/') && pathname !== '/blog/';
  }));
  const itemBlocks = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
  const itemLinks = itemBlocks
    .map((item) => item.match(/<link>([^<]+)<\/link>/)?.[1])
    .filter(Boolean);

  if (itemLinks.length !== blogPostLocs.size) {
    failures.push({ type: 'rss-item-count', expected: blogPostLocs.size, actual: itemLinks.length });
  }

  for (const itemLink of itemLinks) {
    if (!blogPostLocs.has(itemLink)) {
      failures.push({ type: 'rss-item-not-in-sitemap', itemLink });
    }
  }

  if (!rss.includes('<atom:link href="https://tsfinanse.com/rss.xml" rel="self" type="application/rss+xml" />')) {
    failures.push({ type: 'rss-atom-self-link' });
  }

  if (!rss.includes('xmlns:dc="http://purl.org/dc/elements/1.1/"')) {
    failures.push({ type: 'rss-dc-namespace' });
  }

  if (!rss.includes('<ttl>5</ttl>')) {
    failures.push({ type: 'rss-ttl', expected: 5 });
  }

  for (const item of itemBlocks) {
    const itemLink = item.match(/<link>([^<]+)<\/link>/)?.[1];
    if (!itemLink || !blogPostLocs.has(itemLink)) continue;

    const updated = item.match(/<atom:updated>([^<]+)<\/atom:updated>/)?.[1];
    const lastmod = sitemapLastmods.get(itemLink);
    if (!updated) {
      failures.push({ type: 'rss-item-updated-missing', itemLink });
      continue;
    }
    if (lastmod && datePart(updated) !== datePart(lastmod)) {
      failures.push({ type: 'rss-item-updated-lastmod', itemLink, updated, lastmod });
    }

    const expectedSignals = blogTopicSignalsByLoc.get(itemLink);
    const creator = normaliseRssSignal(item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1] || '');
    if (!creator) {
      failures.push({ type: 'rss-item-creator-missing', itemLink });
    } else if (expectedSignals?.authorName && creator !== expectedSignals.authorName) {
      failures.push({ type: 'rss-item-creator-mismatch', itemLink, creator, expected: expectedSignals.authorName });
    }

    const categories = [...item.matchAll(/<category>([\s\S]*?)<\/category>/g)]
      .map((match) => normaliseRssSignal(match[1]))
      .filter(Boolean);
    if (categories.length === 0) {
      failures.push({ type: 'rss-item-category-missing', itemLink });
    }

    for (const topic of expectedSignals?.topics || []) {
      if (!categories.includes(topic)) {
        failures.push({ type: 'rss-item-category-topic-missing', itemLink, topic });
      }
    }
  }
}

function scanStale(content, loc, surface, hits) {
  for (const pattern of stalePatterns) {
    const match = content.match(pattern);
    if (match) hits.push({ loc, surface, pattern: pattern.toString(), sample: match[0] });
  }
}

function parseJsonFile(file, failures, type) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push({ type, file, message: error.message });
    return undefined;
  }
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function extractNetlifyHeaderBlock(headers, path) {
  const lines = headers.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === path);
  if (start === -1) return '';

  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '') continue;
    if (!/^\s/.test(line)) break;
    block.push(line.trim());
  }

  return block.join('\n');
}

function verifyDiscoveryHeaders(failures) {
  if (!existsSync(headersPath)) {
    failures.push({ type: 'missing-netlify-headers', file: headersPath });
    return;
  }

  const headers = readFileSync(headersPath, 'utf8');
  const requiredLinks = [
    '</llms.txt>; rel="alternate"; type="text/plain"',
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    '</rss.xml>; rel="alternate"; type="application/rss+xml"',
    '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  ];

  for (const requiredLink of requiredLinks) {
    if (!headers.includes(requiredLink)) {
      failures.push({ type: 'netlify-header-link', expected: requiredLink });
    }
  }

  const requiredContentTypes = [
    '/.well-known/api-catalog\n  Content-Type: application/linkset+json',
    '/.well-known/agent-skills/index.json\n  Content-Type: application/json',
    '/sitemap.xml\n  Content-Type: application/xml; charset=utf-8',
    '/rss.xml\n  Content-Type: application/rss+xml; charset=utf-8',
    '/robots.txt\n  Content-Type: text/plain; charset=utf-8',
    '/llms.txt\n  Content-Type: text/plain; charset=utf-8',
  ];

  for (const requiredContentType of requiredContentTypes) {
    if (!headers.includes(requiredContentType)) {
      failures.push({ type: 'netlify-header-content-type', expected: requiredContentType });
    }
  }

  const discoveryCachePaths = ['/sitemap.xml', '/rss.xml', '/robots.txt', '/llms.txt'];
  for (const path of discoveryCachePaths) {
    const block = extractNetlifyHeaderBlock(headers, path).toLowerCase();
    if (!block.includes('cache-control: public, max-age=300')) {
      failures.push({
        type: 'discovery-cache-header',
        path,
        expected: 'Cache-Control: public, max-age=300',
      });
    }
  }

  const rootBlock = extractNetlifyHeaderBlock(headers, '/*').toLowerCase();
  if (rootBlock.includes('x-robots-tag:') && rootBlock.includes('noindex')) {
    failures.push({ type: 'html-x-robots-noindex-header' });
  }

  const markdownBlock = extractNetlifyHeaderBlock(headers, '/md/*').toLowerCase();
  const requiredMarkdownHeaders = [
    'content-type: text/markdown; charset=utf-8',
    'vary: accept',
    'x-robots-tag: noindex, follow',
  ];

  for (const requiredMarkdownHeader of requiredMarkdownHeaders) {
    if (!markdownBlock.includes(requiredMarkdownHeader)) {
      failures.push({ type: 'markdown-header-policy', expected: requiredMarkdownHeader });
    }
  }
}

function verifyIndexNowKeyFile(failures) {
  const candidates = readIndexNowKeyCandidates(join(root, 'dist'));
  if (candidates.length !== 1) {
    failures.push({
      type: 'indexnow-key-file-count',
      expected: 1,
      actual: candidates.length,
      files: candidates.map((candidate) => candidate.fileName),
    });
    return;
  }

  const [candidate] = candidates;
  if (candidate.key !== candidate.content) {
    failures.push({ type: 'indexnow-key-file-content', file: candidate.path });
    return;
  }

  if (!existsSync(headersPath)) return;

  const headers = readFileSync(headersPath, 'utf8');
  const headerBlock = extractNetlifyHeaderBlock(headers, `/${candidate.fileName}`).toLowerCase();
  const requiredHeaders = [
    'content-type: text/plain; charset=utf-8',
    'cache-control: public, max-age=300',
  ];

  for (const requiredHeader of requiredHeaders) {
    if (!headerBlock.includes(requiredHeader)) {
      failures.push({
        type: 'indexnow-key-header-policy',
        file: candidate.fileName,
        expected: requiredHeader,
      });
    }
  }
}

function verifyNetlifyMarkdownEdgeConfig(failures) {
  if (!existsSync(netlifyTomlPath)) {
    failures.push({ type: 'missing-netlify-toml', file: netlifyTomlPath });
    return;
  }

  const config = readFileSync(netlifyTomlPath, 'utf8');
  const requiredFragments = [
    'function = "markdown-negotiation"',
    '[edge_functions.header]',
    'accept = ".*text/markdown.*"',
    '"/*.html"',
    '"/md/*"',
    '"/.well-known/*"',
  ];

  for (const fragment of requiredFragments) {
    if (!config.includes(fragment)) {
      failures.push({ type: 'netlify-markdown-edge-config', expected: fragment });
    }
  }
}

function verifyLlmsSurface(failures, staleHits, locs) {
  if (!existsSync(llmsPath)) {
    failures.push({ type: 'missing-llms', file: llmsPath });
    return;
  }

  const llms = readFileSync(llmsPath, 'utf8');
  const lastUpdated = llms.match(/^# Last Updated:\s*(\d{4}-\d{2}-\d{2})$/m)?.[1];
  if (!lastUpdated) {
    failures.push({ type: 'llms-last-updated' });
  } else if (lastUpdated < minimumLlmsUpdatedDate) {
    failures.push({ type: 'llms-last-updated-stale', lastUpdated, minimum: minimumLlmsUpdatedDate });
  }

  const requiredFragments = [
    'TS Finanse',
    'mortgage-backed business loans',
    'Loan Amount Range',
    'Loan-to-Value',
    'Program Partnerski',
    'No percentage commission from total loan value',
  ];

  for (const fragment of requiredFragments) {
    if (!llms.includes(fragment)) {
      failures.push({ type: 'llms-required-fragment', fragment });
    }
  }

  for (const loc of locs) {
    if (!llms.includes(loc)) {
      failures.push({ type: 'llms-missing-canonical-url', loc });
    }

    const markdownUrl = markdownUrlForLoc(loc);
    if (!llms.includes(markdownUrl)) {
      failures.push({ type: 'llms-missing-markdown-url', loc, markdownUrl });
    }
  }

  scanStale(llms, `${SITE_URL}/llms.txt`, 'llms', staleHits);
}

function verifyApiCatalog(failures) {
  if (!existsSync(apiCatalogPath)) {
    failures.push({ type: 'missing-api-catalog', file: apiCatalogPath });
    return;
  }

  const catalog = parseJsonFile(apiCatalogPath, failures, 'api-catalog-json');
  if (!catalog) return;

  const linksets = Array.isArray(catalog.linkset) ? catalog.linkset : [];
  const rootLinkset = linksets.find((entry) => entry && entry.anchor === `${SITE_URL}/`);
  if (!rootLinkset) {
    failures.push({ type: 'api-catalog-root-anchor' });
    return;
  }

  const serviceDocs = Array.isArray(rootLinkset['service-doc']) ? rootLinkset['service-doc'] : [];
  const serviceMeta = Array.isArray(rootLinkset['service-meta']) ? rootLinkset['service-meta'] : [];
  if (!serviceDocs.some((entry) => entry.href === `${SITE_URL}/llms.txt` && entry.type === 'text/plain')) {
    failures.push({ type: 'api-catalog-llms-link' });
  }
  if (!serviceMeta.some((entry) => entry.href === `${SITE_URL}/.well-known/agent-skills/index.json` && entry.type === 'application/json')) {
    failures.push({ type: 'api-catalog-agent-skills-link' });
  }
}

function verifyAgentSkills(failures, staleHits) {
  if (!existsSync(agentSkillsIndexPath)) {
    failures.push({ type: 'missing-agent-skills-index', file: agentSkillsIndexPath });
    return;
  }

  const index = parseJsonFile(agentSkillsIndexPath, failures, 'agent-skills-index-json');
  if (!index) return;

  if (!Array.isArray(index.skills) || index.skills.length === 0) {
    failures.push({ type: 'agent-skills-empty' });
    return;
  }

  const names = new Set();
  for (const skill of index.skills) {
    if (!skill || typeof skill !== 'object') {
      failures.push({ type: 'agent-skill-entry' });
      continue;
    }

    if (!skill.name || names.has(skill.name)) {
      failures.push({ type: 'agent-skill-name', name: skill.name });
    }
    names.add(skill.name);

    if (skill.type !== 'markdown') {
      failures.push({ type: 'agent-skill-type', name: skill.name, skillType: skill.type });
    }
    if (!skill.description) {
      failures.push({ type: 'agent-skill-description', name: skill.name });
    }

    let skillUrl;
    try {
      skillUrl = new URL(skill.url);
    } catch {
      failures.push({ type: 'agent-skill-url', name: skill.name, url: skill.url });
      continue;
    }

    if (skillUrl.origin !== SITE_URL || !skillUrl.pathname.startsWith('/.well-known/agent-skills/') || !skillUrl.pathname.endsWith('/SKILL.md')) {
      failures.push({ type: 'agent-skill-url-scope', name: skill.name, url: skill.url });
      continue;
    }

    const skillPath = join(root, 'dist', decodeURIComponent(skillUrl.pathname));
    if (!existsSync(skillPath)) {
      failures.push({ type: 'agent-skill-file', name: skill.name, file: skillPath });
      continue;
    }

    const content = readFileSync(skillPath, 'utf8');
    const actualSha256 = sha256(content);
    if (skill.sha256 !== actualSha256) {
      failures.push({ type: 'agent-skill-sha256', name: skill.name, expected: skill.sha256, actual: actualSha256 });
    }
    if (!content.includes('TS Finanse')) {
      failures.push({ type: 'agent-skill-brand', name: skill.name });
    }
    scanStale(content, skill.url, 'agent-skill', staleHits);
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
      url: 'https://tsfinanse.com/index.html',
      accept: 'text/markdown',
      expectedPath: undefined,
    },
    {
      url: 'https://tsfinanse.com/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/index.html',
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

if (!existsSync(rssPath)) {
  console.error('dist/rss.xml does not exist. Run npm run build first.');
  process.exit(1);
}

const sitemap = readFileSync(sitemapPath, 'utf8');
const rss = readFileSync(rssPath, 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapLastmods = parseSitemapLastmods(sitemap);
const sitemapImages = parseSitemapImages(sitemap);
const failures = [];
const staleHits = [];
const titlesByValue = new Map();
const descriptionsByValue = new Map();
const blogTopicSignalsByLoc = new Map();

if (existsSync(sourceSitemapPath)) {
  failures.push({
    type: 'source-sitemap-artifact',
    file: sourceSitemapPath,
    message: 'sitemap.xml must be generated by scripts/generate-sitemap.mjs, not kept as a stale public artifact',
  });
}

if (locs.length !== EXPECTED_LOC_COUNT) {
  failures.push({ type: 'sitemap-count', expected: EXPECTED_LOC_COUNT, actual: locs.length });
}

if (!sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
  failures.push({ type: 'sitemap-image-namespace' });
}
verifySitemapLastmods({ sitemapLastmods, locs, failures });
verifySitemapHrefLangs({ sitemap, locs, failures });

verifyDiscoveryHeaders(failures);
verifyIndexNowKeyFile(failures);
verifyNetlifyMarkdownEdgeConfig(failures);
verifyLlmsSurface(failures, staleHits, locs);
verifyApiCatalog(failures);
verifyAgentSkills(failures, staleHits);
verifyRobotsPolicy(failures);
verifyCanonicalRedirectRules({ locs, failures });
verifyNotFoundArtifact(failures);
verifyAdminSurface(failures);

const expectedMarkdownFiles = new Set(locs.map((loc) => markdownPathForUrl(loc)));
for (const markdownFile of collectMarkdownFiles(join(root, 'dist', 'md'))) {
  if (!expectedMarkdownFiles.has(markdownFile)) {
    failures.push({ type: 'unexpected-markdown-artifact', file: markdownFile });
  }
}

const expectedHtmlFiles = new Set([
  ...locs.map((loc) => htmlPathForUrl(loc)),
  notFoundPath,
  adminIndexPath,
]);
for (const htmlFile of collectHtmlFiles(join(root, 'dist'))) {
  if (!expectedHtmlFiles.has(htmlFile)) {
    failures.push({ type: 'unexpected-html-artifact', file: htmlFile });
  }
}

for (const artifactPath of collectDistPaths(join(root, 'dist'))) {
  const relativePath = artifactPath.replace(`${join(root, 'dist')}/`, '');
  if (relativePath.split('/').some((part) => /\s/.test(part))) {
    failures.push({ type: 'space-named-dist-artifact', file: artifactPath });
  }
}

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
  verifySnippetMetadata({ html, loc, failures, titlesByValue, descriptionsByValue });
  if (!hasAlternateMarkdown(html, markdownUrlForLoc(expectedCanonical))) failures.push({ type: 'missing-markdown-alternate', loc });
  if (!hasAlternateHrefLang(html, 'pl-PL', expectedCanonical)) failures.push({ type: 'missing-hreflang-pl', loc });
  if (!hasAlternateHrefLang(html, 'x-default', expectedCanonical)) failures.push({ type: 'missing-hreflang-default', loc });
  if (!hasAlternateRss(html)) failures.push({ type: 'missing-rss-alternate', loc });
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) failures.push({ type: 'noindex', loc });

  const noscripts = (html.match(/<noscript\b/gi) || []).length;
  if (noscripts !== 1) failures.push({ type: 'noscript-count', loc, noscripts });

  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s !== 1) failures.push({ type: 'h1-count', loc, h1s });

  verifyBreadcrumbSchema({ html, loc, failures });
  verifyWebPageSchema({ html, loc, failures });
  verifyWebSiteSearchSchema({ html, loc, failures });
  verifyBlogSearchForm({ html, loc, failures });
  verifyHtmlInternalLinks({ html, loc, locs, failures });
  scanStale(html, loc, 'html', staleHits);

  if (!existsSync(mdPath)) {
    failures.push({ type: 'missing-markdown', loc });
    continue;
  }

  const markdown = readFileSync(mdPath, 'utf8');
  if (!markdown.includes(`canonical: "${expectedCanonical}"`)) failures.push({ type: 'markdown-canonical', loc });
  if (!/^#\s+.+/m.test(markdown)) failures.push({ type: 'markdown-h1', loc });
  verifyAnswerBlock({ html, markdown, loc, failures });
  verifyArticleToc({ html, markdown, loc, failures });
  verifyOfficialReferences({ html, markdown, loc, failures });
  verifyBlogEditorialTrust({ html, markdown, loc, failures });
  verifyMarkdownCanonicalLinks({ markdown, loc, failures });
  scanStale(markdown, loc, 'markdown', staleHits);

  if (isBlogPost) {
    verifyBlogImageSignals({
      html,
      loc,
      sitemapImages,
      failures,
    });
    verifyBlogFreshness({
      html,
      markdown,
      loc,
      lastmod: sitemapLastmods.get(loc),
      failures,
    });
    rememberBlogTopicSignals({
      html,
      loc,
      failures,
      blogTopicSignalsByLoc,
    });
    verifyBlogFaqSchema({
      html,
      markdown,
      loc,
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
    verifyBlogIndexMarkdownLinks({ markdown, locs, failures });
  }

  if (url.pathname === '/') {
    verifyHomepageEntitySchema({ html, failures });
  }
}

await verifyMarkdownEdgeFunction(failures);
verifyRssFeed({ rss, locs, sitemapLastmods, blogTopicSignalsByLoc, failures });
verifyUniqueSnippetMetadata({ titlesByValue, descriptionsByValue, failures });

const result = {
  locCount: locs.length,
  notFoundArtifact: notFoundPath,
  failureCount: failures.length,
  staleHitCount: staleHits.length,
  failures: failures.slice(0, 20),
  staleHits: staleHits.slice(0, 20),
};

console.log(JSON.stringify(result, null, 2));

if (failures.length || staleHits.length) {
  process.exit(1);
}

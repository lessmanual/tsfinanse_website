import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const RSS_URL = `${SITE_URL}/rss.xml`;
const ROBOTS_URL = `${SITE_URL}/robots.txt`;
const LLMS_URL = `${SITE_URL}/llms.txt`;
const ADMIN_URL = `${SITE_URL}/admin/`;
const API_CATALOG_URL = `${SITE_URL}/.well-known/api-catalog`;
const AGENT_SKILLS_INDEX_URL = `${SITE_URL}/.well-known/agent-skills/index.json`;
const VARIANT_REDIRECT_TARGETS_PATH = resolve(process.cwd(), 'content', 'gsc-variant-redirect-targets.json');
const PUBLIC_DIR = resolve(process.cwd(), 'public');
const REQUEST_TIMEOUT_MS = 15000;
const EXPECTED_LOC_COUNT = 73;
const indexNowKeyFilePattern = /^[A-Za-z0-9_-]{8,128}\.txt$/;
const minimumSitemapLastmodDate = '2026-06-27';
const minimumLlmsUpdatedDate = '2026-06-01';
const minMetaTitleLength = 20;
const maxMetaTitleLength = 70;
const minMetaDescriptionLength = 70;
const maxMetaDescriptionLength = 180;
const minAnswerBlockLength = 70;
const maxAnswerBlockLength = 360;
const minArticleTocLinks = 2;
const expectedIndexingMetaDirective = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const expectedHtmlLanguage = 'pl-PL';
const expectedOpenGraphLocale = 'pl_PL';
const minLegalStaticTextLength = 1500;
const legalStaticContentPaths = new Set([
  '/polityka-prywatnosci/',
  '/polityka-cookies/',
  '/regulamin/',
  '/rodo/',
]);
const officialReferenceUrls = [
  'https://www.knf.gov.pl/dla_konsumenta/ostrzezenia_publiczne',
  'https://uokik.gov.pl/',
  'https://www.biznes.gov.pl/pl/portal/00120',
  'https://prs.ms.gov.pl/krs',
];
const organizationSchemaId = `${SITE_URL}/#organization`;
const websiteSchemaId = `${SITE_URL}/#website`;
const websiteSearchActionSchemaId = `${SITE_URL}/#site-search-action`;
const websiteSearchEntryPointSchemaId = `${SITE_URL}/#site-search-entrypoint`;
const areaServedCountrySchemaId = `${SITE_URL}/#area-served-poland`;
const logoSchemaId = `${SITE_URL}/#logo`;
const logoImageUrl = `${SITE_URL}/logo.webp`;
const websiteSearchUrlTemplate = `${SITE_URL}/blog/?q={search_term_string}`;
const editorialTrustFragments = [
  'TS Finanse',
  '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
  'kontakt@tsfinanse.com',
  'warunki finansowania są ustalane indywidualnie',
];
const llmsEntityFragments = [
  'TRANSBUD NOWAK SPÓŁKA JAWNA',
  'Spółka jawna',
  'Address: ul. Gdańska 60, 84-240 Reda, Poland',
  'pożyczki hipoteczne dla firm',
  'wyłącznie hipoteka',
  'pierwsza hipoteka',
  'cała Polska',
  'This information was last verified and updated on: 2026-06-27',
];
const llmsForbiddenEntityFragments = [
  'TRANSBUD NOWAK SPOLKA JAWNA',
  'Spolka jawna',
  'ul. Gdanska 60',
  'pozyczki hipoteczne dla firm',
  'wylacznie hipoteka',
  'cala Polska',
  'This information was last verified and updated on: 2026-03-27',
];

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

const unknownUrl404Targets = [
  `${SITE_URL}/this-url-should-404-tsfinanse-seo-geo/`,
  `${SITE_URL}/blog/this-post-should-not-exist-tsfinanse/`,
  `${SITE_URL}/.well-known/mcp/server-card.json`,
];

function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function markdownUrlForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return `${SITE_URL}/md/index.md`;
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${SITE_URL}/md${normalised}.md`;
}

function articleSchemaIdForLoc(loc) {
  return `${loc}#article`;
}

function blogSchemaIdForLoc(loc) {
  return `${loc}#blog`;
}

function itemListSchemaIdForLoc(loc) {
  return `${loc}#itemlist`;
}

function primaryImageSchemaIdForLoc(loc) {
  return `${loc}#primaryimage`;
}

function expectedWebPageMainEntityId(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return organizationSchemaId;
  if (pathname === '/blog/') return blogSchemaIdForLoc(loc);
  if (pathname.startsWith('/blog/')) return articleSchemaIdForLoc(loc);
  return undefined;
}

function isOrganizationReference(value) {
  return value
    && (value['@type'] === 'Organization' || value['@type'] === 'FinancialService')
    && value['@id'] === organizationSchemaId
    && value.name === 'TS Finanse'
    && value.url === SITE_URL;
}

function isLogoImageObject(value) {
  return value
    && value['@type'] === 'ImageObject'
    && value['@id'] === logoSchemaId
    && value.url === logoImageUrl
    && value.contentUrl === logoImageUrl;
}

function readIndexNowKeyCandidates(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((fileName) => indexNowKeyFilePattern.test(fileName))
    .map((fileName) => ({
      fileName,
      key: fileName.replace(/\.txt$/, ''),
      content: readFileSync(resolve(dir, fileName), 'utf8').trim(),
    }));
}

function indexHtmlRedirectUrlForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return `${SITE_URL}/index.html`;
  return `${SITE_URL}${canonicalPath(pathname)}index.html`;
}

function noSlashRedirectUrlForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return undefined;
  return `${SITE_URL}${pathname.endsWith('/') ? pathname.slice(0, -1) : pathname}`;
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: options.redirect || 'follow',
      headers: options.headers || {},
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRedirectTrace(rawUrl, limit = 8, options = {}) {
  const trace = [];
  let currentUrl = rawUrl;
  const headers = options.headers || { accept: 'text/html' };

  for (let count = 0; count < limit; count += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        headers,
        signal: controller.signal,
      });
      const location = response.headers.get('location');
      trace.push({ url: currentUrl, status: response.status, location });

      if (response.status >= 300 && response.status < 400 && location) {
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      return {
        finalUrl: currentUrl,
        finalStatus: response.status,
        redirectCount: trace.length - 1,
        trace,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    finalUrl: currentUrl,
    finalStatus: undefined,
    redirectCount: trace.length,
    trace,
  };
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

function extractMetaHttpEquiv(html, httpEquiv) {
  const escaped = httpEquiv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta[^>]+http-equiv=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+http-equiv=["']${escaped}["']`, 'i'))?.[1];
}

function countMetaHttpEquiv(html, httpEquiv) {
  const escaped = httpEquiv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (html.match(new RegExp(`<meta\\b[^>]*http-equiv=["']${escaped}["'][^>]*>`, 'gi')) || []).length;
}

function extractHtmlLanguage(html) {
  return html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1];
}

function hasNoindexNofollow(value = '') {
  const tokens = String(value).toLowerCase().split(',').map((token) => token.trim());
  return tokens.includes('noindex') && tokens.includes('nofollow');
}

function verifyLanguageMetadata({ html, loc, failures }) {
  const htmlLanguage = extractHtmlLanguage(html);
  const contentLanguage = extractMetaHttpEquiv(html, 'content-language');
  const openGraphLocale = extractMetaProperty(html, 'og:locale');

  if (htmlLanguage !== expectedHtmlLanguage) {
    failures.push({ type: 'html-language', loc, actual: htmlLanguage, expected: expectedHtmlLanguage });
  }
  if (contentLanguage !== expectedHtmlLanguage) {
    failures.push({ type: 'content-language', loc, actual: contentLanguage, expected: expectedHtmlLanguage });
  }
  const contentLanguageCount = countMetaHttpEquiv(html, 'content-language');
  if (contentLanguageCount !== 1) {
    failures.push({ type: 'content-language-count', loc, actual: contentLanguageCount, expected: 1 });
  }
  if (openGraphLocale !== expectedOpenGraphLocale) {
    failures.push({ type: 'og-locale', loc, actual: openGraphLocale, expected: expectedOpenGraphLocale });
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
  const robots = extractMetaName(html, 'robots') || '';
  const googlebot = extractMetaName(html, 'googlebot') || '';
  const bingbot = extractMetaName(html, 'bingbot') || '';

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
  if (robots !== expectedIndexingMetaDirective) {
    failures.push({ type: 'snippet-robots-directive', loc, robots, expected: expectedIndexingMetaDirective });
  }
  if (googlebot !== expectedIndexingMetaDirective) {
    failures.push({ type: 'snippet-googlebot-directive', loc, googlebot, expected: expectedIndexingMetaDirective });
  }
  if (bingbot !== expectedIndexingMetaDirective) {
    failures.push({ type: 'snippet-bingbot-directive', loc, bingbot, expected: expectedIndexingMetaDirective });
  }

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

function slugifyTopicTerm(value = '') {
  return String(value)
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'temat';
}

function topicTermSchemaId(loc, term) {
  return `${loc}#topic-${slugifyTopicTerm(term)}`;
}

function topicTermsFromBlogPosting(blogPosting) {
  const keywords = Array.isArray(blogPosting.keywords) ? blogPosting.keywords : [];
  const topics = [blogPosting.articleSection, ...keywords]
    .map(normaliseRssSignal)
    .filter(Boolean);

  return [...new Set(topics)];
}

function verifyTopicTermSchema({ term, expectedName, expectedId, loc, surface, failures }) {
  if (
    !term
    || typeof term !== 'object'
    || term['@type'] !== 'DefinedTerm'
    || term['@id'] !== expectedId
    || term.name !== expectedName
    || term.url !== loc
  ) {
    failures.push({ type: 'blogposting-topic-term', loc, surface, expectedName, expectedId, term });
  }
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
    || author['@id'] !== organizationSchemaId
    || author.name !== 'TS Finanse'
    || author.legalName !== '"TRANSBUD" NOWAK SPÓŁKA JAWNA'
    || author.url !== SITE_URL
    || author.email !== 'kontakt@tsfinanse.com'
    || !isLogoImageObject(author.logo)
  ) {
    failures.push({ type: 'blog-editorial-trust-author', loc, author });
  }

  const publisher = blogPosting.publisher || {};
  if (
    publisher['@type'] !== 'Organization'
    || publisher['@id'] !== organizationSchemaId
    || publisher.name !== 'TS Finanse'
    || publisher.legalName !== '"TRANSBUD" NOWAK SPÓŁKA JAWNA'
    || publisher.url !== SITE_URL
    || !isLogoImageObject(publisher.logo)
  ) {
    failures.push({ type: 'blog-editorial-trust-publisher', loc, publisher });
  }

  const reviewedBy = blogPosting.reviewedBy || {};
  if (
    reviewedBy['@type'] !== 'Organization'
    || reviewedBy['@id'] !== organizationSchemaId
    || reviewedBy.name !== 'TS Finanse'
    || reviewedBy.legalName !== '"TRANSBUD" NOWAK SPÓŁKA JAWNA'
    || reviewedBy.url !== SITE_URL
    || !isLogoImageObject(reviewedBy.logo)
  ) {
    failures.push({ type: 'blog-editorial-trust-reviewed-by', loc, reviewedBy });
  }

  const copyrightHolder = blogPosting.copyrightHolder || {};
  if (
    copyrightHolder['@type'] !== 'Organization'
    || copyrightHolder['@id'] !== organizationSchemaId
    || copyrightHolder.name !== 'TS Finanse'
    || !isLogoImageObject(copyrightHolder.logo)
  ) {
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

function canonicalInternalTargetFromHref(href, baseLoc, locSet) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return undefined;
  if (/^(javascript:|data:)/i.test(href)) return undefined;

  let url;
  try {
    url = new URL(href, baseLoc);
  } catch {
    return undefined;
  }

  if (url.origin !== SITE_URL) return undefined;

  const pathname = decodeURIComponent(url.pathname);
  if (
    pathname.startsWith('/assets/')
    || pathname.startsWith('/uploads/')
    || pathname.startsWith('/.well-known/')
    || pathname.startsWith('/md/')
  ) {
    return undefined;
  }

  const canonical = `${SITE_URL}${canonicalPath(pathname)}`;
  return locSet.has(canonical) ? canonical : undefined;
}

function extractCanonicalHtmlTargets(html, loc, locSet) {
  return new Set([...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => canonicalInternalTargetFromHref(match[1].trim(), loc, locSet))
    .filter(Boolean));
}

function verifyStaticCrawlGraph({ htmlByLoc, locs, failures }) {
  const locSet = new Set(locs);
  const outgoingByLoc = new Map();

  for (const loc of locs) {
    const html = htmlByLoc.get(loc);
    if (!html) continue;
    const outgoing = extractCanonicalHtmlTargets(html, loc, locSet);
    outgoingByLoc.set(loc, outgoing);

    if (loc !== `${SITE_URL}/` && outgoing.size === 0) {
      failures.push({ type: 'static-crawl-dead-end', loc });
    }
  }

  const rootLoc = `${SITE_URL}/`;
  const reachable = new Set([rootLoc]);
  const queue = [rootLoc];

  while (queue.length > 0) {
    const current = queue.shift();
    for (const target of outgoingByLoc.get(current) || []) {
      if (reachable.has(target)) continue;
      reachable.add(target);
      queue.push(target);
    }
  }

  for (const loc of locs) {
    if (!reachable.has(loc)) {
      failures.push({ type: 'static-crawl-orphan', loc });
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

function verifyLegalStaticContent({ html, loc, failures }) {
  const pathname = new URL(loc).pathname;
  if (!legalStaticContentPaths.has(pathname)) return;

  const text = stripHtml(html);
  if (/włącz JavaScript/i.test(text)) {
    failures.push({ type: 'legal-static-js-placeholder', loc });
  }
  if (text.length < minLegalStaticTextLength) {
    failures.push({ type: 'legal-static-content-length', loc, expectedMin: minLegalStaticTextLength, actual: text.length });
  }
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

function imageUrlFromSchema(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;
  return value.url || value.contentUrl;
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
  if (breadcrumb['@id'] !== `${loc}#breadcrumb`) {
    failures.push({ type: 'breadcrumb-schema-id', loc, actual: breadcrumb['@id'], expected: `${loc}#breadcrumb` });
  }

  const items = Array.isArray(breadcrumb.itemListElement) ? breadcrumb.itemListElement : [];
  if (!items.length) {
    failures.push({ type: 'breadcrumb-schema-empty', loc });
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const breadcrumbItemUrl = (item) => {
    if (typeof item?.item === 'string') return item.item;
    if (item?.item && typeof item.item === 'object') return item.item.url;
    return undefined;
  };
  if (breadcrumbItemUrl(first) !== `${SITE_URL}/`) {
    failures.push({ type: 'breadcrumb-schema-first-item', loc, actual: first?.item });
  }
  if (breadcrumbItemUrl(last) !== loc) {
    failures.push({ type: 'breadcrumb-schema-last-item', loc, expected: loc, actual: last?.item });
  }

  items.forEach((item, index) => {
    const expectedPosition = index + 1;
    const expectedItemUrl = index === 0
      ? `${SITE_URL}/`
      : index === items.length - 1
        ? loc
        : `${SITE_URL}/blog/`;
    const expectedItemSchemaId = `${expectedItemUrl}#webpage`;
    const expectedListItemId = `${loc}#breadcrumb-item-${expectedPosition}`;
    if (item?.['@type'] !== 'ListItem') {
      failures.push({ type: 'breadcrumb-schema-item-type', loc, position: expectedPosition, actual: item?.['@type'] });
    }
    if (item?.['@id'] !== expectedListItemId) {
      failures.push({ type: 'breadcrumb-schema-listitem-id', loc, position: expectedPosition, actual: item?.['@id'], expected: expectedListItemId });
    }
    if (
      item?.item?.['@type'] !== 'WebPage'
      || item.item?.['@id'] !== expectedItemSchemaId
      || item.item?.url !== expectedItemUrl
      || item.item?.name !== item.name
    ) {
      failures.push({ type: 'breadcrumb-schema-item-reference', loc, position: expectedPosition, item: item?.item, expectedItemSchemaId, expectedItemUrl });
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
  if (webPage.publisher?.['@id'] !== organizationSchemaId || webPage.publisher?.name !== 'TS Finanse') {
    failures.push({ type: 'webpage-schema-publisher', loc, publisher: webPage.publisher });
  }
  if (!isLogoImageObject(webPage.publisher?.logo)) {
    failures.push({ type: 'webpage-schema-publisher-logo', loc, logo: webPage.publisher?.logo });
  }
  if (webPage.breadcrumb?.['@id'] !== `${loc}#breadcrumb`) {
    failures.push({ type: 'webpage-schema-breadcrumb', loc, breadcrumb: webPage.breadcrumb });
  }
  const expectedMainEntityId = expectedWebPageMainEntityId(loc);
  if (expectedMainEntityId && webPage.mainEntity?.['@id'] !== expectedMainEntityId) {
    failures.push({
      type: 'webpage-schema-main-entity',
      loc,
      expected: expectedMainEntityId,
      mainEntity: webPage.mainEntity,
    });
  }

  const primaryImage = webPage.primaryImageOfPage || {};
  const expectedImageUrl = extractMetaProperty(html, 'og:image');
  if (
    primaryImage['@type'] !== 'ImageObject'
    || primaryImage['@id'] !== primaryImageSchemaIdForLoc(loc)
    || primaryImage.url !== expectedImageUrl
    || primaryImage.contentUrl !== expectedImageUrl
  ) {
    failures.push({
      type: 'webpage-primary-image-object',
      loc,
      expectedId: primaryImageSchemaIdForLoc(loc),
      expectedUrl: expectedImageUrl,
      primaryImageOfPage: webPage.primaryImageOfPage,
    });
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
  if (action['@id'] !== websiteSearchActionSchemaId) {
    failures.push({
      type: 'website-search-action-id',
      loc,
      actual: action['@id'],
      expected: websiteSearchActionSchemaId,
    });
  }
  if (target['@type'] !== 'EntryPoint' || target.urlTemplate !== websiteSearchUrlTemplate) {
    failures.push({ type: 'website-search-action-target', loc, target, expected: websiteSearchUrlTemplate });
  }
  if (target['@id'] !== websiteSearchEntryPointSchemaId) {
    failures.push({
      type: 'website-search-entrypoint-id',
      loc,
      actual: target['@id'],
      expected: websiteSearchEntryPointSchemaId,
    });
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
  const blogPostingImage = blogPosting?.image;
  const blogPostingImageUrl = imageUrlFromSchema(blogPostingImage);

  if (sitemapImageLocs.length !== 1) {
    failures.push({ type: 'blog-sitemap-image-count', loc, actual: sitemapImageLocs.length });
  }

  for (const [surface, imageUrl] of [
    ['sitemap', sitemapImage],
    ['og', ogImage],
    ['twitter', twitterImage],
    ['blogposting', blogPostingImageUrl],
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
  if (sitemapImage && blogPostingImageUrl && sitemapImage !== blogPostingImageUrl) {
    failures.push({ type: 'blog-image-schema-sitemap', loc, sitemapImage, blogPostingImage: blogPostingImageUrl });
  }

  if (
    !blogPostingImage
    || typeof blogPostingImage !== 'object'
    || blogPostingImage['@type'] !== 'ImageObject'
    || blogPostingImage['@id'] !== primaryImageSchemaIdForLoc(loc)
    || blogPostingImage.url !== sitemapImage
    || blogPostingImage.contentUrl !== sitemapImage
  ) {
    failures.push({
      type: 'blogposting-image-object',
      loc,
      expectedId: primaryImageSchemaIdForLoc(loc),
      expectedUrl: sitemapImage,
      image: blogPostingImage,
    });
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
  const blogPosting = objects.find((entry) => entry && entry['@type'] === 'BlogPosting');
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
  const expectedFaqId = `${loc}#faq`;
  const expectedArticleId = `${loc}#article`;
  const articleHasParts = Array.isArray(blogPosting?.hasPart)
    ? blogPosting.hasPart
    : (blogPosting?.hasPart ? [blogPosting.hasPart] : []);
  if (!articleHasParts.some((part) => part?.['@id'] === expectedFaqId)) {
    failures.push({ type: 'blog-faq-article-haspart', loc, expectedFaqId, hasPart: blogPosting?.hasPart });
  }
  if (faqPage.isPartOf?.['@id'] !== expectedArticleId) {
    failures.push({ type: 'blog-faq-is-part-of', loc, expectedArticleId, isPartOf: faqPage.isPartOf });
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
  faqPage.mainEntity.forEach((item, index) => {
    const expectedQuestionId = `${loc}#faq-question-${index + 1}`;
    const expectedAnswerId = `${loc}#faq-answer-${index + 1}`;
    if (item?.['@type'] !== 'Question') failures.push({ type: 'blog-faq-question-type', loc, item });
    if (item?.['@id'] !== expectedQuestionId) {
      failures.push({ type: 'blog-faq-question-id', loc, expectedQuestionId, question: item });
    }
    if (item?.isPartOf?.['@id'] !== `${loc}#faq`) {
      failures.push({ type: 'blog-faq-question-is-part-of', loc, expectedFaqId: `${loc}#faq`, isPartOf: item?.isPartOf });
    }
    const question = item?.name;
    if (!question || !question.includes('?') || questions.has(question)) failures.push({ type: 'blog-faq-question', loc, question });
    questions.add(question);
    const acceptedAnswer = item?.acceptedAnswer;
    const answer = acceptedAnswer?.text;
    if (acceptedAnswer?.['@type'] !== 'Answer' || typeof answer !== 'string' || answer.length < 40) {
      failures.push({ type: 'blog-faq-answer', loc, question, answer });
    }
    if (acceptedAnswer?.['@id'] !== expectedAnswerId) {
      failures.push({ type: 'blog-faq-answer-id', loc, expectedAnswerId, answer: acceptedAnswer });
    }
    if (acceptedAnswer?.parentItem?.['@id'] !== expectedQuestionId) {
      failures.push({ type: 'blog-faq-answer-parent-item', loc, expectedQuestionId, parentItem: acceptedAnswer?.parentItem });
    }
  });
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
  const abstract = normaliseRssSignal(blogPosting.abstract || '');
  const description = normaliseRssSignal(blogPosting.description || '');
  if (!abstract || abstract !== description || abstract.length < minMetaDescriptionLength) {
    failures.push({ type: 'blogposting-abstract', loc, abstract: blogPosting.abstract, description: blogPosting.description });
  }
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
  if (blogPosting.url !== loc) {
    failures.push({ type: 'blogposting-url', loc, url: blogPosting.url });
  }
  const topicTerms = topicTermsFromBlogPosting(blogPosting);
  if (topicTerms.length === 0) {
    failures.push({ type: 'blogposting-topic-terms', loc });
  } else {
    verifyTopicTermSchema({
      term: blogPosting.about,
      expectedName: topicTerms[0],
      expectedId: topicTermSchemaId(loc, topicTerms[0]),
      loc,
      surface: 'about',
      failures,
    });

    const mentions = Array.isArray(blogPosting.mentions) ? blogPosting.mentions : [];
    const expectedMentions = topicTerms.slice(1);
    if (mentions.length !== expectedMentions.length) {
      failures.push({ type: 'blogposting-topic-mentions-count', loc, expected: expectedMentions.length, actual: mentions.length });
    }
    expectedMentions.forEach((topic, index) => {
      verifyTopicTermSchema({
        term: mentions[index],
        expectedName: topic,
        expectedId: topicTermSchemaId(loc, topic),
        loc,
        surface: `mentions[${index}]`,
        failures,
      });
    });
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
  if (blog['@id'] !== blogSchemaIdForLoc(loc) || blog.mainEntityOfPage?.['@id'] !== loc) {
    failures.push({
      type: 'blog-index-schema-id',
      loc,
      id: blog['@id'],
      mainEntityOfPage: blog.mainEntityOfPage,
    });
  }
  if (!isOrganizationReference(blog.publisher)) {
    failures.push({ type: 'blog-index-publisher-reference', loc, publisher: blog.publisher });
  }
  if (!Array.isArray(blog.blogPost)) {
    failures.push({ type: 'blog-index-blogpost-list', loc });
  } else if (blog.blogPost.length !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-blogpost-count', loc, expected: blogPostLocs.length, actual: blog.blogPost.length });
  } else {
    const expectedLocs = new Set(blogPostLocs);
    for (const entry of blog.blogPost) {
      if (!expectedLocs.has(entry.url)) {
        failures.push({ type: 'blog-index-blogpost-url', loc, url: entry.url });
        continue;
      }
      if (entry['@id'] !== articleSchemaIdForLoc(entry.url)
        || entry.mainEntityOfPage?.['@id'] !== entry.url
        || !isOrganizationReference(entry.author)
        || !isOrganizationReference(entry.publisher)) {
        failures.push({
          type: 'blog-index-blogpost-entity-reference',
          loc,
          url: entry.url,
          id: entry['@id'],
          mainEntityOfPage: entry.mainEntityOfPage,
          author: entry.author,
          publisher: entry.publisher,
        });
      }
    }
  }

  if (!itemList) {
    failures.push({ type: 'blog-index-itemlist-schema', loc });
    return;
  }
  if (itemList['@id'] !== itemListSchemaIdForLoc(loc) || itemList.url !== loc || itemList.mainEntityOfPage?.['@id'] !== loc) {
    failures.push({
      type: 'blog-index-itemlist-id',
      loc,
      id: itemList['@id'],
      url: itemList.url,
      mainEntityOfPage: itemList.mainEntityOfPage,
    });
  }
  if (itemList.numberOfItems !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-itemlist-count', loc, expected: blogPostLocs.length, actual: itemList.numberOfItems });
  }
  if (!Array.isArray(itemList.itemListElement)) {
    failures.push({ type: 'blog-index-itemlist-elements', loc });
  } else if (itemList.itemListElement.length !== blogPostLocs.length) {
    failures.push({ type: 'blog-index-itemlist-element-count', loc, expected: blogPostLocs.length, actual: itemList.itemListElement.length });
  } else {
    itemList.itemListElement.forEach((entry, index) => {
      const expectedPosition = index + 1;
      const expectedUrl = blogPostLocs[index];
      const expectedListItemId = `${loc}#item-${expectedPosition}`;
      const expectedArticleId = articleSchemaIdForLoc(expectedUrl);
      if (
        entry?.['@type'] !== 'ListItem'
        || entry['@id'] !== expectedListItemId
        || entry.position !== expectedPosition
        || entry.url !== expectedUrl
        || entry.item?.['@id'] !== expectedArticleId
        || entry.item?.url !== expectedUrl
        || typeof entry.name !== 'string'
        || !entry.name.trim()
      ) {
        failures.push({ type: 'blog-index-itemlist-item-reference', loc, position: expectedPosition, entry, expectedListItemId, expectedArticleId, expectedUrl });
      }
    });
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
    ['@id', organizationSchemaId],
    ['name', '"TRANSBUD" NOWAK SPÓŁKA JAWNA'],
    ['url', SITE_URL],
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
  if (!isLogoImageObject(financialService.logo)) {
    failures.push({ type: 'homepage-financial-service-logo', loc, logo: financialService.logo });
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
  if (address['@id'] !== `${SITE_URL}/#address`) {
    failures.push({ type: 'homepage-financial-service-address-id', loc, address });
  }

  if (financialService.areaServed?.['@type'] !== 'Country' || financialService.areaServed?.name !== 'Polska') {
    failures.push({ type: 'homepage-financial-service-area', loc, areaServed: financialService.areaServed });
  }
  if (financialService.areaServed?.['@id'] !== areaServedCountrySchemaId) {
    failures.push({ type: 'homepage-financial-service-area-id', loc, areaServed: financialService.areaServed });
  }
  if (financialService.geo?.['@type'] !== 'GeoCoordinates' || financialService.geo?.latitude !== 54.6025 || financialService.geo?.longitude !== 18.3464) {
    failures.push({ type: 'homepage-financial-service-geo', loc, geo: financialService.geo });
  }
  if (financialService.geo?.['@id'] !== `${SITE_URL}/#geo`) {
    failures.push({ type: 'homepage-financial-service-geo-id', loc, geo: financialService.geo });
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
  if (
    contactPoint['@id'] !== `${SITE_URL}/#contact-point`
    || contactPoint.url !== `${SITE_URL}/#contact`
    || contactPoint.hoursAvailable?.['@id'] !== `${SITE_URL}/#opening-hours`
  ) {
    failures.push({ type: 'homepage-financial-service-contact-id', loc, contactPoint });
  }

  const hours = Array.isArray(financialService.openingHoursSpecification)
    ? financialService.openingHoursSpecification[0]
    : undefined;
  if (!hours || hours.opens !== '08:00' || hours.closes !== '16:00' || !Array.isArray(hours.dayOfWeek) || hours.dayOfWeek.length !== 5) {
    failures.push({ type: 'homepage-financial-service-hours', loc, openingHoursSpecification: financialService.openingHoursSpecification });
  }
  if (hours?.['@id'] !== `${SITE_URL}/#opening-hours`) {
    failures.push({ type: 'homepage-financial-service-hours-id', loc, openingHoursSpecification: financialService.openingHoursSpecification });
  }

  const loan = objects.find((entry) => entry && entry['@type'] === 'LoanOrCredit');
  if (
    !loan
    || loan['@id'] !== `${SITE_URL}/#loan-product`
    || loan.url !== SITE_URL
    || loan.mainEntityOfPage?.['@id'] !== loc
    || !isOrganizationReference(loan.provider)
    || !isOrganizationReference(loan.broker)
    || !isOrganizationReference(loan.offers?.seller)
    || loan.currency !== 'PLN'
    || loan.loanType !== 'Business Loan'
    || loan.amount?.minValue !== 1000000
    || loan.amount?.maxValue !== 20000000
    || loan.offers?.availability !== 'https://schema.org/InStock'
  ) {
    failures.push({ type: 'homepage-loan-schema', loc, loan });
  }
  if (loan) {
    const amount = loan.amount || {};
    if (
      amount['@type'] !== 'MonetaryAmount'
      || amount['@id'] !== `${SITE_URL}/#loan-amount`
      || amount.currency !== 'PLN'
      || amount.minValue !== 1000000
      || amount.maxValue !== 20000000
    ) {
      failures.push({ type: 'homepage-loan-amount-id', loc, amount: loan.amount });
    }

    const offer = loan.offers || {};
    if (
      offer['@type'] !== 'Offer'
      || offer['@id'] !== `${SITE_URL}/#loan-offer`
      || offer.url !== loc
      || offer.priceCurrency !== 'PLN'
      || offer.availability !== 'https://schema.org/InStock'
      || offer.areaServed?.name !== 'Polska'
      || !isOrganizationReference(offer.seller)
      || offer.itemOffered?.['@id'] !== `${SITE_URL}/#loan-product`
    ) {
      failures.push({ type: 'homepage-loan-offer-id', loc, offer: loan.offers });
    }
    if (offer.areaServed?.['@id'] !== areaServedCountrySchemaId) {
      failures.push({ type: 'homepage-loan-offer-area-id', loc, areaServed: offer.areaServed });
    }
  }

  const service = objects.find((entry) => entry && entry['@type'] === 'Service' && entry.serviceType === 'Pożyczki hipoteczne dla przedsiębiorców');
  if (
    !service
    || service['@id'] !== `${SITE_URL}/#service`
    || service.url !== SITE_URL
    || service.mainEntityOfPage?.['@id'] !== loc
    || !isOrganizationReference(service.provider)
    || !isOrganizationReference(service.offers?.seller)
    || service.areaServed?.name !== 'Polska'
    || service.offers?.availability !== 'https://schema.org/InStock'
  ) {
    failures.push({ type: 'homepage-service-schema', loc, service });
  }
  if (service) {
    if (service.areaServed?.['@id'] !== areaServedCountrySchemaId) {
      failures.push({ type: 'homepage-service-area-id', loc, areaServed: service.areaServed });
    }

    const offer = service.offers || {};
    if (
      offer['@type'] !== 'Offer'
      || offer['@id'] !== `${SITE_URL}/#service-offer`
      || offer.url !== loc
      || offer.priceCurrency !== 'PLN'
      || offer.availability !== 'https://schema.org/InStock'
      || offer.areaServed?.name !== 'Polska'
      || !isOrganizationReference(offer.seller)
      || offer.itemOffered?.['@id'] !== `${SITE_URL}/#service`
    ) {
      failures.push({ type: 'homepage-service-offer-id', loc, offer: service.offers });
    }
    if (offer.areaServed?.['@id'] !== areaServedCountrySchemaId) {
      failures.push({ type: 'homepage-service-offer-area-id', loc, areaServed: offer.areaServed });
    }
  }

  const faqPage = objects.find((entry) => entry && entry['@type'] === 'FAQPage');
  if (
    !faqPage
    || faqPage['@id'] !== `${SITE_URL}/#faq`
    || faqPage.url !== loc
    || faqPage.mainEntityOfPage !== loc
    || faqPage.inLanguage !== 'pl-PL'
    || !Array.isArray(faqPage.mainEntity)
    || faqPage.mainEntity.length < 5
  ) {
    failures.push({ type: 'homepage-faq-schema', loc, faqPage });
  } else {
    faqPage.mainEntity.forEach((item, index) => {
      const expectedQuestionId = `${SITE_URL}/#faq-question-${index + 1}`;
      const expectedAnswerId = `${SITE_URL}/#faq-answer-${index + 1}`;
      const acceptedAnswer = item?.acceptedAnswer;

      if (item?.['@id'] !== expectedQuestionId) {
        failures.push({ type: 'homepage-faq-question-id', loc, expectedQuestionId, question: item });
      }
      if (item?.isPartOf?.['@id'] !== `${SITE_URL}/#faq`) {
        failures.push({ type: 'homepage-faq-question-is-part-of', loc, expectedFaqId: `${SITE_URL}/#faq`, isPartOf: item?.isPartOf });
      }
      if (acceptedAnswer?.['@id'] !== expectedAnswerId) {
        failures.push({ type: 'homepage-faq-answer-id', loc, expectedAnswerId, answer: acceptedAnswer });
      }
      if (acceptedAnswer?.parentItem?.['@id'] !== expectedQuestionId) {
        failures.push({ type: 'homepage-faq-answer-parent-item', loc, expectedQuestionId, parentItem: acceptedAnswer?.parentItem });
      }
    });
  }

  const howTo = objects.find((entry) => entry && entry['@type'] === 'HowTo');
  if (
    !howTo
    || howTo['@id'] !== `${SITE_URL}/#how-to`
    || howTo.url !== loc
    || howTo.mainEntityOfPage !== loc
    || howTo.inLanguage !== 'pl-PL'
    || !Array.isArray(howTo.step)
    || howTo.step.length < 5
  ) {
    failures.push({ type: 'homepage-howto-schema', loc, howTo });
  } else {
    howTo.step.forEach((step, index) => {
      const expectedStepId = `${SITE_URL}/#how-to-step-${index + 1}`;
      if (step?.['@type'] !== 'HowToStep') {
        failures.push({ type: 'homepage-howto-step-type', loc, position: index + 1, step });
      }
      if (step?.['@id'] !== expectedStepId) {
        failures.push({ type: 'homepage-howto-step-id', loc, expectedStepId, step });
      }
      if (step?.url !== expectedStepId) {
        failures.push({ type: 'homepage-howto-step-url', loc, expectedStepId, url: step?.url });
      }
      if (step?.isPartOf?.['@id'] !== `${SITE_URL}/#how-to`) {
        failures.push({ type: 'homepage-howto-step-is-part-of', loc, expectedHowToId: `${SITE_URL}/#how-to`, isPartOf: step?.isPartOf });
      }
      if (step?.position !== index + 1 || typeof step?.name !== 'string' || !step.name.trim() || typeof step?.text !== 'string' || step.text.length < 20) {
        failures.push({ type: 'homepage-howto-step-content', loc, position: index + 1, step });
      }
    });
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

function parseJson(raw, failures, type, url) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    failures.push({ type, url, message: error.message });
    return undefined;
  }
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function verifyDiscoveryHeaders(headers, failures) {
  const linkHeader = headers.get('link') || '';
  const requiredLinks = [
    '</llms.txt>; rel="alternate"; type="text/plain"',
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    '</rss.xml>; rel="alternate"; type="application/rss+xml"',
    '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  ];

  for (const requiredLink of requiredLinks) {
    if (!linkHeader.includes(requiredLink)) {
      failures.push({ type: 'discovery-link-header', expected: requiredLink, actual: linkHeader });
    }
  }
}

function verifyDiscoveryFileCache({ response, url, failures }) {
  const cacheControl = response.headers.get('cache-control') || '';
  if (!cacheControl.toLowerCase().includes('public, max-age=300')) {
    failures.push({
      type: 'discovery-cache-header',
      url,
      expected: 'public, max-age=300',
      actual: cacheControl,
    });
  }
}

async function verifyIndexNowKeyFile(failures) {
  const candidates = readIndexNowKeyCandidates(PUBLIC_DIR);
  if (candidates.length !== 1) {
    failures.push({
      type: 'indexnow-key-source-count',
      expected: 1,
      actual: candidates.length,
      files: candidates.map((candidate) => candidate.fileName),
    });
    return;
  }

  const [candidate] = candidates;
  if (candidate.key !== candidate.content) {
    failures.push({ type: 'indexnow-key-source-content', file: candidate.fileName });
    return;
  }

  const keyUrl = `${SITE_URL}/${candidate.fileName}`;
  const { response, text } = await fetchText(keyUrl, {
    headers: { accept: 'text/plain,*/*' },
  });

  if (!response.ok) {
    failures.push({ type: 'indexnow-key-status', url: keyUrl, status: response.status });
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('text/plain')) {
    failures.push({ type: 'indexnow-key-content-type', url: keyUrl, contentType });
  }

  const cacheControl = response.headers.get('cache-control') || '';
  if (!cacheControl.toLowerCase().includes('max-age=300')) {
    failures.push({ type: 'indexnow-key-cache-control', url: keyUrl, cacheControl });
  }

  if (text.trim() !== candidate.key) {
    failures.push({ type: 'indexnow-key-content', url: keyUrl });
  }
}

async function verifyDirectMarkdownNoindexHeaders(failures, locs) {
  const sampleLocs = [
    `${SITE_URL}/`,
    `${SITE_URL}/blog/`,
    locs.find((loc) => new URL(loc).pathname.startsWith('/blog/') && new URL(loc).pathname !== '/blog/'),
  ].filter(Boolean);

  for (const loc of [...new Set(sampleLocs)]) {
    const markdownUrl = markdownUrlForLoc(loc);
    const { response } = await fetchText(markdownUrl, {
      headers: { accept: 'text/markdown,text/plain' },
    });
    const contentType = response.headers.get('content-type') || '';
    const xRobotsTag = response.headers.get('x-robots-tag') || '';
    const xRobotsTagLower = xRobotsTag.toLowerCase();

    if (!response.ok) {
      failures.push({ type: 'direct-markdown-status', loc, markdownUrl, status: response.status });
      continue;
    }
    if (!contentType.toLowerCase().includes('text/markdown')) {
      failures.push({ type: 'direct-markdown-content-type', loc, markdownUrl, contentType });
    }
    if (!xRobotsTagLower.includes('noindex') || !xRobotsTagLower.includes('follow')) {
      failures.push({ type: 'direct-markdown-x-robots-tag', loc, markdownUrl, xRobotsTag });
    }
  }
}

async function verifyLlmsSurface(failures, staleHits, locs) {
  const { response, text } = await fetchText(LLMS_URL, {
    headers: { accept: 'text/plain' },
  });

  if (!response.ok) {
    failures.push({ type: 'llms-status', status: response.status });
    return;
  }

  verifyDiscoveryFileCache({ response, url: LLMS_URL, failures });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('text/plain')) {
    failures.push({ type: 'llms-content-type', contentType });
  }

  const lastUpdated = text.match(/^# Last Updated:\s*(\d{4}-\d{2}-\d{2})$/m)?.[1];
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
    if (!text.includes(fragment)) {
      failures.push({ type: 'llms-required-fragment', fragment });
    }
  }
  for (const fragment of llmsEntityFragments) {
    if (!text.includes(fragment)) {
      failures.push({ type: 'llms-entity-fragment', fragment });
    }
  }
  for (const fragment of llmsForbiddenEntityFragments) {
    if (text.includes(fragment)) {
      failures.push({ type: 'llms-forbidden-entity-fragment', fragment });
    }
  }

  for (const loc of locs) {
    if (!text.includes(loc)) {
      failures.push({ type: 'llms-missing-canonical-url', loc });
    }

    const markdownUrl = markdownUrlForLoc(loc);
    if (!text.includes(markdownUrl)) {
      failures.push({ type: 'llms-missing-markdown-url', loc, markdownUrl });
    }
  }

  scanStale(text, LLMS_URL, 'llms', staleHits);
}

async function verifyApiCatalog(failures) {
  const { response, text } = await fetchText(API_CATALOG_URL, {
    headers: { accept: 'application/linkset+json,application/json' },
  });

  if (!response.ok) {
    failures.push({ type: 'api-catalog-status', status: response.status });
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/linkset+json')) {
    failures.push({ type: 'api-catalog-content-type', contentType });
  }

  const catalog = parseJson(text, failures, 'api-catalog-json', API_CATALOG_URL);
  if (!catalog) return;

  const linksets = Array.isArray(catalog.linkset) ? catalog.linkset : [];
  const rootLinkset = linksets.find((entry) => entry && entry.anchor === `${SITE_URL}/`);
  if (!rootLinkset) {
    failures.push({ type: 'api-catalog-root-anchor' });
    return;
  }

  const serviceDocs = Array.isArray(rootLinkset['service-doc']) ? rootLinkset['service-doc'] : [];
  const serviceMeta = Array.isArray(rootLinkset['service-meta']) ? rootLinkset['service-meta'] : [];
  if (!serviceDocs.some((entry) => entry.href === LLMS_URL && entry.type === 'text/plain')) {
    failures.push({ type: 'api-catalog-llms-link' });
  }
  if (!serviceMeta.some((entry) => entry.href === AGENT_SKILLS_INDEX_URL && entry.type === 'application/json')) {
    failures.push({ type: 'api-catalog-agent-skills-link' });
  }
}

async function verifyAgentSkills(failures, staleHits) {
  const { response, text } = await fetchText(AGENT_SKILLS_INDEX_URL, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    failures.push({ type: 'agent-skills-index-status', status: response.status });
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    failures.push({ type: 'agent-skills-index-content-type', contentType });
  }

  const index = parseJson(text, failures, 'agent-skills-index-json', AGENT_SKILLS_INDEX_URL);
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

    const { response: skillResponse, text: skillText } = await fetchText(skill.url, {
      headers: { accept: 'text/markdown,text/plain' },
    });
    if (!skillResponse.ok) {
      failures.push({ type: 'agent-skill-status', name: skill.name, status: skillResponse.status });
      continue;
    }

    const skillContentType = skillResponse.headers.get('content-type') || '';
    if (!skillContentType.toLowerCase().includes('markdown') && !skillContentType.toLowerCase().includes('text/plain')) {
      failures.push({ type: 'agent-skill-content-type', name: skill.name, contentType: skillContentType });
    }

    const actualSha256 = sha256(skillText);
    if (skill.sha256 !== actualSha256) {
      failures.push({ type: 'agent-skill-sha256', name: skill.name, expected: skill.sha256, actual: actualSha256 });
    }
    if (!skillText.includes('TS Finanse')) {
      failures.push({ type: 'agent-skill-brand', name: skill.name });
    }
    scanStale(skillText, skill.url, 'agent-skill', staleHits);
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

function verifyRobotsPolicy(robots, failures) {
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

async function verifyCanonicalRedirects(failures) {
  const cases = [
    {
      url: 'https://www.tsfinanse.com/',
      expectedFinalUrl: `${SITE_URL}/`,
    },
    {
      url: `${SITE_URL}/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca`,
      expectedFinalUrl: `${SITE_URL}/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/`,
    },
    {
      url: 'https://www.tsfinanse.com/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca',
      expectedFinalUrl: `${SITE_URL}/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/`,
    },
  ];

  for (const testCase of cases) {
    const result = await fetchRedirectTrace(testCase.url);
    if (result.finalStatus !== 200) {
      failures.push({ type: 'canonical-redirect-status', url: testCase.url, finalStatus: result.finalStatus, trace: result.trace });
    }
    if (result.finalUrl !== testCase.expectedFinalUrl) {
      failures.push({ type: 'canonical-redirect-final-url', url: testCase.url, expectedFinalUrl: testCase.expectedFinalUrl, finalUrl: result.finalUrl, trace: result.trace });
    }
    if (result.redirectCount < 1) {
      failures.push({ type: 'canonical-redirect-count', url: testCase.url, redirectCount: result.redirectCount, trace: result.trace });
    }
  }
}

async function verifyIndexHtmlCanonicalRedirects(failures, locs) {
  for (const loc of locs) {
    const url = indexHtmlRedirectUrlForLoc(loc);
    const result = await fetchRedirectTrace(url);
    if (result.finalStatus !== 200) {
      failures.push({ type: 'index-html-canonical-redirect-status', url, finalStatus: result.finalStatus, trace: result.trace });
    }
    if (result.finalUrl !== loc) {
      failures.push({ type: 'index-html-canonical-redirect-final-url', url, expectedFinalUrl: loc, finalUrl: result.finalUrl, trace: result.trace });
    }
    if (result.redirectCount < 1) {
      failures.push({ type: 'index-html-canonical-redirect-count', url, redirectCount: result.redirectCount, trace: result.trace });
    }
  }

  const markdownAcceptCases = [
    {
      url: `${SITE_URL}/index.html`,
      expectedFinalUrl: `${SITE_URL}/`,
    },
    {
      url: `${SITE_URL}/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/index.html`,
      expectedFinalUrl: `${SITE_URL}/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/`,
    },
  ];

  for (const testCase of markdownAcceptCases) {
    const result = await fetchRedirectTrace(testCase.url, 8, {
      headers: { accept: 'text/markdown, text/html;q=0.8' },
    });
    if (result.finalStatus !== 200) {
      failures.push({ type: 'index-html-markdown-accept-redirect-status', url: testCase.url, finalStatus: result.finalStatus, trace: result.trace });
    }
    if (result.finalUrl !== testCase.expectedFinalUrl) {
      failures.push({ type: 'index-html-markdown-accept-redirect-final-url', url: testCase.url, expectedFinalUrl: testCase.expectedFinalUrl, finalUrl: result.finalUrl, trace: result.trace });
    }
    if (result.redirectCount < 1) {
      failures.push({ type: 'index-html-markdown-accept-redirect-count', url: testCase.url, redirectCount: result.redirectCount, trace: result.trace });
    }
  }

  for (const testCase of [
    { url: `${SITE_URL}/kontakt`, expectedFinalUrl: `${SITE_URL}/#contact` },
    { url: `${SITE_URL}/kontakt/`, expectedFinalUrl: `${SITE_URL}/#contact` },
  ]) {
    const result = await fetchRedirectTrace(testCase.url);
    const firstLocation = result.trace[0]?.location;
    if (result.finalStatus !== 200) {
      failures.push({ type: 'contact-alias-redirect-status', url: testCase.url, finalStatus: result.finalStatus, trace: result.trace });
    }
    if (firstLocation !== '/#contact') {
      failures.push({ type: 'contact-alias-redirect-location', url: testCase.url, expectedLocation: '/#contact', firstLocation, trace: result.trace });
    }
    if (result.redirectCount < 1) {
      failures.push({ type: 'contact-alias-redirect-count', url: testCase.url, redirectCount: result.redirectCount, trace: result.trace });
    }
  }
}

async function verifyNoSlashCanonicalRedirects(failures, locs) {
  for (const loc of locs) {
    const url = noSlashRedirectUrlForLoc(loc);
    if (!url) continue;

    const result = await fetchRedirectTrace(url);
    if (result.finalStatus !== 200) {
      failures.push({ type: 'no-slash-canonical-redirect-status', url, finalStatus: result.finalStatus, trace: result.trace });
    }
    if (result.finalUrl !== loc) {
      failures.push({ type: 'no-slash-canonical-redirect-final-url', url, expectedFinalUrl: loc, finalUrl: result.finalUrl, trace: result.trace });
    }
    if (result.redirectCount < 1) {
      failures.push({ type: 'no-slash-canonical-redirect-count', url, redirectCount: result.redirectCount, trace: result.trace });
    }
  }
}

async function verifyUnknownUrl404s(failures) {
  for (const url of unknownUrl404Targets) {
    const { response, text } = await fetchText(url, {
      redirect: 'manual',
      headers: { accept: 'text/html,application/json;q=0.8,*/*;q=0.1' },
    });
    const location = response.headers.get('location');
    const contentType = response.headers.get('content-type') || '';

    if (response.status !== 404) {
      failures.push({ type: 'unknown-url-status', url, status: response.status, contentType, location });
    }
    if (location) {
      failures.push({ type: 'unknown-url-redirect', url, status: response.status, location });
    }

    const robots = extractMetaName(text, 'robots') || '';
    if (!hasNoindexNofollow(robots)) {
      failures.push({ type: 'unknown-url-robots', url, status: response.status, robots, contentType });
    }

    const canonical = extractCanonical(text);
    if (canonical) {
      failures.push({ type: 'unknown-url-canonical', url, canonical });
    }

    const title = extractTitle(text) || '';
    if (!title.includes('Nie znaleziono strony') || !title.includes('TS Finanse')) {
      failures.push({ type: 'unknown-url-title', url, title, contentType });
    }
  }
}

async function verifyAdminSurface(failures) {
  const { response, text } = await fetchText(ADMIN_URL, {
    headers: { accept: 'text/html' },
  });

  if (!response.ok) {
    failures.push({ type: 'admin-status', url: ADMIN_URL, status: response.status });
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('html')) {
    failures.push({ type: 'admin-content-type', url: ADMIN_URL, contentType });
  }

  const xRobotsTag = response.headers.get('x-robots-tag') || '';
  if (!hasNoindexNofollow(xRobotsTag)) {
    failures.push({ type: 'admin-x-robots-tag', url: ADMIN_URL, xRobotsTag });
  }

  const robots = extractMetaName(text, 'robots') || '';
  if (!hasNoindexNofollow(robots)) {
    failures.push({ type: 'admin-robots', url: ADMIN_URL, robots });
  }

  const canonical = extractCanonical(text);
  if (canonical) {
    failures.push({ type: 'admin-canonical', url: ADMIN_URL, canonical });
  }
}

function readVariantRedirectTargets(failures) {
  if (!existsSync(VARIANT_REDIRECT_TARGETS_PATH)) {
    failures.push({ type: 'variant-redirect-targets-file-missing', file: VARIANT_REDIRECT_TARGETS_PATH });
    return [];
  }

  try {
    const targets = JSON.parse(readFileSync(VARIANT_REDIRECT_TARGETS_PATH, 'utf8'));
    if (!Array.isArray(targets) || targets.length === 0) {
      failures.push({ type: 'variant-redirect-targets-empty', file: VARIANT_REDIRECT_TARGETS_PATH });
      return [];
    }

    return targets;
  } catch (error) {
    failures.push({
      type: 'variant-redirect-targets-json-invalid',
      file: VARIANT_REDIRECT_TARGETS_PATH,
      message: error.message,
    });
    return [];
  }
}

async function verifyGscVariantRedirectTargets(failures, locs) {
  const locSet = new Set(locs);
  const targets = readVariantRedirectTargets(failures);

  for (const target of targets) {
    const rawUrl = target.rawUrl;
    const canonical = target.canonical;

    if (!rawUrl || !canonical) {
      failures.push({ type: 'variant-redirect-target-invalid-entry', target });
      continue;
    }
    if (!locSet.has(canonical)) {
      failures.push({ type: 'variant-redirect-target-canonical-missing-from-sitemap', rawUrl, canonical });
      continue;
    }

    const result = await fetchRedirectTrace(rawUrl);
    if (result.finalStatus !== 200) {
      failures.push({ type: 'variant-redirect-target-status', rawUrl, canonical, finalStatus: result.finalStatus, trace: result.trace });
    }
    if (result.finalUrl !== canonical) {
      failures.push({ type: 'variant-redirect-target-final-url', rawUrl, canonical, finalUrl: result.finalUrl, trace: result.trace });
    }
    if (result.redirectCount < 1) {
      failures.push({ type: 'variant-redirect-target-count', rawUrl, canonical, redirectCount: result.redirectCount, trace: result.trace });
    }
  }
}

async function main() {
  const failures = [];
  const staleHits = [];
  const titlesByValue = new Map();
  const descriptionsByValue = new Map();
  const blogTopicSignalsByLoc = new Map();
  const htmlByLoc = new Map();

  const { response: homepageResponse } = await fetchText(`${SITE_URL}/`, {
    headers: { accept: 'text/html' },
  });
  if (!homepageResponse.ok) {
    failures.push({ type: 'homepage-status', status: homepageResponse.status });
  } else {
    verifyDiscoveryHeaders(homepageResponse.headers, failures);
  }

  await verifyIndexNowKeyFile(failures);
  await verifyApiCatalog(failures);
  await verifyAgentSkills(failures, staleHits);

  const { response: robotsResponse, text: robots } = await fetchText(ROBOTS_URL, {
    headers: { accept: 'text/plain' },
  });
  if (!robotsResponse.ok) {
    failures.push({ type: 'robots-status', status: robotsResponse.status });
  } else {
    verifyDiscoveryFileCache({ response: robotsResponse, url: ROBOTS_URL, failures });
    verifyRobotsPolicy(robots, failures);
  }

  await verifyCanonicalRedirects(failures);

  const { response: sitemapResponse, text: sitemap } = await fetchText(SITEMAP_URL);
  if (!sitemapResponse.ok) {
    failures.push({ type: 'sitemap-status', status: sitemapResponse.status });
  } else {
    verifyDiscoveryFileCache({ response: sitemapResponse, url: SITEMAP_URL, failures });
  }

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapLastmods = parseSitemapLastmods(sitemap);
  const sitemapImages = parseSitemapImages(sitemap);
  if (!sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
    failures.push({ type: 'sitemap-image-namespace' });
  }
  verifySitemapLastmods({ sitemapLastmods, locs, failures });
  verifySitemapHrefLangs({ sitemap, locs, failures });
  if (locs.length !== EXPECTED_LOC_COUNT) {
    failures.push({ type: 'sitemap-count', expected: EXPECTED_LOC_COUNT, actual: locs.length });
  }
  await verifyIndexHtmlCanonicalRedirects(failures, locs);
  await verifyNoSlashCanonicalRedirects(failures, locs);
  await verifyGscVariantRedirectTargets(failures, locs);
  await verifyUnknownUrl404s(failures);
  await verifyAdminSurface(failures);
  await verifyDirectMarkdownNoindexHeaders(failures, locs);
  await verifyLlmsSurface(failures, staleHits, locs);

  const { response: rssResponse, text: rss } = await fetchText(RSS_URL, {
    headers: { accept: 'application/rss+xml,application/xml,text/xml,*/*' },
  });
  if (!rssResponse.ok) {
    failures.push({ type: 'rss-status', status: rssResponse.status });
  } else {
    verifyDiscoveryFileCache({ response: rssResponse, url: RSS_URL, failures });
    const contentType = rssResponse.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('xml') && !contentType.toLowerCase().includes('rss')) {
      failures.push({ type: 'rss-content-type', contentType });
    }
  }

  for (const loc of locs) {
    const url = new URL(loc);
    const expectedCanonical = `${SITE_URL}${canonicalPath(url.pathname)}`;
    const isBlogPost = url.pathname.startsWith('/blog/') && url.pathname !== '/blog/';
    const isBlogIndex = url.pathname === '/blog/';

    const { response, text: html } = await fetchText(loc, { headers: { accept: 'text/html' } });
    if (!response.ok) {
      failures.push({ type: 'html-status', loc, status: response.status });
      continue;
    }
    if (response.url !== expectedCanonical) failures.push({ type: 'html-effective-url', loc, effectiveUrl: response.url });
    htmlByLoc.set(loc, html);

    const canonical = extractCanonical(html);
    if (canonical !== expectedCanonical) failures.push({ type: 'canonical', loc, canonical });
    verifyLanguageMetadata({ html, loc, failures });
    verifySnippetMetadata({ html, loc, failures, titlesByValue, descriptionsByValue });
    if (!hasAlternateMarkdown(html, markdownUrlForLoc(expectedCanonical))) failures.push({ type: 'missing-markdown-alternate', loc });
    if (!hasAlternateHrefLang(html, 'pl-PL', expectedCanonical)) failures.push({ type: 'missing-hreflang-pl', loc });
    if (!hasAlternateHrefLang(html, 'x-default', expectedCanonical)) failures.push({ type: 'missing-hreflang-default', loc });
    if (!hasAlternateRss(html)) failures.push({ type: 'missing-rss-alternate', loc });
    if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) failures.push({ type: 'noindex', loc });
    const htmlXRobotsTag = response.headers.get('x-robots-tag') || '';
    if (htmlXRobotsTag.toLowerCase().includes('noindex')) {
      failures.push({ type: 'html-x-robots-noindex-header', loc, xRobotsTag: htmlXRobotsTag });
    }

    const noscripts = (html.match(/<noscript\b/gi) || []).length;
    if (noscripts !== 1) failures.push({ type: 'noscript-count', loc, noscripts });

    const h1s = (html.match(/<h1\b/gi) || []).length;
    if (h1s !== 1) failures.push({ type: 'h1-count', loc, h1s });

    verifyBreadcrumbSchema({ html, loc, failures });
    verifyWebPageSchema({ html, loc, failures });
    verifyWebSiteSearchSchema({ html, loc, failures });
    verifyBlogSearchForm({ html, loc, failures });
    verifyHtmlInternalLinks({ html, loc, locs, failures });
    verifyLegalStaticContent({ html, loc, failures });
    scanStale(html, loc, 'html', staleHits);

    const { response: markdownResponse, text: markdown } = await fetchText(loc, {
      headers: { accept: 'text/markdown' },
    });
    const contentType = markdownResponse.headers.get('content-type') || '';
    if (!markdownResponse.ok) failures.push({ type: 'markdown-status', loc, status: markdownResponse.status });
    if (!contentType.toLowerCase().includes('text/markdown')) failures.push({ type: 'markdown-content-type', loc, contentType });
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

  verifyStaticCrawlGraph({ htmlByLoc, locs, failures });

  if (rssResponse.ok) {
    verifyRssFeed({ rss, locs, sitemapLastmods, blogTopicSignalsByLoc, failures });
  }

  verifyUniqueSnippetMetadata({ titlesByValue, descriptionsByValue, failures });

  const result = {
    sitemapUrl: SITEMAP_URL,
    rssUrl: RSS_URL,
    robotsUrl: ROBOTS_URL,
    locCount: locs.length,
    unknownUrl404Count: unknownUrl404Targets.length,
    failureCount: failures.length,
    staleHitCount: staleHits.length,
    failures: failures.slice(0, 30),
    staleHits: staleHits.slice(0, 30),
  };

  console.log(JSON.stringify(result, null, 2));

  if (failures.length || staleHits.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

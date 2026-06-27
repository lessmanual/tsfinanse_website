import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const SITE_URL = 'https://tsfinanse.com';
const root = process.cwd();
const sitemapPath = join(root, 'dist', 'sitemap.xml');
const rssPath = join(root, 'dist', 'rss.xml');
const robotsPath = join(root, 'dist', 'robots.txt');
const headersPath = join(root, 'dist', '_headers');
const llmsPath = join(root, 'dist', 'llms.txt');
const apiCatalogPath = join(root, 'dist', '.well-known', 'api-catalog');
const agentSkillsIndexPath = join(root, 'dist', '.well-known', 'agent-skills', 'index.json');
const edgeFunctionPath = join(root, 'netlify', 'edge-functions', 'markdown-negotiation.js');

const expectedContentSignal = 'Content-Signal: search=yes, ai-train=no, ai-input=yes';
const minimumLlmsUpdatedDate = '2026-06-01';

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

function parseSitemapLastmods(sitemap) {
  return new Map([...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
    .map((match) => [match[1], match[2]]));
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

function verifyRssFeed({ rss, locs, failures }) {
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

function verifyDiscoveryHeaders(failures) {
  if (!existsSync(headersPath)) {
    failures.push({ type: 'missing-netlify-headers', file: headersPath });
    return;
  }

  const headers = readFileSync(headersPath, 'utf8');
  const requiredLinks = [
    '</llms.txt>; rel="alternate"; type="text/plain"',
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
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
    '/llms.txt\n  Content-Type: text/plain; charset=utf-8',
  ];

  for (const requiredContentType of requiredContentTypes) {
    if (!headers.includes(requiredContentType)) {
      failures.push({ type: 'netlify-header-content-type', expected: requiredContentType });
    }
  }
}

function verifyLlmsSurface(failures, staleHits) {
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

if (!sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
  failures.push({ type: 'sitemap-image-namespace' });
}

verifyDiscoveryHeaders(failures);
verifyLlmsSurface(failures, staleHits);
verifyApiCatalog(failures);
verifyAgentSkills(failures, staleHits);
verifyRobotsPolicy(failures);

const expectedMarkdownFiles = new Set(locs.map((loc) => markdownPathForUrl(loc)));
for (const markdownFile of collectMarkdownFiles(join(root, 'dist', 'md'))) {
  if (!expectedMarkdownFiles.has(markdownFile)) {
    failures.push({ type: 'unexpected-markdown-artifact', file: markdownFile });
  }
}

const expectedHtmlFiles = new Set([
  ...locs.map((loc) => htmlPathForUrl(loc)),
  join(root, 'dist', '404.html'),
  join(root, 'dist', 'admin', 'index.html'),
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
  if (!hasAlternateMarkdown(html, expectedCanonical)) failures.push({ type: 'missing-markdown-alternate', loc });
  if (!hasAlternateRss(html)) failures.push({ type: 'missing-rss-alternate', loc });
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
  }

  if (url.pathname === '/') {
    verifyHomepageEntitySchema({ html, failures });
  }
}

await verifyMarkdownEdgeFunction(failures);
verifyRssFeed({ rss, locs, failures });

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

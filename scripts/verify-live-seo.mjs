import { createHash } from 'crypto';

const SITE_URL = 'https://tsfinanse.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const RSS_URL = `${SITE_URL}/rss.xml`;
const ROBOTS_URL = `${SITE_URL}/robots.txt`;
const LLMS_URL = `${SITE_URL}/llms.txt`;
const API_CATALOG_URL = `${SITE_URL}/.well-known/api-catalog`;
const AGENT_SKILLS_INDEX_URL = `${SITE_URL}/.well-known/agent-skills/index.json`;
const REQUEST_TIMEOUT_MS = 15000;
const EXPECTED_LOC_COUNT = 73;
const minimumLlmsUpdatedDate = '2026-06-01';

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

async function fetchRedirectTrace(rawUrl, limit = 8) {
  const trace = [];
  let currentUrl = rawUrl;

  for (let count = 0; count < limit; count += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: { accept: 'text/html' },
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

function parseSitemapLastmods(sitemap) {
  return new Map([...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
    .map((match) => [match[1], match[2]]));
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
    '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  ];

  for (const requiredLink of requiredLinks) {
    if (!linkHeader.includes(requiredLink)) {
      failures.push({ type: 'discovery-link-header', expected: requiredLink, actual: linkHeader });
    }
  }
}

async function verifyLlmsSurface(failures, staleHits) {
  const { response, text } = await fetchText(LLMS_URL, {
    headers: { accept: 'text/plain' },
  });

  if (!response.ok) {
    failures.push({ type: 'llms-status', status: response.status });
    return;
  }

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

async function main() {
  const failures = [];
  const staleHits = [];

  const { response: homepageResponse } = await fetchText(`${SITE_URL}/`, {
    headers: { accept: 'text/html' },
  });
  if (!homepageResponse.ok) {
    failures.push({ type: 'homepage-status', status: homepageResponse.status });
  } else {
    verifyDiscoveryHeaders(homepageResponse.headers, failures);
  }

  await verifyLlmsSurface(failures, staleHits);
  await verifyApiCatalog(failures);
  await verifyAgentSkills(failures, staleHits);

  const { response: robotsResponse, text: robots } = await fetchText(ROBOTS_URL, {
    headers: { accept: 'text/plain' },
  });
  if (!robotsResponse.ok) {
    failures.push({ type: 'robots-status', status: robotsResponse.status });
  } else {
    verifyRobotsPolicy(robots, failures);
  }

  await verifyCanonicalRedirects(failures);

  const { response: sitemapResponse, text: sitemap } = await fetchText(SITEMAP_URL);
  if (!sitemapResponse.ok) {
    failures.push({ type: 'sitemap-status', status: sitemapResponse.status });
  }

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapLastmods = parseSitemapLastmods(sitemap);
  if (locs.length !== EXPECTED_LOC_COUNT) {
    failures.push({ type: 'sitemap-count', expected: EXPECTED_LOC_COUNT, actual: locs.length });
  }

  const { response: rssResponse, text: rss } = await fetchText(RSS_URL, {
    headers: { accept: 'application/rss+xml,application/xml,text/xml,*/*' },
  });
  if (!rssResponse.ok) {
    failures.push({ type: 'rss-status', status: rssResponse.status });
  } else {
    const contentType = rssResponse.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('xml') && !contentType.toLowerCase().includes('rss')) {
      failures.push({ type: 'rss-content-type', contentType });
    }
    verifyRssFeed({ rss, locs, failures });
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

    const { response: markdownResponse, text: markdown } = await fetchText(loc, {
      headers: { accept: 'text/markdown' },
    });
    const contentType = markdownResponse.headers.get('content-type') || '';
    if (!markdownResponse.ok) failures.push({ type: 'markdown-status', loc, status: markdownResponse.status });
    if (!contentType.toLowerCase().includes('text/markdown')) failures.push({ type: 'markdown-content-type', loc, contentType });
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
  }

  const result = {
    sitemapUrl: SITEMAP_URL,
    rssUrl: RSS_URL,
    robotsUrl: ROBOTS_URL,
    locCount: locs.length,
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

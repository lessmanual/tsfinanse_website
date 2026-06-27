const SITE_URL = 'https://tsfinanse.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const ROBOTS_URL = `${SITE_URL}/robots.txt`;
const REQUEST_TIMEOUT_MS = 15000;
const EXPECTED_LOC_COUNT = 73;

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

async function main() {
  const failures = [];
  const staleHits = [];

  const { response: robotsResponse, text: robots } = await fetchText(ROBOTS_URL, {
    headers: { accept: 'text/plain' },
  });
  if (!robotsResponse.ok) {
    failures.push({ type: 'robots-status', status: robotsResponse.status });
  } else {
    verifyRobotsPolicy(robots, failures);
  }

  const { response: sitemapResponse, text: sitemap } = await fetchText(SITEMAP_URL);
  if (!sitemapResponse.ok) {
    failures.push({ type: 'sitemap-status', status: sitemapResponse.status });
  }

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locs.length !== EXPECTED_LOC_COUNT) {
    failures.push({ type: 'sitemap-count', expected: EXPECTED_LOC_COUNT, actual: locs.length });
  }

  for (const loc of locs) {
    const url = new URL(loc);
    const expectedCanonical = `${SITE_URL}${canonicalPath(url.pathname)}`;

    const { response, text: html } = await fetchText(loc, { headers: { accept: 'text/html' } });
    if (!response.ok) {
      failures.push({ type: 'html-status', loc, status: response.status });
      continue;
    }
    if (response.url !== expectedCanonical) failures.push({ type: 'html-effective-url', loc, effectiveUrl: response.url });

    const canonical = extractCanonical(html);
    if (canonical !== expectedCanonical) failures.push({ type: 'canonical', loc, canonical });
    if (!hasAlternateMarkdown(html, expectedCanonical)) failures.push({ type: 'missing-markdown-alternate', loc });
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
  }

  const result = {
    sitemapUrl: SITEMAP_URL,
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

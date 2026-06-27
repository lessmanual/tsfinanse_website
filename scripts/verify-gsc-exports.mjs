import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const HOSTS = new Set(['tsfinanse.com', 'www.tsfinanse.com']);
const DEFAULT_SITEMAP_PATH = resolve(process.cwd(), 'dist', 'sitemap.xml');
const DEFAULT_QUERY_TARGETS_PATH = resolve(process.cwd(), 'content', 'gsc-priority-query-targets.json');
const COVERAGE_REASON_THRESHOLDS = {
  redirectError: 'Redirect error',
  discoveredNotIndexed: 'Discovered - currently not indexed',
  crawledNotIndexed: 'Crawled - currently not indexed',
  googleDifferentCanonical: 'Duplicate, Google chose different canonical than user',
};

function parseArgs(args) {
  const options = {
    sitemapPath: DEFAULT_SITEMAP_PATH,
    queryTargetsPath: DEFAULT_QUERY_TARGETS_PATH,
    coverageDir: process.env.GSC_COVERAGE_DIR,
    performanceDir: process.env.GSC_PERFORMANCE_DIR,
    coverageLimits: {},
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--sitemap') {
      const value = args[index + 1];
      if (!value) throw new Error('--sitemap requires a file path');
      options.sitemapPath = resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    if (arg === '--query-targets') {
      const value = args[index + 1];
      if (!value) throw new Error('--query-targets requires a file path');
      options.queryTargetsPath = resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    if (arg === '--coverage-dir') {
      const value = args[index + 1];
      if (!value) throw new Error('--coverage-dir requires a directory path');
      options.coverageDir = resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    if (arg === '--performance-dir') {
      const value = args[index + 1];
      if (!value) throw new Error('--performance-dir requires a directory path');
      options.performanceDir = resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    if (arg === '--strict-coverage') {
      options.coverageLimits.redirectError = 0;
      options.coverageLimits.discoveredNotIndexed = 0;
      options.coverageLimits.crawledNotIndexed = 0;
      options.coverageLimits.googleDifferentCanonical = 0;
      continue;
    }
    if (arg === '--max-redirect-error-pages') {
      options.coverageLimits.redirectError = parseLimit(args[index + 1], arg);
      index += 1;
      continue;
    }
    if (arg === '--max-discovered-not-indexed-pages') {
      options.coverageLimits.discoveredNotIndexed = parseLimit(args[index + 1], arg);
      index += 1;
      continue;
    }
    if (arg === '--max-crawled-not-indexed-pages') {
      options.coverageLimits.crawledNotIndexed = parseLimit(args[index + 1], arg);
      index += 1;
      continue;
    }
    if (arg === '--max-google-different-canonical-pages') {
      options.coverageLimits.googleDifferentCanonical = parseLimit(args[index + 1], arg);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.coverageDir) throw new Error('Missing --coverage-dir or GSC_COVERAGE_DIR');
  if (!options.performanceDir) throw new Error('Missing --performance-dir or GSC_PERFORMANCE_DIR');

  return options;
}

function parseLimit(value, flag) {
  if (value === undefined) throw new Error(`${flag} requires a non-negative integer`);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${flag} requires a non-negative integer, got: ${value}`);
  }
  return parsed;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    if (char !== '\r') field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...bodyRows] = rows.filter((item) => item.some((fieldValue) => fieldValue !== ''));
  if (!headers) return [];

  return bodyRows.map((bodyRow) => Object.fromEntries(headers.map((header, index) => [
    header,
    bodyRow[index] ?? '',
  ])));
}

function readCsv(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing CSV: ${filePath}`);
  }
  return parseCsv(readFileSync(filePath, 'utf8'));
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing JSON: ${filePath}`);
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function parseInteger(value) {
  const parsed = Number.parseInt(String(value || '').replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function canonicaliseGoogleUrl(rawUrl) {
  const url = new URL(rawUrl);
  const isExpectedHost = HOSTS.has(url.host);
  const canonical = `${SITE_URL}${canonicalPath(url.pathname)}`;

  return {
    rawUrl,
    host: url.host,
    isExpectedHost,
    canonical,
    isVariant: rawUrl !== canonical,
  };
}

function normaliseText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ł]/g, 'l')
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownPathForLoc(loc, sitemapPath) {
  const sitemapDir = dirname(sitemapPath);
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return join(sitemapDir, 'md', 'index.md');
  return join(sitemapDir, 'md', `${pathname.replace(/^\//, '').replace(/\/$/, '')}.md`);
}

function readSitemapLocs(sitemapPath) {
  if (!existsSync(sitemapPath)) {
    throw new Error(`${sitemapPath} does not exist. Run npm run build first or pass --sitemap.`);
  }
  const sitemap = readFileSync(sitemapPath, 'utf8');
  return new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function groupCoverageIssues(coverageRows) {
  return coverageRows.map((row) => ({
    reason: row.Reason,
    source: row.Source,
    validation: row.Validation,
    pages: parseInteger(row.Pages),
  }));
}

function latestCoverageSnapshot(chartRows) {
  const snapshots = chartRows
    .map((row) => ({
      date: row.Date,
      notIndexed: parseInteger(row['Not indexed']),
      indexed: parseInteger(row.Indexed),
      impressions: parseInteger(row.Impressions),
    }))
    .filter((row) => row.date && (row.notIndexed > 0 || row.indexed > 0 || row.impressions > 0));

  return snapshots[snapshots.length - 1] || null;
}

function coverageIssuePageCountByReason(coverageIssues) {
  return Object.fromEntries(coverageIssues.map((issue) => [issue.reason, issue.pages]));
}

function verifyCoverageIssues(coverageIssues, coverageLimits) {
  const byReason = coverageIssuePageCountByReason(coverageIssues);
  const failures = [];

  for (const [key, reason] of Object.entries(COVERAGE_REASON_THRESHOLDS)) {
    const limit = coverageLimits[key];
    if (limit === undefined) continue;

    const pages = byReason[reason] || 0;
    if (pages > limit) {
      failures.push({
        type: 'coverage-limit',
        reason,
        pages,
        limit,
      });
    }
  }

  return failures;
}

function verifyPerformancePages(performanceRows, sitemapLocs) {
  const mapped = [];
  const variants = [];
  const unmapped = [];
  const unexpectedHosts = [];

  for (const row of performanceRows) {
    const rawUrl = row['Top pages'];
    if (!rawUrl) continue;

    const current = canonicaliseGoogleUrl(rawUrl);
    const entry = {
      rawUrl,
      canonical: current.canonical,
      clicks: parseInteger(row.Clicks),
      impressions: parseInteger(row.Impressions),
      ctr: row.CTR,
      position: row.Position,
    };

    if (!current.isExpectedHost) unexpectedHosts.push({ ...entry, host: current.host });
    if (!sitemapLocs.has(current.canonical)) {
      unmapped.push(entry);
      continue;
    }

    mapped.push(entry);
    if (current.isVariant) variants.push(entry);
  }

  return {
    mapped,
    variants,
    unmapped,
    unexpectedHosts,
  };
}

function verifyPriorityQueryTargets({ queryRows, queryTargets, sitemapLocs, sitemapPath }) {
  if (!Array.isArray(queryTargets) || queryTargets.length === 0) {
    return {
      checks: [],
      failures: [{ type: 'priority-query-targets-empty' }],
    };
  }

  const queryRowsByQuery = new Map(queryRows.map((row) => [normaliseText(row['Top queries']), row]));
  const checks = [];
  const failures = [];

  for (const target of queryTargets) {
    const query = target.query;
    const canonical = target.canonical;
    const requiredTerms = target.requiredTerms;

    if (!query || !canonical) {
      failures.push({ type: 'priority-query-target-invalid-entry', target });
      continue;
    }
    if (!Array.isArray(requiredTerms) || requiredTerms.length === 0) {
      failures.push({ type: 'priority-query-target-required-terms-empty', query, canonical });
      continue;
    }

    const queryRow = queryRowsByQuery.get(normaliseText(query));
    if (!queryRow) {
      failures.push({ type: 'priority-query-target-query-missing', query, canonical });
      continue;
    }
    if (!sitemapLocs.has(canonical)) {
      failures.push({ type: 'priority-query-target-canonical-missing-from-sitemap', query, canonical });
      continue;
    }

    const markdownPath = markdownPathForLoc(canonical, sitemapPath);
    if (!existsSync(markdownPath)) {
      failures.push({ type: 'priority-query-target-markdown-missing', query, canonical, markdownPath });
      continue;
    }

    const markdown = readFileSync(markdownPath, 'utf8');
    const normalisedMarkdown = normaliseText(markdown);
    const missingTerms = requiredTerms.filter((term) => !normalisedMarkdown.includes(normaliseText(term)));
    if (missingTerms.length > 0) {
      failures.push({ type: 'priority-query-target-required-terms-missing', query, canonical, missingTerms });
    }
    if (!markdown.includes('## W skrócie')) {
      failures.push({ type: 'priority-query-target-answer-block-missing', query, canonical });
    }

    checks.push({
      query,
      canonical,
      clicks: parseInteger(queryRow.Clicks),
      impressions: parseInteger(queryRow.Impressions),
      ctr: queryRow.CTR,
      position: queryRow.Position,
      requiredTerms,
      missingTerms,
    });
  }

  return { checks, failures };
}

function summarise(performanceCheck, coverageIssues, latestCoverage, coverageFailures, sitemapLocs, queryTargetCheck) {
  const totalImpressions = performanceCheck.mapped.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = performanceCheck.mapped.reduce((sum, item) => sum + item.clicks, 0);
  const variantImpressions = performanceCheck.variants.reduce((sum, item) => sum + item.impressions, 0);
  const coverageIssuePages = coverageIssues.reduce((sum, issue) => sum + issue.pages, 0);
  const queryTargetImpressions = queryTargetCheck.checks.reduce((sum, item) => sum + item.impressions, 0);

  return {
    sitemapUrlCount: sitemapLocs.size,
    latestCoverage,
    coverageIssues,
    coverageIssuePages,
    coverageIssuePageCountByReason: coverageIssuePageCountByReason(coverageIssues),
    coverageFailures,
    performanceUrlCount: performanceCheck.mapped.length + performanceCheck.unmapped.length,
    mappedPerformanceUrlCount: performanceCheck.mapped.length,
    unmappedPerformanceUrlCount: performanceCheck.unmapped.length,
    variantUrlCount: performanceCheck.variants.length,
    totalClicks,
    totalImpressions,
    variantImpressions,
    priorityQueryTargetCount: queryTargetCheck.checks.length,
    priorityQueryTargetImpressions: queryTargetImpressions,
    priorityQueryTargetFailures: queryTargetCheck.failures,
    priorityQueryTargets: queryTargetCheck.checks.slice(0, 20),
    variants: performanceCheck.variants.slice(0, 20),
    unmapped: performanceCheck.unmapped.slice(0, 20),
    unexpectedHosts: performanceCheck.unexpectedHosts.slice(0, 20),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sitemapLocs = readSitemapLocs(options.sitemapPath);
  const coverageIssues = groupCoverageIssues(readCsv(join(options.coverageDir, 'Critical issues.csv')));
  const latestCoverage = latestCoverageSnapshot(readCsv(join(options.coverageDir, 'Chart.csv')));
  const coverageFailures = verifyCoverageIssues(coverageIssues, options.coverageLimits);
  const performanceRows = readCsv(join(options.performanceDir, 'Pages.csv'));
  const performanceCheck = verifyPerformancePages(performanceRows, sitemapLocs);
  const queryRows = readCsv(join(options.performanceDir, 'Queries.csv'));
  const queryTargets = readJson(options.queryTargetsPath);
  const queryTargetCheck = verifyPriorityQueryTargets({
    queryRows,
    queryTargets,
    sitemapLocs,
    sitemapPath: options.sitemapPath,
  });
  const summary = summarise(performanceCheck, coverageIssues, latestCoverage, coverageFailures, sitemapLocs, queryTargetCheck);

  console.log(JSON.stringify(summary, null, 2));

  if (
    summary.unmappedPerformanceUrlCount > 0
    || summary.unexpectedHosts.length > 0
    || summary.coverageFailures.length > 0
    || summary.priorityQueryTargetFailures.length > 0
    || summary.performanceUrlCount === 0
  ) {
    process.exit(1);
  }
}

main();

import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const HOSTS = new Set(['tsfinanse.com', 'www.tsfinanse.com']);
const DEFAULT_SITEMAP_PATH = resolve(process.cwd(), 'dist', 'sitemap.xml');

function parseArgs(args) {
  const options = {
    sitemapPath: DEFAULT_SITEMAP_PATH,
    coverageDir: process.env.GSC_COVERAGE_DIR,
    performanceDir: process.env.GSC_PERFORMANCE_DIR,
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
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.coverageDir) throw new Error('Missing --coverage-dir or GSC_COVERAGE_DIR');
  if (!options.performanceDir) throw new Error('Missing --performance-dir or GSC_PERFORMANCE_DIR');

  return options;
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

function summarise(performanceCheck, coverageIssues, sitemapLocs) {
  const totalImpressions = performanceCheck.mapped.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = performanceCheck.mapped.reduce((sum, item) => sum + item.clicks, 0);
  const variantImpressions = performanceCheck.variants.reduce((sum, item) => sum + item.impressions, 0);

  return {
    sitemapUrlCount: sitemapLocs.size,
    coverageIssues,
    performanceUrlCount: performanceCheck.mapped.length + performanceCheck.unmapped.length,
    mappedPerformanceUrlCount: performanceCheck.mapped.length,
    unmappedPerformanceUrlCount: performanceCheck.unmapped.length,
    variantUrlCount: performanceCheck.variants.length,
    totalClicks,
    totalImpressions,
    variantImpressions,
    variants: performanceCheck.variants.slice(0, 20),
    unmapped: performanceCheck.unmapped.slice(0, 20),
    unexpectedHosts: performanceCheck.unexpectedHosts.slice(0, 20),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sitemapLocs = readSitemapLocs(options.sitemapPath);
  const coverageIssues = groupCoverageIssues(readCsv(join(options.coverageDir, 'Critical issues.csv')));
  const performanceRows = readCsv(join(options.performanceDir, 'Pages.csv'));
  const performanceCheck = verifyPerformancePages(performanceRows, sitemapLocs);
  const summary = summarise(performanceCheck, coverageIssues, sitemapLocs);

  console.log(JSON.stringify(summary, null, 2));

  if (
    summary.unmappedPerformanceUrlCount > 0
    || summary.unexpectedHosts.length > 0
    || summary.performanceUrlCount === 0
  ) {
    process.exit(1);
  }
}

main();

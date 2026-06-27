import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const DIST_DIR = resolve(process.cwd(), 'dist');
const SITEMAP_PATH = resolve(DIST_DIR, 'sitemap.xml');
const REDIRECTS_PATH = resolve(DIST_DIR, '_redirects');
const GENERATED_START = '# BEGIN generated canonical URL redirects';
const GENERATED_END = '# END generated canonical URL redirects';

function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function indexHtmlPathForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return '/index.html';
  return `${canonicalPath(pathname)}index.html`;
}

function redirectTargetForLoc(loc) {
  return new URL(loc).pathname;
}

function stripPreviousGeneratedBlock(source) {
  const start = source.indexOf(GENERATED_START);
  if (start === -1) return source.trimEnd();

  const end = source.indexOf(GENERATED_END, start);
  if (end === -1) {
    throw new Error(`${REDIRECTS_PATH} has generated redirects start marker without end marker`);
  }

  return `${source.slice(0, start).trimEnd()}\n${source.slice(end + GENERATED_END.length).trimStart()}`.trimEnd();
}

function parseSitemapLocs() {
  if (!existsSync(SITEMAP_PATH)) {
    throw new Error(`${SITEMAP_PATH} does not exist. Run sitemap generation first.`);
  }

  const sitemap = readFileSync(SITEMAP_PATH, 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function buildRedirectBlock(locs) {
  const rules = [
    '# Collapse static index.html artefact URLs into canonical sitemap URLs.',
    ...locs.map((loc) => `${indexHtmlPathForLoc(loc)}  ${redirectTargetForLoc(loc)}  301`),
    '# Collapse contact alias variants into the homepage contact section.',
    '/kontakt/  /#contact  301',
  ];

  return `${GENERATED_START}\n${rules.join('\n')}\n${GENERATED_END}`;
}

const locs = parseSitemapLocs();
const existing = existsSync(REDIRECTS_PATH) ? readFileSync(REDIRECTS_PATH, 'utf8') : '';
const base = stripPreviousGeneratedBlock(existing);
const next = `${base}\n\n${buildRedirectBlock(locs)}\n`;

writeFileSync(REDIRECTS_PATH, next);
console.log(`Generated canonical redirects: ${locs.length} index.html redirects + 1 contact alias`);

if (!locs.every((loc) => loc.startsWith(`${SITE_URL}/`))) {
  throw new Error('Sitemap contains non-canonical loc outside SITE_URL');
}

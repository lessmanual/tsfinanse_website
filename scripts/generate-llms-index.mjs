import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const DIST_DIR = resolve(process.cwd(), 'dist');
const SITEMAP_PATH = resolve(DIST_DIR, 'sitemap.xml');
const LLMS_PATH = resolve(DIST_DIR, 'llms.txt');
const GENERATED_START = '# ============================================================\n# DISCOVERABLE CONTENT INDEX\n# ============================================================';
const GENERATED_END = '# END DISCOVERABLE CONTENT INDEX';
const FILE_END = '# END OF LLMS.TXT';

function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function markdownPathForLoc(loc) {
  const pathname = decodeURIComponent(new URL(loc).pathname);
  if (pathname === '/') return resolve(DIST_DIR, 'md', 'index.md');
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return resolve(DIST_DIR, `md${normalised}.md`);
}

function markdownUrlForLoc(loc) {
  const pathname = new URL(loc).pathname;
  if (pathname === '/') return `${SITE_URL}/md/index.md`;
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${SITE_URL}/md${normalised}.md`;
}

function parseSitemapLocs() {
  if (!existsSync(SITEMAP_PATH)) {
    throw new Error(`${SITEMAP_PATH} does not exist. Run sitemap generation first.`);
  }

  const sitemap = readFileSync(SITEMAP_PATH, 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) return undefined;
        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();

        try {
          return [key, JSON.parse(rawValue)];
        } catch {
          return [key, rawValue.replace(/^["']|["']$/g, '')];
        }
      })
      .filter(Boolean),
  );
}

function pageMetadata(loc) {
  const markdownPath = markdownPathForLoc(loc);
  if (!existsSync(markdownPath)) {
    throw new Error(`Missing markdown variant for ${loc}: ${markdownPath}`);
  }

  const frontmatter = parseFrontmatter(readFileSync(markdownPath, 'utf8'));
  return {
    loc,
    markdownUrl: markdownUrlForLoc(loc),
    type: frontmatter.content_type || 'WebPage',
    title: frontmatter.title || loc,
    description: frontmatter.description || '',
  };
}

function stripPreviousGeneratedIndex(llms) {
  const start = llms.indexOf(GENERATED_START);
  if (start === -1) return llms;

  const end = llms.indexOf(GENERATED_END, start);
  if (end === -1) {
    throw new Error('llms.txt contains generated index start marker without end marker');
  }

  return `${llms.slice(0, start).trimEnd()}\n\n${llms.slice(end + GENERATED_END.length).trimStart()}`;
}

function entryLine(entry) {
  const rows = [
    `- HTML: ${entry.loc}`,
    `  Markdown: ${entry.markdownUrl}`,
    `  Type: ${entry.type}`,
    `  Title: ${entry.title}`,
  ];

  if (entry.description) rows.push(`  Description: ${entry.description}`);
  return rows.join('\n');
}

function generatedIndex(entries) {
  const pages = entries.filter((entry) => !new URL(entry.loc).pathname.startsWith('/blog/'));
  const blogIndex = entries.filter((entry) => new URL(entry.loc).pathname === '/blog/');
  const articles = entries.filter((entry) => {
    const pathname = new URL(entry.loc).pathname;
    return pathname.startsWith('/blog/') && pathname !== '/blog/';
  });

  return `${GENERATED_START}

Generated from sitemap.xml and markdown variants during build.
Canonical URL count: ${entries.length}
Markdown URL count: ${entries.length}
Blog article count: ${articles.length}

## Core Pages

${[...pages, ...blogIndex].map(entryLine).join('\n\n')}

## Blog Articles

${articles.map(entryLine).join('\n\n')}

${GENERATED_END}`;
}

function main() {
  if (!existsSync(LLMS_PATH)) {
    throw new Error(`${LLMS_PATH} does not exist. Vite must copy public/llms.txt before this script runs.`);
  }

  const locs = parseSitemapLocs().map((loc) => {
    const url = new URL(loc);
    return `${SITE_URL}${canonicalPath(url.pathname)}`;
  });
  const entries = locs.map(pageMetadata);
  const base = stripPreviousGeneratedIndex(readFileSync(LLMS_PATH, 'utf8'));
  const insertAt = base.lastIndexOf(FILE_END);
  const nextContent = insertAt === -1
    ? `${base.trimEnd()}\n\n${generatedIndex(entries)}\n`
    : `${base.slice(0, insertAt).trimEnd()}\n\n${generatedIndex(entries)}\n\n${base.slice(insertAt).trimStart()}`;

  writeFileSync(LLMS_PATH, nextContent, 'utf8');
  console.log(`Generated llms.txt discoverable content index: ${entries.length} canonical URLs, ${entries.length} markdown URLs`);
}

main();

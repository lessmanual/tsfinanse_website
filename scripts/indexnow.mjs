import { existsSync, readFileSync, readdirSync } from 'fs';
import { basename, resolve } from 'path';

const SITE_URL = 'https://tsfinanse.com';
const HOST = new URL(SITE_URL).host;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_SITEMAP_PATH = resolve(process.cwd(), 'dist', 'sitemap.xml');
const PUBLIC_DIR = resolve(process.cwd(), 'public');

function parseArgs(args) {
  const options = {
    dryRun: false,
    sitemapPath: DEFAULT_SITEMAP_PATH,
    liveSitemap: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--live-sitemap') {
      options.liveSitemap = true;
      continue;
    }
    if (arg === '--sitemap') {
      const value = args[index + 1];
      if (!value) throw new Error('--sitemap requires a file path');
      options.sitemapPath = resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function readLocalSitemap(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`${filePath} does not exist. Run npm run build first or pass --live-sitemap after deploy.`);
  }

  return readFileSync(filePath, 'utf8');
}

async function readLiveSitemap() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const response = await fetch(sitemapUrl, { headers: { Accept: 'application/xml,text/xml,*/*' } });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Live sitemap returned ${response.status} ${response.statusText}: ${body.slice(0, 200)}`);
  }

  return body;
}

function parseSitemapUrls(sitemap) {
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  const uniqueUrls = [...new Set(urls)];

  if (uniqueUrls.length === 0) {
    throw new Error('Sitemap does not contain any <loc> URLs');
  }

  const offHostUrls = uniqueUrls.filter((url) => new URL(url).host !== HOST);
  if (offHostUrls.length > 0) {
    throw new Error(`Sitemap contains non-${HOST} URLs: ${offHostUrls.join(', ')}`);
  }

  return uniqueUrls;
}

function readIndexNowKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim();

  if (!existsSync(PUBLIC_DIR)) {
    throw new Error(`Missing public directory: ${PUBLIC_DIR}`);
  }

  const candidates = readdirSync(PUBLIC_DIR)
    .filter((fileName) => /^[A-Za-z0-9_-]{8,128}\.txt$/.test(fileName))
    .map((fileName) => {
      const path = resolve(PUBLIC_DIR, fileName);
      const key = basename(fileName, '.txt');
      const content = readFileSync(path, 'utf8').trim();
      return { key, content, path };
    })
    .filter((candidate) => candidate.key === candidate.content);

  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one IndexNow key file in ${PUBLIC_DIR}, found ${candidates.length}`);
  }

  return candidates[0].key;
}

function createPayload(urlList, key) {
  return {
    host: HOST,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList,
  };
}

async function submitIndexNow(payload) {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const body = await response.text();

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow returned ${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
  }

  return {
    status: response.status,
    statusText: response.statusText,
    body,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sitemap = options.liveSitemap
    ? await readLiveSitemap()
    : readLocalSitemap(options.sitemapPath);
  const urlList = parseSitemapUrls(sitemap);
  const key = readIndexNowKey();
  const payload = createPayload(urlList, key);

  if (options.dryRun) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      endpoint: INDEXNOW_ENDPOINT,
      host: payload.host,
      keyLocation: payload.keyLocation,
      urlCount: payload.urlList.length,
      firstUrl: payload.urlList[0],
      lastUrl: payload.urlList[payload.urlList.length - 1],
    }, null, 2));
    return;
  }

  const result = await submitIndexNow(payload);
  console.log(JSON.stringify({
    mode: 'submitted',
    endpoint: INDEXNOW_ENDPOINT,
    status: result.status,
    statusText: result.statusText,
    urlCount: payload.urlList.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

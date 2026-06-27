const SKIPPED_EXTENSIONS = new Set([
  '.avif',
  '.css',
  '.ico',
  '.js',
  '.json',
  '.png',
  '.svg',
  '.txt',
  '.webp',
  '.xml',
]);

function hasExtension(pathname) {
  const finalSegment = pathname.split('/').pop() || '';
  return finalSegment.includes('.');
}

function shouldSkip(pathname) {
  if (pathname.startsWith('/assets/')) return true;
  if (pathname.startsWith('/md/')) return true;
  if (pathname.startsWith('/.well-known/')) return true;
  if (pathname.startsWith('/admin/')) return true;

  const extension = pathname.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase();
  return extension ? SKIPPED_EXTENSIONS.has(extension) : hasExtension(pathname);
}

function markdownPath(pathname) {
  if (pathname === '/') return '/md/index.md';
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `/md${normalised}.md`;
}

export default function handler(request) {
  const accept = request.headers.get('accept') || '';
  const url = new URL(request.url);

  if (!accept.toLowerCase().includes('text/markdown') || shouldSkip(url.pathname)) {
    return;
  }

  const target = new URL(request.url);
  target.pathname = markdownPath(url.pathname);
  target.search = '';
  return target;
}

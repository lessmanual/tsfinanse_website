/**
 * Lightweight build-time prerendering — NO Chromium/Puppeteer.
 *
 * Injects per-route SEO meta tags (title, description, canonical, OG,
 * Twitter, schemas) into static HTML files so crawlers that don't execute
 * JavaScript (LinkedIn, Facebook, Twitter, older bots) see correct metadata.
 *
 * Google does render JS, but having meta tags in static HTML speeds up
 * indexing and prevents the "second wave" delay for new sites.
 *
 * For blog posts: queries Supabase for slug + metadata at build time.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';

const DIST_DIR = resolve(process.cwd(), 'dist');
const SITE_URL = 'https://www.tsfinanse.com';

// ---------------------------------------------------------------------------
// Route → SEO metadata definitions
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  {
    path: '/',
    title: 'TS Finanse - Pożyczki Hipoteczne dla Przedsiębiorców | Finansowanie B2B',
    description: 'Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne. 1-20 mln PLN, oprocentowanie ustalane indywidualnie, decyzja w 3 dni. Własny kapitał, bez zależności od banków.',
    schemas: ['organization', 'loanProduct', 'service', 'breadcrumbHome'],
  },
  {
    path: '/blog',
    title: 'Blog - Aktualności i Porady Finansowe | TS Finanse',
    description: 'Blog TS Finanse - aktualności ze świata finansów dla przedsiębiorców, porady dotyczące pożyczek hipotecznych i finansowania biznesu.',
    schemas: ['breadcrumbBlog'],
  },
  {
    path: '/programpartnerski',
    title: 'Program Partnerski dla Pośredników | TS Finanse',
    description: 'Dołącz do programu partnerskiego TS Finanse. 1% prowizji od wartości pożyczki, szybkie decyzje w 3 dni, minimum formalności. Dla pośredników kredytowych, doradców finansowych i agentów nieruchomości.',
    schemas: ['breadcrumbPartner'],
  },
  {
    path: '/polityka-prywatnosci',
    title: 'Polityka Prywatności | TS Finanse',
    description: 'Polityka prywatności TS Finanse. Informacje o przetwarzaniu danych osobowych, prawach użytkowników i zasadach ochrony prywatności.',
  },
  {
    path: '/polityka-cookies',
    title: 'Polityka Cookies | TS Finanse',
    description: 'Polityka cookies TS Finanse. Informacje o wykorzystywaniu plików cookie na stronie tsfinanse.com.',
  },
  {
    path: '/regulamin',
    title: 'Regulamin | TS Finanse',
    description: 'Regulamin świadczenia usług TS Finanse. Warunki korzystania z serwisu i usług finansowych.',
  },
  {
    path: '/rodo',
    title: 'Klauzula Informacyjna RODO | TS Finanse',
    description: 'Klauzula informacyjna RODO TS Finanse. Informacje o administratorze danych, celach przetwarzania i prawach osób.',
  },
];

// ---------------------------------------------------------------------------
// Schema definitions (matching SEO.tsx)
// ---------------------------------------------------------------------------

const SCHEMAS = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
    alternateName: 'TS Finanse',
    url: 'https://www.tsfinanse.com',
    logo: 'https://www.tsfinanse.com/logo.webp',
    description: 'Profesjonalne pożyczki hipoteczne dla przedsiębiorców. Finansowanie projektów deweloperskich i inwestycyjnych w całej Polsce.',
    email: 'kontakt@tsfinanse.com',
    telephone: '+48506711242',
    address: { '@type': 'PostalAddress', streetAddress: 'ul. Gdańska 60', addressLocality: 'Reda', postalCode: '84-240', addressCountry: 'PL' },
    areaServed: { '@type': 'Country', name: 'Polska' },
    taxID: '9581565078',
    vatID: 'PL9581565078',
    legalName: '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
  },
  loanProduct: {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    name: 'Pożyczka Hipoteczna dla Przedsiębiorców',
    description: 'Pożyczki hipoteczne dla firm od 1 do 20 mln PLN.',
    provider: { '@type': 'FinancialService', name: 'TS Finanse' },
    currency: 'PLN',
    amount: { '@type': 'MonetaryAmount', currency: 'PLN', minValue: 1000000, maxValue: 20000000 },
  },
  service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Pożyczki hipoteczne dla przedsiębiorców',
    provider: { '@type': 'FinancialService', name: 'TS Finanse', url: 'https://www.tsfinanse.com' },
    areaServed: { '@type': 'Country', name: 'Polska' },
    description: 'Pożyczki dla firm pod zabezpieczenie hipoteczne od 1 do 20 mln PLN. Decyzja w 3 dni robocze, własny kapitał, obsługa w całej Polsce.',
  },
  breadcrumbHome: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://www.tsfinanse.com/' }],
  },
  breadcrumbBlog: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://www.tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.tsfinanse.com/blog' },
    ],
  },
  breadcrumbPartner: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://www.tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Program Partnerski', item: 'https://www.tsfinanse.com/programpartnerski' },
    ],
  },
};

function blogPostingSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'TS Finanse', url: 'https://www.tsfinanse.com' },
    publisher: { '@type': 'Organization', name: 'TS Finanse', logo: { '@type': 'ImageObject', url: 'https://www.tsfinanse.com/logo.webp' } },
    image: post.image || 'https://www.tsfinanse.com/og-image.webp',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };
}

// ---------------------------------------------------------------------------
// Fetch blog posts from Supabase
// ---------------------------------------------------------------------------

async function getBlogPosts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('  Supabase not configured — skipping blog post routes');
    return [];
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('ts_finanse_posts')
      .select('slug, title, description, published_at, featured_image')
      .eq('status', 'published');

    if (error) {
      console.error('  Supabase error:', error.message);
      return [];
    }

    return (data || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description || '',
      date: p.published_at,
      image: p.featured_image,
    }));
  } catch (err) {
    console.error('  Failed to fetch blog posts:', err.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

function buildMetaTags(route) {
  const canonical = `${SITE_URL}${route.path}`;
  const ogType = route.ogType || 'website';
  const ogImage = route.ogImage || `${SITE_URL}/og-image.webp`;

  let tags = '';
  tags += `    <title>${esc(route.title)}</title>\n`;
  tags += `    <meta name="description" content="${esc(route.description)}" />\n`;
  tags += `    <link rel="canonical" href="${canonical}" />\n`;
  tags += `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n`;
  // Open Graph
  tags += `    <meta property="og:type" content="${ogType}" />\n`;
  tags += `    <meta property="og:url" content="${canonical}" />\n`;
  tags += `    <meta property="og:title" content="${esc(route.title)}" />\n`;
  tags += `    <meta property="og:description" content="${esc(route.description)}" />\n`;
  tags += `    <meta property="og:image" content="${ogImage}" />\n`;
  tags += `    <meta property="og:site_name" content="TS Finanse" />\n`;
  tags += `    <meta property="og:locale" content="pl_PL" />\n`;
  // Twitter
  tags += `    <meta name="twitter:card" content="summary_large_image" />\n`;
  tags += `    <meta name="twitter:title" content="${esc(route.title)}" />\n`;
  tags += `    <meta name="twitter:description" content="${esc(route.description)}" />\n`;
  tags += `    <meta name="twitter:image" content="${ogImage}" />\n`;

  // Schemas
  if (route.schemas && route.schemas.length > 0) {
    const schemaObjects = route.schemas
      .map((key) => (typeof key === 'string' ? SCHEMAS[key] : key))
      .filter(Boolean);
    if (schemaObjects.length > 0) {
      tags += `    <script type="application/ld+json">${JSON.stringify(schemaObjects)}</script>\n`;
    }
  }

  return tags;
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectIntoHtml(baseHtml, metaTags) {
  // Inject right after <!-- SEO meta tags managed by React Helmet per page -->
  // or before </head> as fallback
  const marker = '<!-- SEO meta tags managed by React Helmet per page -->';
  if (baseHtml.includes(marker)) {
    return baseHtml.replace(marker, marker + '\n' + metaTags);
  }
  return baseHtml.replace('</head>', metaTags + '  </head>');
}

function writeRoute(baseHtml, route) {
  const metaTags = buildMetaTags(route);
  const html = injectIntoHtml(baseHtml, metaTags);

  let outputPath;
  if (route.path === '/') {
    outputPath = join(DIST_DIR, 'index.html');
  } else {
    const dir = join(DIST_DIR, route.path);
    mkdirSync(dir, { recursive: true });
    outputPath = join(dir, 'index.html');
  }

  writeFileSync(outputPath, html, 'utf-8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Prerendering SEO meta tags (no Chromium)...\n');

  const baseHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');

  // Static routes
  for (const route of STATIC_ROUTES) {
    writeRoute(baseHtml, route);
    console.log(`  ✓ ${route.path}`);
  }

  // Blog post routes from Supabase
  const posts = await getBlogPosts();
  for (const post of posts) {
    const route = {
      path: `/blog/${post.slug}`,
      title: `${post.title} | TS Finanse Blog`,
      description: post.description,
      ogType: 'article',
      ogImage: post.image || `${SITE_URL}/og-image.webp`,
      schemas: [
        blogPostingSchema(post),
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Strona główna', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
          ],
        },
      ],
    };
    writeRoute(baseHtml, route);
    console.log(`  ✓ /blog/${post.slug}`);
  }

  console.log(`\nPrerendering complete: ${STATIC_ROUTES.length + posts.length} pages`);
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});

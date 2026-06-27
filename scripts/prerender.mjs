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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

// Load .env manually since this script runs outside Vite
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && value) process.env[key] = value;
  });
}

const DIST_DIR = resolve(process.cwd(), 'dist');
const SITE_URL = 'https://tsfinanse.com';
const TITLE_SUFFIX = ' | TS Finanse';
const MAX_META_TITLE_LENGTH = 70;
const MAX_META_DESCRIPTION_LENGTH = 180;
const OFFICIAL_REFERENCE_LINKS = [
  ['KNF - ostrzeżenia publiczne', 'https://www.knf.gov.pl/dla_konsumenta/ostrzezenia_publiczne'],
  ['UOKiK - informacje publiczne', 'https://uokik.gov.pl/'],
  ['Biznes.gov.pl - informacje dla przedsiębiorców', 'https://www.biznes.gov.pl/pl/portal/00120'],
  ['KRS - wyszukiwarka podmiotów', 'https://prs.ms.gov.pl/krs'],
];

function canonicalPath(path) {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function absoluteImageUrl(rawUrl) {
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl, SITE_URL);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function latestDateValue(first, second) {
  const firstValue = first || '';
  const secondValue = second || '';
  const firstTime = Date.parse(firstValue);
  const secondTime = Date.parse(secondValue);

  if (!Number.isFinite(firstTime)) return secondValue || firstValue;
  if (!Number.isFinite(secondTime)) return firstValue;

  return firstTime >= secondTime ? firstValue : secondValue;
}

function normaliseWhitespace(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function stripTitleBrand(value = '') {
  let title = normaliseWhitespace(value);
  let previous = '';

  while (title !== previous) {
    previous = title;
    title = title
      .replace(/\s*\|\s*TS\s*Finanse\s*Blog\s*$/i, '')
      .replace(/\s*\|\s*TSFinanse\s*$/i, '')
      .replace(/\s*\|\s*TS\s*Finanse\s*$/i, '');
  }

  return title;
}

function truncateAtWord(value, maxLength) {
  const text = normaliseWhitespace(value);
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength + 1);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 30 ? slice.slice(0, lastSpace) : text.slice(0, maxLength)).trim();
}

function compactMetaTitle(rawTitle = '') {
  const base = stripTitleBrand(rawTitle);
  const shouldAppendBrand = !/\bTS\s*Finanse\b/i.test(base);
  const suffix = shouldAppendBrand ? TITLE_SUFFIX : '';
  const directTitle = `${base}${suffix}`;

  if (directTitle.length <= MAX_META_TITLE_LENGTH) return directTitle;

  const maxBaseLength = MAX_META_TITLE_LENGTH - suffix.length;
  const [beforeDash] = base.split(/\s+-\s+/);
  if (beforeDash && beforeDash !== base && `${beforeDash}${suffix}`.length >= 20 && `${beforeDash}${suffix}`.length <= MAX_META_TITLE_LENGTH) {
    return `${beforeDash}${suffix}`;
  }

  return `${truncateAtWord(base, maxBaseLength)}${suffix}`;
}

function compactMetaDescription(rawDescription = '') {
  const description = normaliseWhitespace(rawDescription);
  if (description.length <= MAX_META_DESCRIPTION_LENGTH) return description;

  const sentenceCut = description.slice(0, MAX_META_DESCRIPTION_LENGTH + 1).search(/[.!?]\s+[A-ZŁŚŻŹĆŃÓĘĄ]/);
  if (sentenceCut >= 70) {
    return description.slice(0, sentenceCut + 1).trim();
  }

  return truncateAtWord(description, MAX_META_DESCRIPTION_LENGTH);
}

// ---------------------------------------------------------------------------
// FAQ + HowTo schemas (must be defined before STATIC_ROUTES)
// ---------------------------------------------------------------------------

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Co to jest pozycja senioralna w hipotece?', acceptedAnswer: { '@type': 'Answer', text: 'Pozycja senioralna oznacza, że TS Finanse jest jedynym podmiotem wpisanym w hipotece i ma pierwszeństwo w zaspokojeniu swoich roszczeń.' } },
    { '@type': 'Question', name: 'Jak szybko mogę otrzymać decyzję?', acceptedAnswer: { '@type': 'Answer', text: 'Analizę wstępną przeprowadzamy w ciągu 24 godzin. Pełna decyzja kredytowa może zapaść w 3 dni robocze od otrzymania kompletu dokumentów.' } },
    { '@type': 'Question', name: 'Jakie dokumenty są wymagane?', acceptedAnswer: { '@type': 'Answer', text: 'Podstawowe dokumenty to: odpis KRS/CEIDG, ostatnie sprawozdanie finansowe, dokumentacja nieruchomości, wycena nieruchomości.' } },
    { '@type': 'Question', name: 'Co to jest LTV i dlaczego max 60%?', acceptedAnswer: { '@type': 'Answer', text: 'LTV to stosunek wartości pożyczki do wartości nieruchomości. Przy LTV 60% dla nieruchomości wartej 10 mln PLN można otrzymać maksymalnie 6 mln PLN.' } },
    { '@type': 'Question', name: 'Czy mogę spłacić pożyczkę wcześniej?', acceptedAnswer: { '@type': 'Answer', text: 'Tak, oferujemy możliwość wcześniejszej spłaty. Szczegóły dotyczące ewentualnych prowizji są zawarte w indywidualnej umowie.' } },
    { '@type': 'Question', name: 'Jakie nieruchomości są akceptowane?', acceptedAnswer: { '@type': 'Answer', text: 'Mieszkania, domy, lokale komercyjne, działki inwestycyjne i nieruchomości komercyjne z całej Polski.' } },
    { '@type': 'Question', name: 'Czym różnicie się od banku?', acceptedAnswer: { '@type': 'Answer', text: 'Mamy własny kapitał, więc nie jesteśmy ograniczeni regulacjami bankowymi. Szybsze decyzje, elastyczność i możliwość finansowania projektów odrzucanych przez banki.' } },
    { '@type': 'Question', name: 'Jakie są koszty pożyczki?', acceptedAnswer: { '@type': 'Answer', text: 'Oprocentowanie ustalamy indywidualnie w zależności od płynności zabezpieczenia. Wszystkie koszty są transparentnie przedstawione w ofercie.' } },
    { '@type': 'Question', name: 'Czy współpracujecie z pośrednikami?', acceptedAnswer: { '@type': 'Answer', text: 'Tak, oferujemy program partnerski dla pośredników kredytowych. Kontakt: kontakt@tsfinanse.com' } },
    { '@type': 'Question', name: 'Czy finansujecie startupy?', acceptedAnswer: { '@type': 'Answer', text: 'Nie. Pożyczki udzielamy wyłącznie firmom prowadzącym działalność gospodarczą, które posiadają nieruchomość do zabezpieczenia.' } },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Jak uzyskać pożyczkę hipoteczną dla firmy w TS Finanse',
  description: 'Prosty 5-krokowy proces uzyskania pożyczki hipotecznej dla przedsiębiorców.',
  totalTime: 'P14D',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Kontakt', text: 'Wyślij zapytanie przez formularz lub email.' },
    { '@type': 'HowToStep', position: 2, name: 'Analiza', text: 'Nasz zespół analizuje wniosek w ciągu 24 godzin.' },
    { '@type': 'HowToStep', position: 3, name: 'Oferta', text: 'Przygotowujemy indywidualną ofertę finansowania.' },
    { '@type': 'HowToStep', position: 4, name: 'Finalizacja', text: 'Podpisanie umowy i obsługa notarialna.' },
    { '@type': 'HowToStep', position: 5, name: 'Wypłata', text: 'Uruchomienie środków na Twoje konto.' },
  ],
};

// ---------------------------------------------------------------------------
// Route → SEO metadata definitions
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  {
    path: '/',
    title: 'TS Finanse - Pożyczki Hipoteczne dla Firm',
    description: 'Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne. 1-20 mln PLN, oprocentowanie ustalane indywidualnie, decyzja w 3 dni. Własny kapitał, bez zależności od banków.',
    schemas: ['organization', 'loanProduct', 'service', 'breadcrumbHome', faqSchema, howToSchema],
  },
  {
    path: '/blog/',
    title: 'Blog - Aktualności i Porady Finansowe | TS Finanse',
    description: 'Blog TS Finanse - aktualności ze świata finansów dla przedsiębiorców, porady dotyczące pożyczek hipotecznych i finansowania biznesu.',
    schemas: ['breadcrumbBlog'],
  },
  {
    path: '/programpartnerski/',
    title: 'Program Partnerski dla Pośredników | TS Finanse',
    description: 'Program partnerski TS Finanse dla pośredników, doradców finansowych i agentów nieruchomości. Szybka analiza klientów biznesowych i indywidualne warunki współpracy.',
    schemas: ['breadcrumbPartner'],
  },
  {
    path: '/polityka-prywatnosci/',
    title: 'Polityka Prywatności | TS Finanse',
    description: 'Polityka prywatności TS Finanse. Informacje o przetwarzaniu danych osobowych, prawach użytkowników i zasadach ochrony prywatności.',
    schemas: ['breadcrumbPrivacy'],
  },
  {
    path: '/polityka-cookies/',
    title: 'Polityka Cookies | TS Finanse',
    description: 'Polityka cookies TS Finanse. Informacje o wykorzystywaniu plików cookie na stronie tsfinanse.com.',
    schemas: ['breadcrumbCookies'],
  },
  {
    path: '/regulamin/',
    title: 'Regulamin | TS Finanse',
    description: 'Regulamin świadczenia usług TS Finanse. Warunki korzystania z serwisu i usług finansowych.',
    schemas: ['breadcrumbTerms'],
  },
  {
    path: '/rodo/',
    title: 'Klauzula Informacyjna RODO | TS Finanse',
    description: 'Klauzula informacyjna RODO TS Finanse. Informacje o administratorze danych, celach przetwarzania i prawach osób.',
    schemas: ['breadcrumbRodo'],
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
    url: 'https://tsfinanse.com',
    logo: 'https://tsfinanse.com/logo.webp',
    description: 'Profesjonalne pożyczki hipoteczne dla przedsiębiorców. Finansowanie projektów deweloperskich i inwestycyjnych w całej Polsce.',
    email: 'kontakt@tsfinanse.com',
    telephone: '+48506711242',
    address: { '@type': 'PostalAddress', streetAddress: 'ul. Gdańska 60', addressLocality: 'Reda', postalCode: '84-240', addressCountry: 'PL' },
    geo: { '@type': 'GeoCoordinates', latitude: 54.6025, longitude: 18.3464 },
    areaServed: { '@type': 'Country', name: 'Polska' },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+48506711242',
      contactType: 'Customer Service',
      email: 'kontakt@tsfinanse.com',
      availableLanguage: ['pl'],
      areaServed: 'PL',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '16:00',
      },
    ],
    taxID: '9581565078',
    vatID: 'PL9581565078',
    legalName: '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
  },
  loanProduct: {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    name: 'Pożyczka Hipoteczna dla Przedsiębiorców',
    description: 'Pożyczki hipoteczne dla firm od 1 do 20 mln PLN. Finansowanie projektów deweloperskich, inwestycyjnych i operacyjnych.',
    provider: { '@type': 'FinancialService', name: 'TS Finanse' },
    category: 'Mortgage Loan',
    currency: 'PLN',
    loanType: 'Business Loan',
    amount: { '@type': 'MonetaryAmount', currency: 'PLN', minValue: 1000000, maxValue: 20000000 },
    offers: {
      '@type': 'Offer',
      url: 'https://tsfinanse.com',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
      areaServed: { '@type': 'Country', name: 'Polska' },
    },
    broker: { '@type': 'FinancialService', name: 'TS Finanse', url: 'https://tsfinanse.com' },
  },
  service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Pożyczki hipoteczne dla przedsiębiorców',
    provider: { '@type': 'FinancialService', name: 'TS Finanse', url: 'https://tsfinanse.com' },
    areaServed: { '@type': 'Country', name: 'Polska' },
    description: 'Pożyczki dla firm pod zabezpieczenie hipoteczne od 1 do 20 mln PLN. Decyzja w 3 dni robocze, własny kapitał, obsługa w całej Polsce.',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
    },
  },
  breadcrumbHome: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' }],
  },
  breadcrumbBlog: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://tsfinanse.com/blog/' },
    ],
  },
  breadcrumbPartner: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Program Partnerski', item: 'https://tsfinanse.com/programpartnerski/' },
    ],
  },
  breadcrumbPrivacy: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Polityka Prywatności', item: 'https://tsfinanse.com/polityka-prywatnosci/' },
    ],
  },
  breadcrumbCookies: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Polityka Cookies', item: 'https://tsfinanse.com/polityka-cookies/' },
    ],
  },
  breadcrumbTerms: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Regulamin', item: 'https://tsfinanse.com/regulamin/' },
    ],
  },
  breadcrumbRodo: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://tsfinanse.com/' },
      { '@type': 'ListItem', position: 2, name: 'Klauzula Informacyjna RODO', item: 'https://tsfinanse.com/rodo/' },
    ],
  },
};

function blogPostingSchema(post) {
  const normalizedContent = normalizeArticleContent(post.content || '', new Set());
  const articleText = stripHtml(normalizedContent);
  const keywords = Array.from(new Set([
    post.category || 'Finansowanie',
    ...(Array.isArray(post.tags) ? post.tags : []),
  ]
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())));

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    inLanguage: 'pl-PL',
    articleSection: post.category || 'Finansowanie',
    keywords,
    isAccessibleForFree: true,
    ...(articleText ? { wordCount: articleText.split(/\s+/).filter(Boolean).length } : {}),
    author: { '@type': 'Organization', name: 'TS Finanse', url: 'https://tsfinanse.com' },
    publisher: { '@type': 'Organization', name: 'TS Finanse', logo: { '@type': 'ImageObject', url: 'https://tsfinanse.com/logo.webp' } },
    image: absoluteImageUrl(post.image) || 'https://tsfinanse.com/og-image.webp',
    citation: OFFICIAL_REFERENCE_LINKS.map(([, url]) => url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${canonicalPath(`/blog/${post.slug}`)}` },
    ...(articleText ? { articleBody: articleText.slice(0, 5000) } : {}),
  };
}

const minBlogFaqEntries = 3;
const maxBlogFaqEntries = 8;
const maxAnswerBlockLength = 340;

function stripMarkdown(value = '') {
  return stripHtml(value)
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripInlineMarkup(value = '') {
  return stripMarkdown(value)
    .replace(/[*_`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactAnswerText(value = '') {
  const answer = normaliseWhitespace(value);
  if (answer.length <= maxAnswerBlockLength) return answer;
  return `${answer.slice(0, maxAnswerBlockLength - 3).trim()}...`;
}

function extractAnswerSections(content = '') {
  const htmlHeadings = [...String(content).matchAll(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi)]
    .map((match) => stripInlineMarkup(match[1]));
  const markdownHeadings = [...String(content).matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((match) => stripInlineMarkup(match[1]));
  const seen = new Set();

  return [...htmlHeadings, ...markdownHeadings]
    .filter((heading) => heading.length >= 8 && heading.length <= 90)
    .filter((heading) => !/^(powiązane artykuły|spis treści|faq)$/i.test(heading))
    .filter((heading) => {
      const key = heading.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function buildBlogAnswerBlock(post = {}) {
  const directAnswer = compactAnswerText(post.description || '');
  if (directAnswer.length < 70) return undefined;
  const extractedSections = extractAnswerSections(post.content || '');
  const fallbackSections = [post.category, ...(post.tags || [])].filter(Boolean).slice(0, 3);

  return {
    directAnswer,
    sections: extractedSections.length > 0 ? extractedSections : fallbackSections,
  };
}

function renderAnswerBlock(post = {}) {
  const answerBlock = buildBlogAnswerBlock(post);
  if (!answerBlock) return '';

  const sections = answerBlock.sections.length > 0
    ? `<ul>${answerBlock.sections.map((section) => `<li>${esc(section)}</li>`).join('')}</ul>`
    : '';

  return `<section data-ai-answer="summary">
<h2>W skrócie</h2>
<p><strong>Krótka odpowiedź:</strong> ${esc(answerBlock.directAnswer)}</p>
${sections}
</section>`;
}

function slugifyHeading(value = '') {
  return stripInlineMarkup(value)
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'sekcja';
}

function buildArticleToc(content = '') {
  const htmlHeadings = [...String(content).matchAll(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi)]
    .map((match) => stripInlineMarkup(match[1]));
  const markdownHeadings = [...String(content).matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((match) => stripInlineMarkup(match[1]));
  const slugs = new Map();

  return [...htmlHeadings, ...markdownHeadings]
    .filter((heading) => heading.length >= 4 && heading.length <= 120)
    .filter((heading) => !/^(powiązane artykuły|spis treści|w skrócie)$/i.test(heading))
    .map((title) => {
      const baseId = slugifyHeading(title);
      const count = slugs.get(baseId) || 0;
      slugs.set(baseId, count + 1);

      return {
        id: count === 0 ? baseId : `${baseId}-${count + 1}`,
        title,
      };
    });
}

function withHeadingAnchors(content = '', toc = []) {
  let index = 0;

  return String(content).replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const item = toc[index];
    index += 1;
    if (!item) return match;

    const cleanAttrs = String(attrs || '').replace(/\s+id=(["'])[^"']+\1/gi, '');
    return `<h${level}${cleanAttrs} id="${esc(item.id)}">${inner}</h${level}>`;
  });
}

function renderArticleToc(post = {}, publishedSlugs = new Set()) {
  const content = normalizeArticleContent(post.content || '', publishedSlugs);
  const toc = buildArticleToc(content);
  if (toc.length < 2) return '';

  return `<nav data-ai-toc="article" aria-labelledby="article-toc-heading">
<h2 id="article-toc-heading">Spis treści</h2>
<ol>
${toc.map((item) => `<li><a href="#${esc(item.id)}">${esc(item.title)}</a></li>`).join('\n')}
</ol>
</nav>`;
}

function cleanQuestion(value = '') {
  return stripHtml(value)
    .replace(/^Q:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAnswer(value = '') {
  const answer = stripMarkdown(value);
  return answer.length > 700 ? `${answer.slice(0, 697).trim()}...` : answer;
}

function toFaqEntry(question, answer) {
  const cleanedQuestion = cleanQuestion(question);
  const cleanedAnswer = cleanAnswer(answer);

  if (!cleanedQuestion.includes('?')) return undefined;
  if (cleanedQuestion.length < 12 || cleanedAnswer.length < 40) return undefined;

  return { question: cleanedQuestion, answer: cleanedAnswer };
}

function extractHtmlFaqEntries(content = '') {
  const headingPattern = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [...content.matchAll(headingPattern)];
  const entries = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const question = cleanQuestion(heading[2]);
    if (!question.includes('?')) continue;

    const answerStart = (heading.index || 0) + heading[0].length;
    const answerEnd = headings[index + 1]?.index ?? content.length;
    const entry = toFaqEntry(question, content.slice(answerStart, answerEnd));
    if (entry) entries.push(entry);
  }

  return entries;
}

function extractMarkdownFaqEntries(content = '') {
  const lines = content.split(/\r?\n/);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^#{2,4}\s+(.+\?)\s*$/);
    if (!heading) continue;

    const answerLines = [];
    for (let answerIndex = index + 1; answerIndex < lines.length; answerIndex += 1) {
      if (/^#{1,4}\s+/.test(lines[answerIndex])) break;
      answerLines.push(lines[answerIndex]);
    }

    const entry = toFaqEntry(heading[1], answerLines.join(' '));
    if (entry) entries.push(entry);
  }

  return entries;
}

function extractBlogFaqEntries(content = '') {
  const normalizedContent = normalizeArticleContent(content, new Set());
  const rawEntries = normalizedContent.trim().startsWith('<')
    ? extractHtmlFaqEntries(normalizedContent)
    : extractMarkdownFaqEntries(normalizedContent);
  const seen = new Set();
  const entries = rawEntries.filter((entry) => {
    const key = entry.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return entries.slice(0, maxBlogFaqEntries);
}

function blogFaqPageSchema(post) {
  const entries = extractBlogFaqEntries(post.content || '');
  if (entries.length < minBlogFaqEntries) return undefined;
  const canonicalUrl = `${SITE_URL}${canonicalPath(`/blog/${post.slug}`)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: 'pl-PL',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}

function blogIndexSchemas(posts) {
  const blogPosts = posts.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || '',
    url: `${SITE_URL}${canonicalPath(`/blog/${post.slug}`)}`,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog TS Finanse',
      url: `${SITE_URL}/blog/`,
      inLanguage: 'pl-PL',
      description: 'Porady i analizy o finansowaniu przedsiębiorców, pożyczkach hipotecznych, faktoringu, leasingu i płynności firm.',
      publisher: { '@type': 'Organization', name: 'TS Finanse', url: SITE_URL },
      blogPost: blogPosts,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Artykuły bloga TS Finanse',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: blogPosts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}${canonicalPath(`/blog/${post.slug}`)}`,
        name: post.title,
      })),
    },
  ];
}

function webPageSchema({ canonical, metaTitle, metaDescription, ogImage }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: metaTitle,
    description: metaDescription,
    inLanguage: 'pl-PL',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'TS Finanse',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TS Finanse',
      url: SITE_URL,
    },
    breadcrumb: {
      '@id': `${canonical}#breadcrumb`,
    },
    ...(ogImage
      ? {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: ogImage,
          },
        }
      : {}),
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
      .select('slug, title, description, content, tags, category, author, published_at, updated_at, featured_image')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (error) {
      console.error('  Supabase error:', error.message);
      return [];
    }

    return (data || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description || '',
      content: p.content || '',
      tags: p.tags || [],
      category: p.category || 'Finansowanie',
      author: p.author || 'TS Finanse',
      date: p.published_at,
      updatedAt: latestDateValue(p.updated_at, p.published_at),
      image: absoluteImageUrl(p.featured_image),
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
  const canonical = `${SITE_URL}${canonicalPath(route.path)}`;
  const ogType = route.ogType || 'website';
  const ogImage = absoluteImageUrl(route.ogImage) || `${SITE_URL}/og-image.webp`;
  const metaTitle = compactMetaTitle(route.title);
  const metaDescription = compactMetaDescription(route.description);

  let tags = '';
  tags += `    <title>${esc(metaTitle)}</title>\n`;
  tags += `    <meta name="title" content="${esc(metaTitle)}" />\n`;
  tags += `    <meta name="description" content="${esc(metaDescription)}" />\n`;
  tags += `    <link rel="canonical" href="${canonical}" />\n`;
  tags += `    <link rel="alternate" type="text/markdown" href="${canonical}" />\n`;
  tags += `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n`;
  // Open Graph
  tags += `    <meta property="og:type" content="${ogType}" />\n`;
  tags += `    <meta property="og:url" content="${canonical}" />\n`;
  tags += `    <meta property="og:title" content="${esc(metaTitle)}" />\n`;
  tags += `    <meta property="og:description" content="${esc(metaDescription)}" />\n`;
  tags += `    <meta property="og:image" content="${ogImage}" />\n`;
  tags += `    <meta property="og:site_name" content="TS Finanse" />\n`;
  tags += `    <meta property="og:locale" content="pl_PL" />\n`;
  if (ogType === 'article' && route.publishedTime) {
    tags += `    <meta property="article:published_time" content="${esc(route.publishedTime)}" />\n`;
  }
  if (ogType === 'article' && route.modifiedTime) {
    tags += `    <meta property="article:modified_time" content="${esc(route.modifiedTime)}" />\n`;
  }
  // Twitter
  tags += `    <meta name="twitter:card" content="summary_large_image" />\n`;
  tags += `    <meta name="twitter:title" content="${esc(metaTitle)}" />\n`;
  tags += `    <meta name="twitter:description" content="${esc(metaDescription)}" />\n`;
  tags += `    <meta name="twitter:image" content="${ogImage}" />\n`;

  // Schemas
  const schemaObjects = [
    webPageSchema({ canonical, metaTitle, metaDescription, ogImage }),
    ...(route.schemas || [])
      .map((key) => (typeof key === 'string' ? SCHEMAS[key] : key))
      .filter(Boolean),
  ];
  tags += `    <script type="application/ld+json">${JSON.stringify(schemaObjects)}</script>\n`;

  return tags;
}

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeStaticHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/\son[a-z]+='[^']*'/gi, '');
}

function normalizeSlug(slug = '') {
  return decodeURIComponent(String(slug))
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const relatedStopWords = new Set([
  'dla',
  'czy',
  'jak',
  'kiedy',
  'oraz',
  'firm',
  'firmy',
  '2026',
  'poradnik',
  'kompletny',
  'przewodnik',
]);

function relatedTerms(post = {}) {
  const raw = [
    post.title,
    post.category,
    ...(Array.isArray(post.tags) ? post.tags : []),
  ].join(' ');

  return new Set(raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4 && !relatedStopWords.has(term)));
}

function postTime(post = {}) {
  const value = Date.parse(post.updatedAt || post.date || '');
  return Number.isFinite(value) ? value : 0;
}

function selectRelatedPosts(currentPost, posts, limit = 4) {
  const currentTerms = relatedTerms(currentPost);
  const currentTags = new Set((currentPost.tags || []).map((tag) => String(tag).toLowerCase()));

  return posts
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      const candidateTerms = relatedTerms(candidate);
      const candidateTags = new Set((candidate.tags || []).map((tag) => String(tag).toLowerCase()));
      const sharedTerms = [...candidateTerms].filter((term) => currentTerms.has(term)).length;
      const sharedTags = [...candidateTags].filter((tag) => currentTags.has(tag)).length;
      const categoryScore = candidate.category && candidate.category === currentPost.category ? 20 : 0;
      const score = categoryScore + sharedTags * 8 + sharedTerms * 2;

      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || postTime(b.candidate) - postTime(a.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

function canonicalizeInternalUrl(rawUrl, publishedSlugs = new Set()) {
  if (!rawUrl || rawUrl.startsWith('#') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) {
    return rawUrl;
  }

  let url;
  try {
    url = new URL(rawUrl, SITE_URL);
  } catch {
    return rawUrl;
  }

  if (url.origin !== SITE_URL) {
    return rawUrl;
  }

  if (url.pathname === '/kontakt') {
    return `/${url.hash || '#contact'}`;
  }

  if (/\.[a-z0-9]{2,8}$/i.test(url.pathname)) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  if (url.pathname.startsWith('/blog/')) {
    const slug = normalizeSlug(url.pathname.replace(/^\/blog\//, '').replace(/\/$/, ''));
    if (!slug) {
      return `/blog/${url.search}${url.hash}`;
    }
    if (publishedSlugs.size > 0 && !publishedSlugs.has(slug)) {
      return `/blog/`;
    }
    return `/blog/${slug}/${url.search}${url.hash}`;
  }

  if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
    return `${url.pathname}/${url.search}${url.hash}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function normalizeContentLinks(content = '', publishedSlugs = new Set()) {
  return String(content)
    .replace(/href=(["'])([^"']+)\1/gi, (_match, quote, href) => {
      return `href=${quote}${esc(canonicalizeInternalUrl(href, publishedSlugs))}${quote}`;
    })
    .replace(/\]\(([^)]+)\)/g, (_match, href) => {
      return `](${canonicalizeInternalUrl(href, publishedSlugs)})`;
    });
}

function normalizeStaleTsFinansePricingClaims(content = '') {
  // Older CMS rows quoted fixed TS Finanse commission rates. Keep rendering aligned with the current offer until CMS is cleaned.
  return String(content)
    .replace(/Prowizja TS Finanse wynosi standardowo 1% od wartości pożyczki\s*-\s*jest transparentnie ujawniana w pisemnej ofercie przed podpisaniem umowy\./gi, 'Warunki kosztowe TS Finanse są ustalane indywidualnie i transparentnie ujawniane w pisemnej ofercie przed podpisaniem umowy.')
    .replace(/Prowizja TS Finanse wynosi 1% od wartości pożyczki\s*-\s*jest transparentnie podawana w ofercie indywidualnej\./gi, 'Warunki kosztowe TS Finanse są ustalane indywidualnie i transparentnie podawane w ofercie.')
    .replace(/<strong>Prowizja TS Finanse:<\/strong>\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '<strong>Warunki kosztowe TS Finanse:</strong> ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/<strong>Prowizja:<\/strong>\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '<strong>Warunki kosztowe:</strong> ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/\*\*Prowizja TS Finanse:\*\*\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '**Warunki kosztowe TS Finanse:** ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/\*\*Prowizja:\*\*\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, '**Warunki kosztowe:** ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/Prowizja TS Finanse:\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, 'Warunki kosztowe TS Finanse: ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/Prowizja:\s*1% od wartości pożyczki\s*-\s*transparentnie wskazana w ofercie indywidualnej przed podpisaniem\./gi, 'Warunki kosztowe: ustalane indywidualnie i transparentnie wskazane w ofercie przed podpisaniem.')
    .replace(/Prowizja za udzielenie pożyczki wynosi 1% wartości pożyczki\. Jest podawana transparentnie w ofercie indywidualnej przed podpisaniem umowy\./gi, 'Warunki kosztowe udzielenia pożyczki są ustalane indywidualnie i podawane transparentnie w ofercie przed podpisaniem umowy.')
    .replace(/Prowizja za udzielenie pożyczki wynosi 1%\./gi, 'Warunki kosztowe udzielenia pożyczki są ustalane indywidualnie.')
    .replace(/Prowizja partnerska dla pośredników finansowych i doradców wynosi 1% od wartości pożyczki\. Jest transparentnie ujawniana w ofercie indywidualnej\./gi, 'Warunki współpracy partnerskiej dla pośredników finansowych i doradców są ustalane indywidualnie przed obsługą klienta i transparentnie ujawniane w ofercie.')
    .replace(/w kontekście TS Finanse prowizja partnerska\s*-\s*dla pośredników finansowych\s*-\s*wynosi 1% od wartości pożyczki\. Jest transparentnie ujawniana w ofercie indywidualnej przed podpisaniem umowy\./gi, 'w kontekście TS Finanse warunki współpracy partnerskiej dla pośredników finansowych są ustalane indywidualnie przed obsługą klienta i transparentnie ujawniane w ofercie.')
    .replace(/Jeśli trafiasz do TS Finanse przez pośrednika finansowego lub doradcę\s*-\s*prowizja partnerska wynosi 1% od wartości pożyczki\. Jest ona transparentnie ujawniana w ofercie indywidualnej\./gi, 'Jeśli trafiasz do TS Finanse przez pośrednika finansowego lub doradcę, warunki współpracy partnerskiej są ustalane indywidualnie przed obsługą klienta i transparentnie ujawniane w ofercie.')
    .replace(/Oprócz kosztów hipoteki, przy pożyczkach od TS Finanse obowiązuje prowizja 1% od wartości pożyczki\./gi, 'Oprócz kosztów hipoteki, warunki kosztowe pożyczek od TS Finanse są ustalane indywidualnie w ofercie.')
    .replace(/Prowizja TS Finanse za udzielenie pożyczki wynosi 1%/gi, 'Warunki kosztowe TS Finanse za udzielenie pożyczki są ustalane indywidualnie')
    .replace(/prowizja \(1%\)/gi, 'warunki kosztowe ustalane indywidualnie')
    .replace(/Oprocentowanie i prowizja \(1%\) są kosztami z tytułu finansowania/gi, 'Oprocentowanie i indywidualnie ustalane warunki kosztowe są kosztami z tytułu finansowania')
    .replace(/standardowa prowizja wynosi 1% od kwoty\. Przy 3 mln PLN to 30 000 PLN jednorazowo\./gi, 'warunki kosztowe są ustalane indywidualnie w ofercie.')
    .replace(/Prowizja:\s*1%/gi, 'Warunki kosztowe: indywidualnie ustalane')
    .replace(/Prowizja 1%/gi, 'Koszty ustalane indywidualnie')
    .replace(/prowizja 1% od wartości pożyczki/gi, 'warunki kosztowe ustalane indywidualnie w ofercie')
    .replace(/prowizja 1%/gi, 'warunki kosztowe ustalane indywidualnie');
}

function normalizeArticleContent(content = '', publishedSlugs = new Set()) {
  return normalizeStaleTsFinansePricingClaims(normalizeContentLinks(content, publishedSlugs))
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
}

function inlineMarkdown(text = '') {
  return esc(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function markdownToStaticHtml(markdown = '', toc = []) {
  const lines = String(markdown).split(/\r?\n/);
  const out = [];
  let listOpen = false;
  let headingIndex = 0;

  function closeList() {
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push(`<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    closeList();

    if (line.startsWith('### ')) {
      const id = toc[headingIndex]?.id;
      headingIndex += 1;
      out.push(`<h3${id ? ` id="${esc(id)}"` : ''}>${inlineMarkdown(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      const id = toc[headingIndex]?.id;
      headingIndex += 1;
      out.push(`<h2${id ? ` id="${esc(id)}"` : ''}>${inlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      const id = toc[headingIndex]?.id;
      headingIndex += 1;
      out.push(`<h2${id ? ` id="${esc(id)}"` : ''}>${inlineMarkdown(line.slice(2))}</h2>`);
    } else {
      out.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  }

  closeList();
  return out.join('\n');
}

function renderStaticPostContent(post, publishedSlugs = new Set()) {
  const content = normalizeArticleContent(post?.content || '', publishedSlugs);
  const toc = buildArticleToc(content);
  if (!content.trim()) {
    return `<p>${esc(post?.description || '')}</p>`;
  }

  return content.trim().startsWith('<')
    ? withHeadingAnchors(sanitizeStaticHtml(content), toc)
    : markdownToStaticHtml(content, toc);
}

function renderRelatedPosts(post, allPosts = []) {
  const related = selectRelatedPosts(post, allPosts, 4);
  if (related.length === 0) return '';

  return `<section>
<h2>Powiązane artykuły</h2>
<ul>
${related.map((item) => `<li><a href="${esc(canonicalPath(`/blog/${item.slug}`))}">${esc(item.title)}</a></li>`).join('\n')}
</ul>
</section>`;
}

function renderOfficialReferences() {
  return `<section data-ai-sources="official">
<h2>Źródła i weryfikacja</h2>
<p>Przed decyzją finansową sprawdź aktualne rejestry, ostrzeżenia publiczne i informacje urzędowe.</p>
<ul>
${OFFICIAL_REFERENCE_LINKS.map(([label, url]) => `<li><a href="${esc(url)}">${esc(label)}</a></li>`).join('\n')}
</ul>
</section>`;
}

// ---------------------------------------------------------------------------
// Noscript fallback content per route (for non-JS crawlers)
// ---------------------------------------------------------------------------

const NOSCRIPT_STYLE = 'style="max-width:800px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif"';

function buildNoscript(route, post, allPosts = []) {
  const path = route.path;
  const publishedSlugs = new Set(allPosts.map((item) => normalizeSlug(item.slug)));

  if (path === '/') {
    return `<noscript><div ${NOSCRIPT_STYLE}>
<h1>TS Finanse - Pożyczki Hipoteczne dla Przedsiębiorców</h1>
<p>Profesjonalne pożyczki dla firm pod zabezpieczenie hipoteczne od 1 do 20 mln PLN. Decyzja w 3 dni robocze, własny kapitał, obsługa w całej Polsce.</p>
<h2>Nasze usługi</h2>
<ul><li>Pożyczki hipoteczne od 1 000 000 do 20 000 000 PLN</li><li>Okres: 12-36 miesięcy</li><li>LTV do 60% wartości nieruchomości</li><li>Decyzja w 3 dni robocze</li><li>Własny kapitał - niezależność od banków</li></ul>
<h2>Jak to działa?</h2>
<ol><li>Kontakt - wyślij zapytanie przez formularz lub email</li><li>Analiza - analizujemy wniosek w ciągu 24h</li><li>Oferta - przygotowujemy indywidualną ofertę</li><li>Finalizacja - podpisanie umowy i obsługa notarialna</li><li>Wypłata - uruchomienie środków na Twoje konto</li></ol>
<h2>Kontakt</h2>
<p>Email: <a href="mailto:kontakt@tsfinanse.com">kontakt@tsfinanse.com</a> | Tel: +48 506 711 242</p>
<p><a href="/blog/">Blog</a> | <a href="/programpartnerski/">Program Partnerski</a></p>
</div></noscript>`;
  }

  if (path === '/blog/') {
    const postLinks = allPosts
      .slice(0, 80)
      .map((item) => {
        const postUrl = canonicalPath(`/blog/${item.slug}`);
        return `<li><a href="${postUrl}">${esc(item.title)}</a><br><span>${esc(item.description)}</span></li>`;
      })
      .join('\n');

    return `<noscript><div ${NOSCRIPT_STYLE}>
<h1>Blog TS Finanse - Porady Finansowe dla Przedsiębiorców</h1>
<p>Aktualności ze świata finansów, porady dotyczące pożyczek hipotecznych i finansowania biznesu.</p>
<h2>Najnowsze wpisy</h2>
<ul>${postLinks}</ul>
<p><a href="/">Strona główna TS Finanse</a> | <a href="/programpartnerski/">Program Partnerski</a></p>
</div></noscript>`;
  }

  if (path === '/programpartnerski/') {
    return `<noscript><div ${NOSCRIPT_STYLE}>
<h1>Program Partnerski TS Finanse</h1>
<p>Dołącz do programu partnerskiego. Współpraca bez prowizji procentowej od wartości pożyczki, szybkie decyzje w 3 dni, minimum formalności.</p>
<h2>Dla kogo?</h2>
<ul><li>Pośrednicy kredytowi</li><li>Doradcy finansowi</li><li>Agenci nieruchomości</li><li>Kancelarie prawne</li></ul>
<p>Kontakt: <a href="mailto:kontakt@tsfinanse.com">kontakt@tsfinanse.com</a> | +48 506 711 242</p>
</div></noscript>`;
  }

  // Blog post routes (dynamic)
  if (path.startsWith('/blog/') && post) {
    const date = post.date ? new Date(post.date).toISOString().slice(0, 10) : '';
    const updated = (post.updatedAt || post.date) ? new Date(post.updatedAt || post.date).toISOString().slice(0, 10) : '';
    const tags = Array.isArray(post.tags) && post.tags.length > 0
      ? `<p>Tagi: ${post.tags.map(esc).join(', ')}</p>`
      : '';

    return `<noscript><div ${NOSCRIPT_STYLE}>
<article>
<h1>${esc(post.title)}</h1>
<p>${esc(post.description)}</p>
<p>${esc(post.category || 'Finansowanie')} | Opublikowano: ${esc(date)} | Aktualizacja: ${esc(updated)} | ${esc(post.author || 'TS Finanse')}</p>
${post.image ? `<p><img src="${esc(absoluteImageUrl(post.image) || post.image)}" alt="${esc(post.title)}" loading="lazy" style="max-width:100%;height:auto" /></p>` : ''}
${renderAnswerBlock(post)}
${renderArticleToc(post, publishedSlugs)}
${renderStaticPostContent(post, publishedSlugs)}
${renderOfficialReferences()}
${renderRelatedPosts(post, allPosts)}
${tags}
<p><a href="/blog/">Wszystkie wpisy na blogu TS Finanse</a> | <a href="/">Strona główna</a></p>
</article>
</div></noscript>`;
  }

  // Legal pages fallback
  const legalTitles = {
    '/polityka-prywatnosci/': 'Polityka Prywatności',
    '/polityka-cookies/': 'Polityka Cookies',
    '/regulamin/': 'Regulamin',
    '/rodo/': 'Klauzula Informacyjna RODO',
  };

  if (legalTitles[path]) {
    return `<noscript><div ${NOSCRIPT_STYLE}>
<h1>${legalTitles[path]}</h1>
<p>Aby wyświetlić pełną treść, włącz JavaScript w przeglądarce.</p>
<p><a href="/">Powrót na stronę główną TS Finanse</a></p>
</div></noscript>`;
  }

  return '';
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

function writeRoute(baseHtml, route, post, allPosts = []) {
  const metaTags = buildMetaTags(route);
  let html = injectIntoHtml(baseHtml, metaTags);

  // Inject noscript fallback content after <div id="root"></div>
  const noscript = buildNoscript(route, post, allPosts);
  if (noscript) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n${noscript}`);
  }

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
  const posts = await getBlogPosts();

  // Static routes
  for (const route of STATIC_ROUTES) {
    const routeWithSchemas = route.path === '/blog/'
      ? { ...route, schemas: [...(route.schemas || []), ...blogIndexSchemas(posts)] }
      : route;
    writeRoute(baseHtml, routeWithSchemas, undefined, posts);
    console.log(`  ✓ ${route.path}`);
  }

  // Blog post routes from Supabase
  for (const post of posts) {
    const route = {
      path: canonicalPath(`/blog/${post.slug}`),
      title: `${post.title} | TS Finanse Blog`,
      description: post.description,
      ogType: 'article',
      ogImage: post.image || `${SITE_URL}/og-image.webp`,
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      schemas: [
        blogPostingSchema(post),
        blogFaqPageSchema(post),
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Strona główna', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}${canonicalPath(`/blog/${post.slug}`)}` },
          ],
        },
      ],
    };
    writeRoute(baseHtml, route, post, posts);
    console.log(`  ✓ ${canonicalPath(`/blog/${post.slug}`)}`);
  }

  console.log(`\nPrerendering complete: ${STATIC_ROUTES.length + posts.length} pages`);
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});

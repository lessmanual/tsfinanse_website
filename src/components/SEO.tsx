import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  schema?: object | object[];
}

const defaultTitle = 'TS Finanse - Pożyczki Hipoteczne dla Firm';
const defaultDescription =
  'Profesjonalne pożyczki hipoteczne dla firm. Finansowanie projektów deweloperskich i inwestycyjnych od 1 do 20 mln PLN. Szybka decyzja, elastyczne warunki, obsługa w całej Polsce.';
const siteUrl = 'https://tsfinanse.com';
const defaultOgImage = `${siteUrl}/og-image.webp`;
const titleSuffix = ' | TS Finanse';
const maxMetaTitleLength = 70;
const maxMetaDescriptionLength = 180;
const indexingMetaDirective = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export const officialReferenceLinks = [
  {
    label: 'KNF - ostrzeżenia publiczne',
    url: 'https://www.knf.gov.pl/dla_konsumenta/ostrzezenia_publiczne',
  },
  {
    label: 'UOKiK - informacje publiczne',
    url: 'https://uokik.gov.pl/',
  },
  {
    label: 'Biznes.gov.pl - informacje dla przedsiębiorców',
    url: 'https://www.biznes.gov.pl/pl/portal/00120',
  },
  {
    label: 'KRS - wyszukiwarka podmiotów',
    url: 'https://prs.ms.gov.pl/krs',
  },
] as const;

export const editorialTrustProfile = {
  name: 'TS Finanse',
  legalName: '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
  url: siteUrl,
  email: 'kontakt@tsfinanse.com',
  telephone: '+48506711242',
} as const;

export const editorialTrustStatement =
  'Materiał przygotowany i aktualizowany przez zespół TS Finanse. Treści mają charakter informacyjny, a warunki finansowania są ustalane indywidualnie po analizie zabezpieczenia i sytuacji przedsiębiorcy.';

function editorialOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: editorialTrustProfile.name,
    legalName: editorialTrustProfile.legalName,
    url: editorialTrustProfile.url,
    email: editorialTrustProfile.email,
    telephone: editorialTrustProfile.telephone,
  };
}

function organizationReferenceSchema() {
  return {
    '@type': 'FinancialService',
    '@id': `${siteUrl}/#organization`,
    name: 'TS Finanse',
    url: siteUrl,
  };
}

interface BlogIndexPost {
  slug: string;
  title: string;
  description?: string;
  date: string;
  updatedAt?: string;
}

function latestDateValue(first?: string, second?: string): string {
  const firstValue = first || '';
  const secondValue = second || '';
  const firstTime = Date.parse(firstValue);
  const secondTime = Date.parse(secondValue);

  if (!Number.isFinite(firstTime)) return secondValue || firstValue;
  if (!Number.isFinite(secondTime)) return firstValue;

  return firstTime >= secondTime ? firstValue : secondValue;
}

function absoluteImageUrl(rawUrl?: string) {
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl, siteUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function imageObjectSchema(imageUrl: string, id: string) {
  return {
    '@type': 'ImageObject',
    '@id': id,
    url: imageUrl,
    contentUrl: imageUrl,
  };
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

function truncateAtWord(value: string, maxLength: number) {
  const text = normaliseWhitespace(value);
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength + 1);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 30 ? slice.slice(0, lastSpace) : text.slice(0, maxLength)).trim();
}

function compactMetaTitle(rawTitle = '') {
  const base = stripTitleBrand(rawTitle);
  const shouldAppendBrand = !/\bTS\s*Finanse\b/i.test(base);
  const suffix = shouldAppendBrand ? titleSuffix : '';
  const directTitle = `${base}${suffix}`;

  if (directTitle.length <= maxMetaTitleLength) return directTitle;

  const maxBaseLength = maxMetaTitleLength - suffix.length;
  const [beforeDash] = base.split(/\s+-\s+/);
  if (beforeDash && beforeDash !== base && `${beforeDash}${suffix}`.length >= 20 && `${beforeDash}${suffix}`.length <= maxMetaTitleLength) {
    return `${beforeDash}${suffix}`;
  }

  return `${truncateAtWord(base, maxBaseLength)}${suffix}`;
}

function compactMetaDescription(rawDescription = '') {
  const description = normaliseWhitespace(rawDescription);
  if (description.length <= maxMetaDescriptionLength) return description;

  const sentenceCut = description.slice(0, maxMetaDescriptionLength + 1).search(/[.!?]\s+[A-ZŁŚŻŹĆŃÓĘĄ]/);
  if (sentenceCut >= 70) {
    return description.slice(0, sentenceCut + 1).trim();
  }

  return truncateAtWord(description, maxMetaDescriptionLength);
}

function stripHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(value = '') {
  const plainText = stripHtml(value);
  if (!plainText) return 0;
  return plainText.split(/\s+/).filter(Boolean).length;
}

const minBlogFaqEntries = 3;
const maxBlogFaqEntries = 8;

function stripMarkdown(value = '') {
  return stripHtml(value)
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function toFaqEntry(question: string, answer: string) {
  const cleanedQuestion = cleanQuestion(question);
  const cleanedAnswer = cleanAnswer(answer);

  if (!cleanedQuestion.includes('?')) return undefined;
  if (cleanedQuestion.length < 12 || cleanedAnswer.length < 40) return undefined;

  return { question: cleanedQuestion, answer: cleanedAnswer };
}

function extractHtmlFaqEntries(content = '') {
  const headingPattern = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [...content.matchAll(headingPattern)];
  const entries: { question: string; answer: string }[] = [];

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
  const entries: { question: string; answer: string }[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^#{2,4}\s+(.+\?)\s*$/);
    if (!heading) continue;

    const answerLines: string[] = [];
    for (let answerIndex = index + 1; answerIndex < lines.length; answerIndex += 1) {
      if (/^#{1,4}\s+/.test(lines[answerIndex])) break;
      answerLines.push(lines[answerIndex]);
    }

    const entry = toFaqEntry(heading[1], answerLines.join(' '));
    if (entry) entries.push(entry);
  }

  return entries;
}

export function extractBlogFaqEntries(content = '') {
  const rawEntries = content.trim().startsWith('<')
    ? extractHtmlFaqEntries(content)
    : extractMarkdownFaqEntries(content);
  const seen = new Set<string>();
  const entries = rawEntries.filter((entry) => {
    const key = entry.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return entries.slice(0, maxBlogFaqEntries);
}

function normalizeCanonicalPath(path: string) {
  const pathWithoutFragment = path.split('#')[0] || '/';
  const [pathname, search] = pathWithoutFragment.split('?');

  if (pathname === '/') {
    return search ? `/?${search}` : '/';
  }

  const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return search ? `${normalizedPath}?${search}` : normalizedPath;
}

function markdownUrlForCanonical(canonical: string) {
  const pathname = new URL(canonical).pathname;
  if (pathname === '/') return `${siteUrl}/md/index.md`;
  const normalised = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${siteUrl}/md${normalised}.md`;
}

function webPageMainEntityForCanonical(canonical: string) {
  const pathname = new URL(canonical).pathname;
  if (pathname === '/') return { '@id': `${siteUrl}/#organization` };
  if (pathname === '/blog/') return { '@id': `${canonical}#blog` };
  if (pathname.startsWith('/blog/')) return { '@id': `${canonical}#article` };
  return undefined;
}

function webPageSchema({
  canonical,
  name,
  description,
  image,
}: {
  canonical: string;
  name: string;
  description: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name,
    description,
    inLanguage: 'pl-PL',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'TS Finanse',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'TS Finanse',
      url: siteUrl,
    },
    breadcrumb: {
      '@id': `${canonical}#breadcrumb`,
    },
    ...(webPageMainEntityForCanonical(canonical)
      ? {
          mainEntity: webPageMainEntityForCanonical(canonical),
        }
      : {}),
    ...(image
      ? {
          primaryImageOfPage: imageObjectSchema(image, `${canonical}#primaryimage`),
        }
      : {}),
  };
}

export function SEO({
  title,
  description = defaultDescription,
  canonicalUrl,
  ogImage = defaultOgImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  schema,
}: SEOProps) {
  const fullTitle = compactMetaTitle(title ? `${title} | TS Finanse` : defaultTitle);
  const metaDescription = compactMetaDescription(description);
  const canonical = canonicalUrl ? `${siteUrl}${normalizeCanonicalPath(canonicalUrl)}` : `${siteUrl}/`;
  const markdownAlternate = markdownUrlForCanonical(canonical);
  const normalisedModifiedTime = latestDateValue(modifiedTime, publishedTime);
  const resolvedOgImage = absoluteImageUrl(ogImage) || defaultOgImage;
  const customSchemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const structuredData = [
    webPageSchema({
      canonical,
      name: fullTitle,
      description: metaDescription,
      image: resolvedOgImage,
    }),
    ...customSchemas.filter(Boolean),
  ];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta httpEquiv="content-language" content="pl-PL" />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="pl-PL" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <link rel="alternate" type="text/markdown" href={markdownAlternate} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:site_name" content="TS Finanse" />
      <meta property="og:locale" content="pl_PL" />
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && normalisedModifiedTime && (
        <meta property="article:modified_time" content={normalisedModifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content={indexingMetaDirective} />
      <meta name="googlebot" content={indexingMetaDirective} />
      <meta name="bingbot" content={indexingMetaDirective} />
      <meta name="language" content="Polish" />
      <meta name="geo.region" content="PL" />
      <meta name="geo.placename" content="Polska" />

      {/* Business Contact Information */}
      <meta name="contact" content="kontakt@tsfinanse.com" />
      <meta name="author" content="TS Finanse" />
      <meta name="publisher" content="TS Finanse" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
}

// Reusable Schema.org Objects
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  '@id': `${siteUrl}/#organization`,
  name: '"TRANSBUD" NOWAK SPÓŁKA JAWNA',
  alternateName: 'TS Finanse',
  url: 'https://tsfinanse.com',
  logo: 'https://tsfinanse.com/logo.webp',
  description:
    'Profesjonalne pożyczki hipoteczne dla przedsiębiorców. Finansowanie projektów deweloperskich i inwestycyjnych w całej Polsce.',
  email: 'kontakt@tsfinanse.com',
  telephone: '+48506711242',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ul. Gdańska 60',
    addressLocality: 'Reda',
    postalCode: '84-240',
    addressCountry: 'PL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 54.6025,
    longitude: 18.3464,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Polska',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+48506711242',
    contactType: 'Customer Service',
    email: 'kontakt@tsfinanse.com',
    availableLanguage: ['pl'],
    areaServed: 'PL',
  },
  sameAs: [
    // Add social media profiles when available
  ],
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
};

export const loanProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'LoanOrCredit',
  '@id': `${siteUrl}/#loan-product`,
  url: siteUrl,
  name: 'Pożyczka Hipoteczna dla Przedsiębiorców',
  description:
    'Pożyczki hipoteczne dla firm od 1 do 20 mln PLN. Finansowanie projektów deweloperskich, inwestycyjnych i operacyjnych.',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/` },
  provider: organizationReferenceSchema(),
  category: 'Mortgage Loan',
  currency: 'PLN',
  loanType: 'Business Loan',
  amount: {
    '@type': 'MonetaryAmount',
    currency: 'PLN',
    minValue: 1000000,
    maxValue: 20000000,
  },
  offers: {
    '@type': 'Offer',
    url: 'https://tsfinanse.com',
    priceCurrency: 'PLN',
    availability: 'https://schema.org/InStock',
    areaServed: {
      '@type': 'Country',
      name: 'Polska',
    },
    seller: organizationReferenceSchema(),
  },
  broker: organizationReferenceSchema(),
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => {
  const lastItem = items[items.length - 1] || { url: '/' };
  const breadcrumbUrl = `${siteUrl}${normalizeCanonicalPath(lastItem.url)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${breadcrumbUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${normalizeCanonicalPath(item.url)}`,
    })),
  };
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://tsfinanse.com/#website',
  name: 'TS Finanse',
  url: 'https://tsfinanse.com',
  inLanguage: 'pl-PL',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tsfinanse.com/blog/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const blogIndexSchemas = (posts: BlogIndexPost[]) => {
  const editorialOrganization = editorialOrganizationSchema();
  const blogPosts = posts.map((post) => {
    const url = `${siteUrl}${normalizeCanonicalPath(`/blog/${post.slug}/`)}`;

    return {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: post.title,
      description: post.description || '',
      url,
      datePublished: post.date,
      dateModified: latestDateValue(post.updatedAt, post.date),
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: editorialOrganization,
      publisher: editorialOrganization,
    };
  });

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${siteUrl}/blog/#blog`,
      name: 'Blog TS Finanse',
      url: `${siteUrl}/blog/`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/` },
      inLanguage: 'pl-PL',
      description: 'Porady i analizy o finansowaniu przedsiębiorców, pożyczkach hipotecznych, faktoringu, leasingu i płynności firm.',
      publisher: editorialOrganization,
      blogPost: blogPosts,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${siteUrl}/blog/#itemlist`,
      name: 'Artykuły bloga TS Finanse',
      url: `${siteUrl}/blog/`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/` },
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: blogPosts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}${normalizeCanonicalPath(`/blog/${post.slug}/`)}`,
        name: post.title,
      })),
    },
  ];
};

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${siteUrl}/#service`,
  url: siteUrl,
  serviceType: 'Pożyczki hipoteczne dla przedsiębiorców',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/` },
  provider: organizationReferenceSchema(),
  areaServed: {
    '@type': 'Country',
    name: 'Polska',
  },
  description: 'Pożyczki dla firm pod zabezpieczenie hipoteczne od 1 do 20 mln PLN. Decyzja w 3 dni robocze, własny kapitał, obsługa w całej Polsce.',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'PLN',
    availability: 'https://schema.org/InStock',
    seller: organizationReferenceSchema(),
  },
};

export const blogPostingSchema = (post: {
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  author?: string;
  image?: string;
  slug: string;
  category?: string;
  tags?: string[];
  content?: string;
}) => {
  const keywords = Array.from(new Set([
    post.category || 'Finansowanie',
    ...(post.tags || []),
  ]
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())));
  const wordCount = countWords(post.content);
  const editorialOrganization = editorialOrganizationSchema();
  const canonicalUrl = `${siteUrl}${normalizeCanonicalPath(`/blog/${post.slug}/`)}`;
  const imageUrl = absoluteImageUrl(post.image) || 'https://tsfinanse.com/og-image.webp';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonicalUrl}#article`,
    headline: post.title,
    description: post.description,
    url: canonicalUrl,
    datePublished: post.date,
    dateModified: latestDateValue(post.updatedAt, post.date),
    inLanguage: 'pl-PL',
    articleSection: post.category || 'Finansowanie',
    keywords,
    isAccessibleForFree: true,
    ...(wordCount > 0 ? { wordCount } : {}),
    author: editorialOrganization,
    publisher: {
      ...editorialOrganization,
      '@type': 'Organization',
      name: 'TS Finanse',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tsfinanse.com/logo.webp',
      },
    },
    reviewedBy: editorialOrganization,
    copyrightHolder: editorialOrganization,
    image: imageObjectSchema(imageUrl, `${canonicalUrl}#primaryimage`),
    citation: officialReferenceLinks.map((reference) => reference.url),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };
};

export const blogFaqPageSchema = (post: {
  slug: string;
  content?: string;
}) => {
  const entries = extractBlogFaqEntries(post.content);
  if (entries.length < minBlogFaqEntries) return undefined;
  const canonicalUrl = `${siteUrl}${normalizeCanonicalPath(`/blog/${post.slug}/`)}`;

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
};

export const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${siteUrl}/#faq`,
  url: `${siteUrl}/`,
  mainEntityOfPage: `${siteUrl}/`,
  inLanguage: 'pl-PL',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Co to jest pozycja senioralna w hipotece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pozycja senioralna oznacza, że TS Finanse jest jedynym podmiotem wpisanym w hipotece i ma pierwszeństwo w zaspokojeniu swoich roszczeń. Nie akceptujemy nieruchomości obciążonych innymi hipotekami.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak szybko mogę otrzymać decyzję?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Analizę wstępną przeprowadzamy w ciągu 24 godzin. Pełna decyzja kredytowa może zapaść w 3 dni robocze od otrzymania kompletu dokumentów.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jakie dokumenty są wymagane?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Podstawowe dokumenty to: odpis KRS/CEIDG, ostatnie sprawozdanie finansowe, dokumentacja nieruchomości (akt własności, wypis z KW), wycena nieruchomości. Szczegółową listę przesyłamy po wstępnej akceptacji.',
      },
    },
    {
      '@type': 'Question',
      name: 'Co to jest LTV i dlaczego max 60%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LTV (Loan-to-Value) to stosunek wartości pożyczki do wartości nieruchomości. Przy LTV 60% dla nieruchomości wartej 10 mln PLN można otrzymać maksymalnie 6 mln PLN pożyczki. To zabezpiecza obie strony.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czy mogę spłacić pożyczkę wcześniej?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tak, oferujemy możliwość wcześniejszej spłaty. Szczegóły dotyczące ewentualnych prowizji za wcześniejszą spłatę są zawarte w indywidualnej umowie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jakie nieruchomości są akceptowane jako zabezpieczenie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akceptujemy: mieszkania, domy, lokale komercyjne, działki inwestycyjne i nieruchomości komercyjne z całej Polski. Kluczowa jest płynność i wycena nieruchomości.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czy finansujecie startupy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nie. Pożyczki udzielamy wyłącznie firmom prowadzącym działalność gospodarczą, które posiadają nieruchomość do zabezpieczenia. Preferujemy firmy z historią działalności.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czym różnicie się od banku?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mamy własny kapitał, więc nie jesteśmy ograniczeni regulacjami bankowymi. To pozwala na szybsze decyzje, elastyczność i możliwość finansowania projektów odrzucanych przez banki.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jakie są koszty pożyczki?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oprocentowanie pożyczki ustalamy indywidualnie w zależności od płynności zabezpieczenia. Wszystkie dodatkowe koszty (wycena nieruchomości, opłaty notarialne) są transparentnie przedstawione w ofercie indywidualnej przed podpisaniem umowy. Pozostałe warunki rozpatrywane indywidualnie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czy współpracujecie z pośrednikami?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tak, oferujemy program partnerski dla pośredników kredytowych. Kontakt: kontakt@tsfinanse.com',
      },
    },
  ],
};

export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': `${siteUrl}/#how-to`,
  url: `${siteUrl}/`,
  mainEntityOfPage: `${siteUrl}/`,
  inLanguage: 'pl-PL',
  name: 'Jak uzyskać pożyczkę hipoteczną dla firmy w TS Finanse',
  description: 'Prosty 5-krokowy proces uzyskania pożyczki hipotecznej dla przedsiębiorców.',
  totalTime: 'P14D',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Kontakt',
      text: 'Wyślij zapytanie przez formularz na stronie lub email na kontakt@tsfinanse.com.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Analiza',
      text: 'Nasz zespół analizuje wniosek i kontaktuje się w ciągu 24 godzin.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Oferta',
      text: 'Przygotowujemy indywidualną ofertę finansowania dopasowaną do Twoich potrzeb.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Finalizacja',
      text: 'Podpisanie umowy pożyczki i obsługa notarialna ustanowienia hipoteki.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Wypłata',
      text: 'Uruchomienie środków na Twoje konto - możesz rozwijać firmę.',
    },
  ],
};

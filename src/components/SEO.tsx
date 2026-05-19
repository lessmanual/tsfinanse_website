import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  schema?: object | object[];
}

const defaultTitle = 'TS Finanse - Pożyczki Hipoteczne dla Przedsiębiorców | Finansowanie B2B';
const defaultDescription =
  'Profesjonalne pożyczki hipoteczne dla firm. Finansowanie projektów deweloperskich i inwestycyjnych od 1 do 20 mln PLN. Szybka decyzja, elastyczne warunki, obsługa w całej Polsce.';
const siteUrl = 'https://tsfinanse.com';
const defaultOgImage = `${siteUrl}/og-image.webp`;

function normalizeCanonicalPath(path: string) {
  const pathWithoutFragment = path.split('#')[0] || '/';
  const [pathname, search] = pathWithoutFragment.split('?');

  if (pathname === '/') {
    return search ? `/?${search}` : '/';
  }

  const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return search ? `${normalizedPath}?${search}` : normalizedPath;
}

export function SEO({
  title,
  description = defaultDescription,
  canonicalUrl,
  ogImage = defaultOgImage,
  ogType = 'website',
  schema,
}: SEOProps) {
  const fullTitle = title ? `${title} | TS Finanse` : defaultTitle;
  const canonical = canonicalUrl ? `${siteUrl}${normalizeCanonicalPath(canonicalUrl)}` : `${siteUrl}/`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="TS Finanse" />
      <meta property="og:locale" content="pl_PL" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="language" content="Polish" />
      <meta name="geo.region" content="PL" />
      <meta name="geo.placename" content="Polska" />

      {/* Business Contact Information */}
      <meta name="contact" content="kontakt@tsfinanse.com" />
      <meta name="author" content="TS Finanse" />
      <meta name="publisher" content="TS Finanse" />

      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema], null, 2)}
        </script>
      )}
    </Helmet>
  );
}

// Reusable Schema.org Objects
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
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
  name: 'Pożyczka Hipoteczna dla Przedsiębiorców',
  description:
    'Pożyczki hipoteczne dla firm od 1 do 20 mln PLN. Finansowanie projektów deweloperskich, inwestycyjnych i operacyjnych.',
  provider: {
    '@type': 'FinancialService',
    name: 'TS Finanse',
  },
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
  },
  broker: {
    '@type': 'FinancialService',
    name: 'TS Finanse',
    url: 'https://tsfinanse.com',
  },
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${siteUrl}${normalizeCanonicalPath(item.url)}`,
  })),
});

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TS Finanse',
  url: 'https://tsfinanse.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tsfinanse.com/blog/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Pożyczki hipoteczne dla przedsiębiorców',
  provider: {
    '@type': 'FinancialService',
    name: 'TS Finanse',
    url: 'https://tsfinanse.com',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Polska',
  },
  description: 'Pożyczki dla firm pod zabezpieczenie hipoteczne od 1 do 20 mln PLN. Decyzja w 3 dni robocze, własny kapitał, obsługa w całej Polsce.',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'PLN',
    availability: 'https://schema.org/InStock',
  },
};

export const blogPostingSchema = (post: {
  title: string;
  description: string;
  date: string;
  author?: string;
  image?: string;
  slug: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  datePublished: post.date,
  dateModified: post.date,
  author: {
    '@type': 'Organization',
    name: post.author || 'TS Finanse',
    url: 'https://tsfinanse.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'TS Finanse',
    logo: {
      '@type': 'ImageObject',
      url: 'https://tsfinanse.com/logo.webp',
    },
  },
  image: post.image || 'https://tsfinanse.com/og-image.webp',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://tsfinanse.com/blog/${post.slug}/`,
  },
});

export const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
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

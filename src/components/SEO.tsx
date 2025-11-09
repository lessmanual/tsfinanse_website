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
const siteUrl = 'https://www.tsfinanse.com';
const defaultOgImage = `${siteUrl}/og-image.jpg`;

export function SEO({
  title,
  description = defaultDescription,
  canonicalUrl,
  ogImage = defaultOgImage,
  ogType = 'website',
  schema,
}: SEOProps) {
  const fullTitle = title ? `${title} | TS Finanse` : defaultTitle;
  const canonical = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

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
  name: 'TS Finanse',
  alternateName: 'TS Finanse Sp. z o.o.',
  url: 'https://www.tsfinanse.com',
  logo: 'https://www.tsfinanse.com/logo.png',
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
      opens: '09:00',
      closes: '17:00',
    },
  ],
  taxID: '5882454029',
  vatID: 'PL5882454029',
  legalName: 'TS Finanse Sp. z o.o.',
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
    url: 'https://www.tsfinanse.com',
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
    url: 'https://www.tsfinanse.com',
  },
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://www.tsfinanse.com${item.url}`,
  })),
});

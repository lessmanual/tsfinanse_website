import { LegalPageLayout } from '../components/LegalPageLayout';
import { SEO, breadcrumbSchema } from '../components/SEO';
import cookiePolicyContent from '../../polityka-cookies.md?raw';

export default function PolitykaCookies() {
  return (
    <>
      <SEO
        title="Polityka Cookies"
        canonicalUrl="/polityka-cookies"
        description="Polityka cookies TS Finanse - informacje o plikach cookies, ich rodzajach oraz sposobach zarządzania ustawieniami cookies."
        schema={breadcrumbSchema([
          { name: 'Strona główna', url: '/' },
          { name: 'Polityka Cookies', url: '/polityka-cookies' },
        ])}
      />
      <LegalPageLayout
        title="Polityka Cookies"
        content={cookiePolicyContent}
      />
    </>
  );
}

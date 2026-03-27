import { LegalPageLayout } from '../components/LegalPageLayout';
import { SEO, breadcrumbSchema } from '../components/SEO';
import privacyPolicyContent from '../../polityka-prywatnosci.md?raw';

export default function PolitykaPrywatnosci() {
  return (
    <>
      <SEO
        title="Polityka Prywatności"
        canonicalUrl="/polityka-prywatnosci"
        description="Polityka prywatności TS Finanse - informacje o przetwarzaniu danych osobowych, prawach użytkowników i zasadach ochrony prywatności."
        schema={breadcrumbSchema([
          { name: 'Strona główna', url: '/' },
          { name: 'Polityka Prywatności', url: '/polityka-prywatnosci' },
        ])}
      />
      <LegalPageLayout
        title="Polityka Prywatności"
        content={privacyPolicyContent}
      />
    </>
  );
}

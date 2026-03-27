import { LegalPageLayout } from '../components/LegalPageLayout';
import { SEO, breadcrumbSchema } from '../components/SEO';
import rodoContent from '../../klauzula-rodo.md?raw';

export default function RodoInfo() {
  return (
    <>
      <SEO
        title="Klauzula informacyjna RODO"
        canonicalUrl="/rodo"
        description="Klauzula informacyjna RODO TS Finanse - informacje o administratorze danych, celach przetwarzania i prawach osób, których dane dotyczą."
        schema={breadcrumbSchema([
          { name: 'Strona główna', url: '/' },
          { name: 'Klauzula RODO', url: '/rodo' },
        ])}
      />
      <LegalPageLayout
        title="Klauzula informacyjna RODO"
        content={rodoContent}
      />
    </>
  );
}

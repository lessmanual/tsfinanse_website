import { LegalPageLayout } from '../components/LegalPageLayout';
import { SEO, breadcrumbSchema } from '../components/SEO';
import termsContent from '../../regulamin.md?raw';

export default function Regulamin() {
  return (
    <>
      <SEO
        title="Regulamin"
        canonicalUrl="/regulamin"
        description="Regulamin świadczenia usług TS Finanse - warunki korzystania z serwisu, zasady udzielania pożyczek hipotecznych dla przedsiębiorców."
        schema={breadcrumbSchema([
          { name: 'Strona główna', url: '/' },
          { name: 'Regulamin', url: '/regulamin' },
        ])}
      />
      <LegalPageLayout
        title="Regulamin świadczenia usług"
        content={termsContent}
      />
    </>
  );
}

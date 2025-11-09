import { LegalPageLayout } from '../components/LegalPageLayout';
import { useEffect } from 'react';
import privacyPolicyContent from '../../polityka-prywatnosci.md?raw';

export default function PolitykaPrywatnosci() {
  useEffect(() => {
    document.title = 'Polityka Prywatności - TS Finanse';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageLayout
      title="Polityka Prywatności"
      content={privacyPolicyContent}
    />
  );
}

import { LegalPageLayout } from '../components/LegalPageLayout';
import { useEffect } from 'react';
import cookiePolicyContent from '../../polityka-cookies.md?raw';

export default function PolitykaCookies() {
  useEffect(() => {
    document.title = 'Polityka Cookies - TS Finanse';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageLayout
      title="Polityka Cookies"
      content={cookiePolicyContent}
    />
  );
}

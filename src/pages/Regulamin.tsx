import { LegalPageLayout } from '../components/LegalPageLayout';
import { useEffect } from 'react';
import termsContent from '../../regulamin.md?raw';

export default function Regulamin() {
  useEffect(() => {
    document.title = 'Regulamin - TS Finanse';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageLayout
      title="Regulamin świadczenia usług"
      content={termsContent}
    />
  );
}

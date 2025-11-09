import { LegalPageLayout } from '../components/LegalPageLayout';
import { useEffect } from 'react';
import rodoContent from '../../klauzula-rodo.md?raw';

export default function RodoInfo() {
  useEffect(() => {
    document.title = 'Klauzula informacyjna RODO - TS Finanse';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageLayout
      title="Klauzula informacyjna RODO"
      content={rodoContent}
    />
  );
}

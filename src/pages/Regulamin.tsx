import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';

export default function Regulamin() {
  useEffect(() => {
    document.title = 'Regulamin - TS Finanse';
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Regulamin</h1>
        <div className="prose prose-lg">
          <p className="text-gray-600">
            Treść regulaminu zostanie uzupełniona w kolejnym etapie implementacji.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

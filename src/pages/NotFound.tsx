import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Strona nie znaleziona - TS Finanse';
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-8">Strona nie znaleziona</h2>
        <p className="text-gray-600 mb-8">
          Przepraszamy, ale strona której szukasz nie istnieje.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#C5A572] text-white px-8 py-3 rounded-lg hover:bg-[#B08D5B] transition-colors"
        >
          Powrót na stronę główną
        </Link>
      </main>
      <Footer />
    </div>
  );
}

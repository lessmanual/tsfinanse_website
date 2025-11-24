import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CookieBanner } from './components/CookieBanner';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { ScrollToTopButton } from './components/ScrollToTopButton';
// Force HMR update - v1.1

// Lazy load routes for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const Blog = lazy(() => import('./pages/Blog'));
const PolitykaPrywatnosci = lazy(() => import('./pages/PolitykaPrywatnosci'));
const PolitykaCookies = lazy(() => import('./pages/PolitykaCookies'));
const Regulamin = lazy(() => import('./pages/Regulamin'));
const RodoInfo = lazy(() => import('./pages/RodoInfo'));
const ProgramPartnerski = lazy(() => import('./pages/ProgramPartnerski'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Simple loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#D4AF7A]/5 to-white">
      <div className="text-[#3D1F1F]/70">Ładowanie...</div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosci />} />
          <Route path="/polityka-cookies" element={<PolitykaCookies />} />
          <Route path="/regulamin" element={<Regulamin />} />
          <Route path="/rodo" element={<RodoInfo />} />
          <Route path="/programpartnerski" element={<ProgramPartnerski />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CookieBanner />
      <ScrollToTopButton />
    </>
  );
}

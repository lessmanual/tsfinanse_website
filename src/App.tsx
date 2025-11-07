import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PolitykaPrywatnosci from './pages/PolitykaPrywatnosci';
import PolitykaCookies from './pages/PolitykaCookies';
import Regulamin from './pages/Regulamin';
import RodoInfo from './pages/RodoInfo';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosci />} />
      <Route path="/polityka-cookies" element={<PolitykaCookies />} />
      <Route path="/regulamin" element={<Regulamin />} />
      <Route path="/rodo" element={<RodoInfo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

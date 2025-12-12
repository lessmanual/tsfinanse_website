import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Conditions } from '../components/Conditions';
import { Benefits } from '../components/Benefits';
import { Process } from '../components/Process';
import { ContactForm } from '../components/ContactForm';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { SEO, organizationSchema, loanProductSchema } from '../components/SEO';

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/kontakt') {
      const element = document.getElementById('contact');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen">
      <SEO
        description="Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne. 1-20 mln PLN, oprocentowanie ustalane indywidualnie, decyzja w 3 dni. Własny kapitał, bez zależności od banków."
        canonicalUrl="/"
        schema={[organizationSchema, loanProductSchema]}
      />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Conditions />
        <Benefits />
        <Process />
        <ContactForm />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

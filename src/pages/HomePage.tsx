import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Conditions } from '../components/Conditions';
import { Benefits } from '../components/Benefits';
import { Process } from '../components/Process';
import { ContactForm } from '../components/ContactForm';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Update document title
    document.title = 'TS Finanse - Pożyczki dla Firm 1-20 mln PLN | Hipoteka | Decyzja w 3 dni';

    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne. 1-20 mln PLN, 15% rocznie, decyzja w 3 dni. Własny kapitał, bez zależności od banków.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne. 1-20 mln PLN, 15% rocznie, decyzja w 3 dni. Własny kapitał, bez zależności od banków.';
      document.head.appendChild(meta);
    }

    // Add Open Graph meta tags
    const addMetaTag = (property: string, content: string) => {
      const existingTag = document.querySelector(`meta[property="${property}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    addMetaTag('og:title', 'TS Finanse - Pożyczki dla Firm pod Zabezpieczenie Hipoteczne');
    addMetaTag('og:description', 'Finansowanie dla przedsiębiorców 1-20 mln PLN. Decyzja w 3 dni. Niezależni od banków.');
    addMetaTag('og:type', 'website');
    addMetaTag('og:url', 'https://tsfinanse.com');

    // Add Schema.org JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "name": "TS Finanse",
      "description": "Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne",
      "url": "https://tsfinanse.com",
      "email": "kontakt@tsfinanse.com",
      "areaServed": {
        "@type": "Country",
        "name": "Polska"
      },
      "currenciesAccepted": "PLN",
      "priceRange": "1000000-20000000",
      "serviceType": "Business Loan",
      "offers": {
        "@type": "Offer",
        "name": "Pożyczka hipoteczna dla firm",
        "price": "15",
        "priceCurrency": "PLN",
        "description": "Oprocentowanie 15% rocznie",
        "availability": "https://schema.org/InStock"
      }
    });
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen">
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

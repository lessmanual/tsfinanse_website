import { Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from 'figma:asset/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png';
import logoAvif from '../assets/logo.avif';
import logoWebp from '../assets/logo.webp';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#3D1F1F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 inline-block bg-white rounded-lg px-3 py-2">
              <picture>
                <source type="image/avif" srcSet={logoAvif} />
                <source type="image/webp" srcSet={logoWebp} />
                <img
                  src={logoImage}
                  alt="TS Finanse Logo"
                  className="h-16 w-auto"
                  width="1000"
                  height="1000"
                  loading="lazy"
                />
              </picture>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Profesjonalne finansowanie dla przedsiębiorców pod zabezpieczenie hipoteczne.
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="mb-4 text-[#D4AF7A]">
              Kontakt
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:kontakt@tsfinanse.com"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Mail size={16} />
                kontakt@tsfinanse.com
              </a>
              <a
                href="mailto:rodo@tsfinanse.com"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Mail size={16} />
                rodo@tsfinanse.com
              </a>
              <p className="text-white/70">
                Tel: +48 506 711 242
              </p>
              <p className="text-white/70">
                Obszar działania: Cała Polska
              </p>
            </div>
          </div>

          {/* Dane Firmowe */}
          <div>
            <h3 className="mb-4 text-[#D4AF7A]">
              Dane Firmowe
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-white/70">
                <span className="text-white/50">NIP:</span> 5882454029
              </p>
              <p className="text-white/70">
                <span className="text-white/50">REGON:</span> 38480001300000
              </p>
              <p className="text-white/70">
                ul. Gdańska 60
              </p>
              <p className="text-white/70">
                84-240 Reda
              </p>
              <div className="pt-2 space-y-2">
                <Link
                  to="/polityka-prywatnosci"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Polityka Prywatności
                </Link>
                <Link
                  to="/rodo"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  RODO
                </Link>
              </div>
            </div>
          </div>

          {/* Dla Partnerów */}
          <div>
            <h3 className="mb-4 text-[#D4AF7A]">
              Dla Partnerów
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-white/70 leading-relaxed">
                Program partnerski dla pośredników kredytowych
              </p>
              <a
                href="mailto:partnerzy@tsfinanse.com"
                className="inline-flex items-center gap-2 text-[#D4AF7A] hover:text-[#E8D4B8] transition-colors"
              >
                partnerzy@tsfinanse.com
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p>
              © {currentYear} TS Finanse. Wszystkie prawa zastrzeżone.
            </p>
            <p className="text-center md:text-right">
              Pożyczki hipoteczne dla przedsiębiorców | 1-20 mln PLN
            </p>
          </div>
        </div>
      </div>

      {/* Financial Disclaimers */}
      <div className="bg-[#2A1414] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <p className="text-xs text-white/60 text-center leading-relaxed">
              <strong className="text-white/70">Zastrzeżenie prawne:</strong> TS Finanse nie jest bankiem ani instytucją kredytową w rozumieniu ustawy Prawo bankowe. Świadczymy usługi finansowania w oparciu o własny kapitał.
            </p>
            <p className="text-xs text-white/60 text-center leading-relaxed">
              Wszystkie oferty finansowania są indywidualne i wymagają szczegółowej analizy zdolności kredytowej, dokumentacji biznesowej oraz ustanowienia zabezpieczenia hipotecznego na nieruchomości. Przedstawione warunki mają charakter informacyjny.
            </p>
            <p className="text-xs text-white/60 text-center leading-relaxed">
              <strong className="text-white/70">RRSO:</strong> Rzeczywista Roczna Stopa Oprocentowania jest obliczana indywidualnie dla każdego klienta i zależy od kwoty finansowania, okresu spłaty oraz profilu ryzyka. Przykładowa kalkulacja dostępna na żądanie.
            </p>
            <p className="text-xs text-white/60 text-center leading-relaxed">
              Decyzja o udzieleniu finansowania podejmowana jest po weryfikacji kompletnej dokumentacji. Nie gwarantujemy pozytywnej decyzji kredytowej.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

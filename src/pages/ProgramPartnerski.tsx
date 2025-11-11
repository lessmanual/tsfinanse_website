import { useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, TrendingUp, Zap, FileText, Shield, Handshake } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function ProgramPartnerski() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#D4AF7A]/5 to-white">
      <SEO
        title="Program Partnerski dla Pośredników"
        description="Dołącz do programu partnerskiego TS Finanse. 1% prowizji od wartości pożyczki, szybkie decyzje w 3 dni, minimum formalności. Dla pośredników kredytowych, doradców finansowych i agentów nieruchomości."
        canonicalUrl="/programpartnerski"
      />
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-48">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D1F1F] mb-8">
            Współpraca z TS Finanse
          </h1>
          <p className="text-xl text-[#3D1F1F]/80 max-w-3xl mx-auto mb-4">
            Pożyczki dla biznesu pod zabezpieczenie hipoteczne
          </p>
          <p className="text-lg text-[#3D1F1F]/70 max-w-3xl mx-auto">
            Jesteś pośrednikiem kredytowym, doradcą finansowym lub agentem nieruchomości?<br />
            Dołącz do programu partnerskiego <strong>TS Finanse</strong> i zarabiaj na polecaniu klientów biznesowych, którzy potrzebują szybkiego finansowania.
          </p>
        </div>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-[#3D1F1F] mt-12 mb-12 text-center">
            Co oferujemy partnerom
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#3D1F1F]/10 rounded-xl p-6 hover:border-[#D4AF7A]/40 transition-colors">
              <TrendingUp className="w-12 h-12 text-[#D4AF7A] mb-4" />
              <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">
                1% prowizji
              </h3>
              <p className="text-[#3D1F1F]/70">
                Od wartości udzielonej pożyczki
              </p>
            </div>

            <div className="bg-white border border-[#3D1F1F]/10 rounded-xl p-6 hover:border-[#D4AF7A]/40 transition-colors">
              <Zap className="w-12 h-12 text-[#D4AF7A] mb-4" />
              <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">
                Szybkie decyzje
              </h3>
              <p className="text-[#3D1F1F]/70">
                Nawet w 3 dni robocze
              </p>
            </div>

            <div className="bg-white border border-[#3D1F1F]/10 rounded-xl p-6 hover:border-[#D4AF7A]/40 transition-colors">
              <FileText className="w-12 h-12 text-[#D4AF7A] mb-4" />
              <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">
                Minimum formalności
              </h3>
              <p className="text-[#3D1F1F]/70">
                Prosty i przejrzysty proces
              </p>
            </div>

            <div className="bg-white border border-[#3D1F1F]/10 rounded-xl p-6 hover:border-[#D4AF7A]/40 transition-colors">
              <CheckCircle className="w-12 h-12 text-[#D4AF7A] mb-4" />
              <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">
                Własny kapitał
              </h3>
              <p className="text-[#3D1F1F]/70">
                Brak zależności od banków
              </p>
            </div>

            <div className="bg-white border border-[#3D1F1F]/10 rounded-xl p-6 hover:border-[#D4AF7A]/40 transition-colors">
              <Shield className="w-12 h-12 text-[#D4AF7A] mb-4" />
              <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">
                Bezpieczeństwo prawne
              </h3>
              <p className="text-[#3D1F1F]/70">
                Każdej transakcji
              </p>
            </div>

            <div className="bg-white border border-[#3D1F1F]/10 rounded-xl p-6 hover:border-[#D4AF7A]/40 transition-colors">
              <Handshake className="w-12 h-12 text-[#D4AF7A] mb-4" />
              <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">
                Współpraca długoterminowa
              </h3>
              <p className="text-[#3D1F1F]/70">
                Przejrzyste zasady i komunikacja
              </p>
            </div>
          </div>
        </section>

        {/* Loan Parameters Table */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-[#3D1F1F] mt-12 mb-12 text-center">
            Parametry pożyczki
          </h2>
          <div className="bg-white border border-[#3D1F1F]/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#D4AF7A]/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[#3D1F1F] font-medium">Parametr</th>
                  <th className="px-6 py-4 text-left text-[#3D1F1F] font-medium">Zakres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D1F1F]/10">
                <tr className="hover:bg-[#D4AF7A]/5 transition-colors">
                  <td className="px-6 py-4 text-[#3D1F1F] font-medium">Kwota</td>
                  <td className="px-6 py-4 text-[#3D1F1F]/80">1 000 000 zł – 20 000 000 zł</td>
                </tr>
                <tr className="hover:bg-[#D4AF7A]/5 transition-colors">
                  <td className="px-6 py-4 text-[#3D1F1F] font-medium">Okres</td>
                  <td className="px-6 py-4 text-[#3D1F1F]/80">12 – 36 miesięcy</td>
                </tr>
                <tr className="hover:bg-[#D4AF7A]/5 transition-colors">
                  <td className="px-6 py-4 text-[#3D1F1F] font-medium">LTV</td>
                  <td className="px-6 py-4 text-[#3D1F1F]/80">do 60% wartości nieruchomości</td>
                </tr>
                <tr className="hover:bg-[#D4AF7A]/5 transition-colors">
                  <td className="px-6 py-4 text-[#3D1F1F] font-medium">Cel</td>
                  <td className="px-6 py-4 text-[#3D1F1F]/80">związany z działalnością gospodarczą</td>
                </tr>
                <tr className="hover:bg-[#D4AF7A]/5 transition-colors">
                  <td className="px-6 py-4 text-[#3D1F1F] font-medium">Zabezpieczenie</td>
                  <td className="px-6 py-4 text-[#3D1F1F]/80">nieruchomość (mieszkanie, dom, lokal, działka inwestycyjna, komercyjna)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-[#3D1F1F] mt-12 mb-12 text-center">
            Jak to działa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#D4AF7A] text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">Zgłaszasz klienta</h3>
                <p className="text-[#3D1F1F]/70">
                  Przesyłasz jego dane lub projekt do analizy
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#D4AF7A] text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">Analiza i decyzja</h3>
                <p className="text-[#3D1F1F]/70">
                  Kontaktujemy się z klientem i przygotowujemy ofertę
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#D4AF7A] text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">Podpisanie umowy</h3>
                <p className="text-[#3D1F1F]/70">
                  Po uruchomieniu finansowania wypłacamy środki klientowi
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#D4AF7A] text-white flex items-center justify-center font-bold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#3D1F1F] mb-2">Wypłata prowizji</h3>
                <p className="text-[#3D1F1F]/70">
                  Otrzymujesz 1% wartości pożyczki
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-[#3D1F1F] mt-12 mb-12 text-center">
            Dla kogo
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-white border border-[#3D1F1F]/10 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-[#D4AF7A] flex-shrink-0" />
              <span className="text-[#3D1F1F]">Pośrednicy kredytowi i finansowi</span>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#3D1F1F]/10 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-[#D4AF7A] flex-shrink-0" />
              <span className="text-[#3D1F1F]">Doradcy inwestycyjni i biznesowi</span>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#3D1F1F]/10 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-[#D4AF7A] flex-shrink-0" />
              <span className="text-[#3D1F1F]">Biura nieruchomości i deweloperzy</span>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#3D1F1F]/10 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-[#D4AF7A] flex-shrink-0" />
              <span className="text-[#3D1F1F]">Kancelarie prawne i doradztwa gospodarczego</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#3D1F1F] to-[#2A1414] rounded-xl p-8 md:p-12 text-center text-white mt-12">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Dołącz do grona partnerów TS Finanse
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Współpracując z nami, zyskujesz <strong>stałe źródło przychodu</strong> i pewnego partnera w finansowaniu biznesu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="mailto:kontakt@tsfinanse.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF7A] text-[#3D1F1F] rounded-lg hover:bg-[#E8D4B8] transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              kontakt@tsfinanse.com
            </a>
            <a
              href="tel:+48506711242"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium"
            >
              +48 506 711 242
            </a>
          </div>

          <p className="text-white/80">
            <strong>ul. Gdańska 60, 84-240 Reda</strong>
          </p>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-lg font-medium">
              TS Finanse – Bezpieczne finansowanie dla przedsiębiorców
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

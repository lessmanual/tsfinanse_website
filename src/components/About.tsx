import { Building2, TrendingUp, Clock } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="mb-6 text-[#3D1F1F] text-[32px]">
            Kim jesteśmy?
          </h2>
          <p className="text-lg text-[#3D1F1F]/80 leading-relaxed">
            TS Finanse specjalizuje się w udzielaniu <strong>pożyczek dla przedsiębiorców</strong> pod zabezpieczenie hipoteczne. 
            Jesteśmy niezależni od banków i finansujemy z własnego kapitału, co pozwala nam na szybkie decyzje i elastyczne podejście.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-8 rounded-xl bg-gradient-to-br from-[#D4AF7A]/10 to-transparent border border-[#D4AF7A]/20 hover:border-[#D4AF7A]/40 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3D1F1F] flex items-center justify-center">
              <Building2 className="text-[#D4AF7A]" size={28} />
            </div>
            <h3 className="mb-2 text-[#3D1F1F]">Dla przedsiębiorców</h3>
            <p className="text-[#3D1F1F]/70">
              Wspieramy rozwój firm własnymi środkami
            </p>
          </div>

          <div className="text-center p-8 rounded-xl bg-gradient-to-br from-[#D4AF7A]/10 to-transparent border border-[#D4AF7A]/20 hover:border-[#D4AF7A]/40 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3D1F1F] flex items-center justify-center">
              <Clock className="text-[#D4AF7A]" size={28} />
            </div>
            <h3 className="mb-2 text-[#3D1F1F]">Szybkie decyzje</h3>
            <p className="text-[#3D1F1F]/70">
              Odpowiedź w ciągu 3 dni roboczych
            </p>
          </div>

          <div className="text-center p-8 rounded-xl bg-gradient-to-br from-[#D4AF7A]/10 to-transparent border border-[#D4AF7A]/20 hover:border-[#D4AF7A]/40 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3D1F1F] flex items-center justify-center">
              <TrendingUp className="text-[#D4AF7A]" size={28} />
            </div>
            <h3 className="mb-2 text-[#3D1F1F]">Elastyczne podejście</h3>
            <p className="text-[#3D1F1F]/70">
              Indywidualna analiza każdego projektu
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-xl bg-[#3D1F1F]/5 border border-[#3D1F1F]/10">
            <h3 className="mb-4 text-[#3D1F1F]">Dla kogo?</h3>
            <p className="text-[#3D1F1F]/80 leading-relaxed">
              Dla firm, które potrzebują kapitału na krótki okres i nie mają możliwości pożyczenia pieniędzy z banku 
              lub procedury bankowe są zbyt długie.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Banknote, Zap, FileText, Shield, Puzzle, Users } from 'lucide-react';

export function Benefits() {
  const benefits = [
    {
      icon: Banknote,
      title: 'Własny Kapitał',
      description: 'Niezależni od banków - finansujemy ze środków własnych'
    },
    {
      icon: Zap,
      title: 'Szybkie Decyzje',
      description: 'Decyzja kredytowa nawet w 3 dni robocze'
    },
    {
      icon: FileText,
      title: 'Minimum Formalności',
      description: 'Prosty i przejrzysty proces, uproszczona dokumentacja'
    },
    {
      icon: Shield,
      title: 'Bezpieczeństwo Prawne',
      description: 'Pełna obsługa notarialna i prawna każdej transakcji'
    },
    {
      icon: Puzzle,
      title: 'Elastyczność',
      description: 'Indywidualne podejście do każdego projektu'
    },
    {
      icon: Users,
      title: 'Doświadczony Zespół',
      description: 'Rzetelna ocena i profesjonalna obsługa'
    }
  ];

  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-[#3D1F1F] text-[32px]">
            Dlaczego TS Finanse?
          </h2>
          <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
            Oferujemy kompleksową obsługę finansowania hipotecznego dla przedsiębiorców
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-xl border border-[#3D1F1F]/10 hover:border-[#3D1F1F]/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#D4AF7A]/5"
              >
                <div className="w-14 h-14 mb-5 rounded-lg bg-gradient-to-br from-[#3D1F1F] to-[#2A1414] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="text-[#D4AF7A]" size={28} />
                </div>
                <h3 className="mb-3 text-[#3D1F1F]">
                  {benefit.title}
                </h3>
                <p className="text-[#3D1F1F]/70 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="p-8 rounded-xl bg-gradient-to-r from-[#3D1F1F]/5 via-[#D4AF7A]/10 to-[#3D1F1F]/5 border border-[#3D1F1F]/10">
            <h3 className="mb-4 text-[#3D1F1F]">
              Czym różnimy się od banku?
            </h3>
            <p className="text-[#3D1F1F]/80 leading-relaxed">
              Mamy własny kapitał, więc nie jesteśmy ograniczeni regulacjami bankowymi. 
              To pozwala na szybsze decyzje, elastyczność i możliwość finansowania projektów odrzucanych przez banki.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

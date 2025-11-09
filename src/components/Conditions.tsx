import { Info } from 'lucide-react';
import { useState } from 'react';

export function Conditions() {
  const [showTooltip, setShowTooltip] = useState(false);

  const conditions = [
    {
      label: 'Kwota pożyczki',
      value: '1 000 000 zł - 20 000 000 zł',
      highlight: true
    },
    {
      label: 'Okres finansowania',
      value: '12 - 36 miesięcy'
    },
    {
      label: 'Oprocentowanie',
      value: '15% rocznie'
    },
    {
      label: 'LTV (Loan-to-Value)',
      value: 'maksymalnie 60% wartości nieruchomości',
      highlight: true
    },
    {
      label: 'Zabezpieczenie',
      value: 'wyłącznie hipoteka (pozycja senioralna)',
      info: true,
      highlight: true
    },
    {
      label: 'Akceptowane nieruchomości',
      value: 'mieszkanie, dom, lokal komercyjny, działka inwestycyjna'
    },
    {
      label: 'Cel pożyczki',
      value: 'związany z prowadzoną działalnością gospodarczą'
    },
    {
      label: 'Obszar działania',
      value: 'cała Polska'
    }
  ];

  return (
    <section id="conditions" className="py-24 bg-gradient-to-br from-[#D4AF7A]/8 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-[#3D1F1F] text-[32px]">
            Warunki Finansowania
          </h2>
          <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
            Przejrzyste i jasne kryteria współpracy
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            {conditions.map((condition, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border bg-white border-[#3D1F1F]/20 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[#3D1F1F]">
                        {condition.label}
                      </h3>
                      {condition.info && (
                        <div className="relative">
                          <button
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            className="text-[#3D1F1F]/50 hover:text-[#3D1F1F] transition-colors"
                          >
                            <Info size={18} />
                          </button>
                          {showTooltip && (
                            <div className="absolute left-0 top-8 z-10 w-80 p-4 bg-[#3D1F1F] text-white text-sm rounded-lg shadow-xl">
                              <p className="mb-2">
                                <strong>Pozycja senioralna</strong> = TS Finanse musi być jedynym podmiotem wpisanym w hipotece.
                              </p>
                              <p className="text-white/90">
                                Oznacza to pierwszeństwo w zaspokojeniu roszczeń w przypadku egzekucji zabezpieczenia.
                              </p>
                              <div className="absolute -top-2 left-4 w-4 h-4 bg-[#3D1F1F] transform rotate-45" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-[#3D1F1F]">
                      {condition.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="mt-12 p-8 rounded-xl bg-[#3D1F1F] text-white text-center">
            <p className="text-lg mb-2">
              Dla nieruchomości wartej <strong className="text-[#D4AF7A]">10 mln PLN</strong>
            </p>
            <p className="text-2xl">
              można otrzymać maksymalnie <strong className="text-[#D4AF7A]">6 mln PLN</strong> pożyczki
            </p>
            <p className="mt-3 text-white/70 text-sm">
              (60% LTV zapewnia bezpieczeństwo obu stron)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

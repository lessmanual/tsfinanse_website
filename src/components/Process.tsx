import { Send, Search, FileCheck, FileSignature, TrendingUp } from 'lucide-react';

export function Process() {
  const steps = [
    {
      number: '1',
      icon: Send,
      title: 'Kontakt',
      description: 'Wysyłasz zapytanie przez formularz lub email'
    },
    {
      number: '2',
      icon: Search,
      title: 'Analiza',
      description: 'Analizujemy wniosek i kontaktujemy się w ciągu 24h'
    },
    {
      number: '3',
      icon: FileCheck,
      title: 'Oferta',
      description: 'Przygotowujemy indywidualną ofertę finansowania'
    },
    {
      number: '4',
      icon: FileSignature,
      title: 'Finalizacja',
      description: 'Podpisanie umowy i obsługa notarialna'
    },
    {
      number: '5',
      icon: TrendingUp,
      title: 'Wypłata',
      description: 'Uruchomienie środków - rozwój Twojej firmy'
    }
  ];

  return (
    <section id="process" className="py-24 bg-gradient-to-br from-[#3D1F1F]/5 via-white to-[#D4AF7A]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-[#3D1F1F] text-[32px]">
            Jak to działa?
          </h2>
          <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
            Prosty i przejrzysty proces w 5 krokach
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            {/* Connection Line */}
            <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3D1F1F]/20 via-[#D4AF7A] to-[#3D1F1F]/20" />
            
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Step Number Circle */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#3D1F1F] border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                        <span className="text-2xl text-[#D4AF7A]">{step.number}</span>
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="text-center p-6 rounded-xl bg-white border border-[#3D1F1F]/10 hover:border-[#3D1F1F]/30 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#D4AF7A]/20 flex items-center justify-center">
                        <Icon className="text-[#3D1F1F]" size={24} />
                      </div>
                      <h3 className="mb-2 text-[#3D1F1F]">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#3D1F1F]/70">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile/Tablet Timeline */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-[#D4AF7A] to-[#3D1F1F]/20 -mb-6" />
                  )}
                  
                  <div className="flex gap-6">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-[#3D1F1F] border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                        <span className="text-2xl text-[#D4AF7A]">{step.number}</span>
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 p-6 rounded-xl bg-white border border-[#3D1F1F]/10 hover:border-[#3D1F1F]/30 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#D4AF7A]/20 flex items-center justify-center">
                          <Icon className="text-[#3D1F1F]" size={24} />
                        </div>
                        <div>
                          <h3 className="mb-2 text-[#3D1F1F]">
                            {step.title}
                          </h3>
                          <p className="text-[#3D1F1F]/70">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

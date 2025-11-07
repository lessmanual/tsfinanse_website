import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactForm() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-[#3D1F1F] text-[32px]">
            Wyślij Zapytanie
          </h2>
          <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
            Skontaktuj się z nami - odpowiemy w ciągu 24 godzin
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="mb-6 text-[#3D1F1F]">
                Dane kontaktowe
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#D4AF7A]/20 flex items-center justify-center">
                    <Mail className="text-[#3D1F1F]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D1F1F]/60 mb-1">Email</p>
                    <a 
                      href="mailto:kontakt@tsfinanse.com" 
                      className="text-[#3D1F1F] hover:text-[#2A1414] transition-colors"
                    >
                      kontakt@tsfinanse.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#D4AF7A]/20 flex items-center justify-center">
                    <Phone className="text-[#3D1F1F]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D1F1F]/60 mb-1">Telefon</p>
                    <p className="text-[#3D1F1F]">
                      (wkrótce dostępny)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#D4AF7A]/20 flex items-center justify-center">
                    <MapPin className="text-[#3D1F1F]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D1F1F]/60 mb-1">Obszar działania</p>
                    <p className="text-[#3D1F1F]">
                      Cała Polska
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-[#3D1F1F]/5 to-[#D4AF7A]/5 border border-[#3D1F1F]/10">
              <h4 className="mb-3 text-[#3D1F1F]">
                Godziny pracy
              </h4>
              <div className="space-y-2 text-sm text-[#3D1F1F]/70">
                <div className="flex justify-between">
                  <span>Poniedziałek - Piątek</span>
                  <span>9:00 - 17:00</span>
                </div>
                <div className="flex justify-between text-[#3D1F1F]/50">
                  <span>Sobota - Niedziela</span>
                  <span>Zamknięte</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Placeholder */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border-2 border-dashed border-[#3D1F1F]/20 bg-[#D4AF7A]/5 p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#3D1F1F]/10 flex items-center justify-center">
                  <FileText className="text-[#3D1F1F]" size={32} />
                </div>
                <h3 className="text-[#3D1F1F]">
                  Formularz kontaktowy n8n
                </h3>
                <p className="text-[#3D1F1F]/70 max-w-md mx-auto">
                  Tutaj zostanie umieszczony formularz n8n (iframe) po jego przygotowaniu przez zespół techniczny.
                </p>
                <div className="pt-4">
                  <code className="inline-block px-4 py-2 bg-white rounded-lg text-sm text-[#3D1F1F]/60 border border-[#3D1F1F]/10">
                    <iframe src="[n8n-form-url]" />
                  </code>
                </div>
                <p className="text-sm text-[#3D1F1F]/60 pt-4">
                  W międzyczasie prosimy o kontakt mailowy: <strong>kontakt@tsfinanse.com</strong>
                </p>
              </div>
            </div>

            {/* Expected Form Fields Info */}
            <div className="mt-8 p-6 rounded-xl bg-white border border-[#3D1F1F]/10">
              <h4 className="mb-4 text-[#3D1F1F]">
                Formularz będzie zawierał:
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-[#3D1F1F]/70">
                <div>• Imię i nazwisko / Nazwa firmy</div>
                <div>• Email</div>
                <div>• Telefon</div>
                <div>• Kwota pożyczki (1-20 mln PLN)</div>
                <div>• Wartość zabezpieczenia</div>
                <div>• Cel pożyczki</div>
                <div>• Opis projektu</div>
                <div>• Zgoda RODO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

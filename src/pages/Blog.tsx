import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Blog() {
  return (
    <>
      <Helmet>
        <title>Blog - TS Finanse | Aktualności i Porady Finansowe</title>
        <meta
          name="description"
          content="Blog TS Finanse - aktualności ze świata finansów dla przedsiębiorców, porady dotyczące pożyczek hipotecznych i finansowania biznesu."
        />
        <link rel="canonical" href="https://www.tsfinanse.com/blog" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-white via-[#D4AF7A]/5 to-white pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3D1F1F] mb-4">
              Blog TS Finanse
            </h1>
            <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
              Aktualności, porady i wiedza o finansowaniu dla przedsiębiorców
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-[#3D1F1F]/10 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#3D1F1F]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-[#3D1F1F] mb-4">
                Nowe wpisy wkrótce
              </h2>

              <p className="text-[#3D1F1F]/70 mb-8 leading-relaxed">
                Przygotowujemy dla Ciebie wartościowe treści o finansowaniu biznesu,
                pożyczkach hipotecznych i zarządzaniu kapitałem w firmie.
              </p>

              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-[#3D1F1F]/80">
                    Praktyczne porady dotyczące finansowania
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-[#3D1F1F]/80">
                    Aktualne trendy na rynku pożyczek biznesowych
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-[#3D1F1F]/80">
                    Historie sukcesów naszych klientów
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-[#3D1F1F]/10">
                <p className="text-sm text-[#3D1F1F]/60 mb-4">
                  Masz pytania? Skontaktuj się z nami już teraz
                </p>
                <a
                  href="mailto:kontakt@tsfinanse.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Skontaktuj się
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

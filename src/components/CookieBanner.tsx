import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent, CookiePreferences } from '../hooks/useCookieConsent';
import { X, Settings, Cookie } from 'lucide-react';

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, customizeConsent } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    customizeConsent(preferences);
    setShowSettings(false);
  };

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cookie className="w-6 h-6 text-[#C5A572]" />
              <h2 className="text-2xl font-bold text-gray-900">Ustawienia Cookies</h2>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Zamknij"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            <p className="text-gray-700">
              Używamy plików cookies, aby zapewnić najlepszą jakość korzystania z naszej strony.
              Możesz zarządzać swoimi preferencjami dotyczącymi cookies poniżej.
            </p>

            {/* Essential Cookies */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies Niezbędne</h3>
                  <p className="text-sm text-gray-600">
                    Te pliki cookies są niezbędne do prawidłowego działania strony i nie można ich wyłączyć.
                    Obejmują one sesje użytkownika, preferencje językowe i podstawowe funkcje bezpieczeństwa.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Zawsze aktywne
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies Analityczne</h3>
                  <p className="text-sm text-gray-600">
                    Pozwalają nam analizować korzystanie ze strony i mierzyć jej wydajność.
                    Wszystkie dane są anonimowe i pomagają nam poprawić jakość usług.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C5A572]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A572]"></div>
                </label>
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Używane narzędzia:</span> Google Analytics 4
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies Marketingowe</h3>
                  <p className="text-sm text-gray-600">
                    Używane do śledzenia preferencji użytkowników i wyświetlania spersonalizowanych reklam.
                    Możesz je wyłączyć, jeśli nie chcesz otrzymywać dopasowanych treści.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C5A572]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A572]"></div>
                </label>
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Używane narzędzia:</span> Facebook Pixel, LinkedIn Insight Tag
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Więcej informacji o plikach cookies znajdziesz w naszej{' '}
              <Link to="/polityka-cookies" className="text-[#C5A572] hover:underline font-medium">
                Polityce Cookies
              </Link>
              .
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Anuluj
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-6 py-2.5 bg-[#C5A572] text-white rounded-lg hover:bg-[#B39562] transition-colors font-medium"
            >
              Zapisz preferencje
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#C5A572] shadow-2xl z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Icon and Text */}
          <div className="flex items-start gap-4 flex-1">
            <Cookie className="w-8 h-8 text-[#C5A572] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ta strona używa plików cookies
              </h3>
              <p className="text-sm text-gray-600">
                Używamy plików cookies, aby zapewnić najlepszą jakość korzystania z naszej strony.
                Możesz zaakceptować wszystkie cookies, odrzucić opcjonalne lub dostosować swoje preferencje.{' '}
                <Link to="/polityka-cookies" className="text-[#C5A572] hover:underline font-medium">
                  Dowiedz się więcej
                </Link>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              Dostosuj
            </button>
            <button
              onClick={rejectAll}
              className="px-6 py-2.5 border-2 border-[#C5A572] text-[#C5A572] rounded-lg hover:bg-[#C5A572]/5 transition-colors font-medium whitespace-nowrap"
            >
              Odrzuć wszystkie
            </button>
            <button
              onClick={acceptAll}
              className="px-6 py-2.5 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-colors font-medium whitespace-nowrap shadow-md"
            >
              Akceptuj wszystkie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

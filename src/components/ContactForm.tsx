import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type FormData = {
  fullName: string;
  companyName: string;
  nip: string;
  email: string;
  phone: string;
  loanAmount: string;
  preferredContactTime: string;
  message: string;
  dataProcessingConsent: boolean;
  rodoConsent: boolean;
  marketingConsent: boolean;
};

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

// Get n8n webhook URL from environment variable
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export function ContactForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmissionState('loading');
    setErrorMessage('');

    try {
      // Prepare payload for n8n
      const payload = {
        fullName: data.fullName,
        companyName: data.companyName,
        nip: data.nip,
        email: data.email,
        phone: data.phone,
        loanAmount: data.loanAmount,
        preferredContactTime: data.preferredContactTime,
        message: data.message,
        dataProcessingConsent: data.dataProcessingConsent,
        rodoConsent: data.rodoConsent,
        marketingConsent: data.marketingConsent,
        timestamp: new Date().toISOString(),
        source: 'website-contact-form',
      };

      // Send to n8n webhook
      if (!N8N_WEBHOOK_URL) {
        throw new Error('Webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in .env file.');
      }

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Success
      setSubmissionState('success');
      reset(); // Clear form

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmissionState('idle');
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później.'
      );
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-[#3D1F1F] text-4xl font-bold">Wyślij Zapytanie</h2>
          <p className="text-lg text-[#3D1F1F]/70 max-w-2xl mx-auto">
            Skontaktuj się z nami - odpowiemy w ciągu 24 godzin
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="mb-6 text-xl font-semibold text-[#3D1F1F]">Dane kontaktowe</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#C5A572]/20 flex items-center justify-center">
                    <Mail className="text-[#3D1F1F]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D1F1F]/60 mb-1">Email</p>
                    <a
                      href="mailto:kontakt@tsfinanse.com"
                      className="text-[#3D1F1F] hover:text-[#C5A572] transition-colors"
                    >
                      kontakt@tsfinanse.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#C5A572]/20 flex items-center justify-center">
                    <Phone className="text-[#3D1F1F]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D1F1F]/60 mb-1">Telefon</p>
                    <a href="tel:+48506711242" className="text-[#3D1F1F] hover:text-[#C5A572] transition-colors">
                      +48 506 711 242
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#C5A572]/20 flex items-center justify-center">
                    <MapPin className="text-[#3D1F1F]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D1F1F]/60 mb-1">Obszar działania</p>
                    <p className="text-[#3D1F1F]">Cała Polska</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-[#3D1F1F]/5 to-[#C5A572]/5 border border-[#3D1F1F]/10">
              <h4 className="mb-3 font-semibold text-[#3D1F1F]">Godziny pracy</h4>
              <div className="space-y-2 text-sm text-[#3D1F1F]/70">
                <div className="flex justify-between">
                  <span>Poniedziałek - Piątek</span>
                  <span className="font-medium">8:00 - 16:00</span>
                </div>
                <div className="flex justify-between text-[#3D1F1F]/50">
                  <span>Sobota - Niedziela</span>
                  <span>Zamknięte</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Imię i nazwisko <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  {...register('fullName', {
                    required: 'To pole jest wymagane',
                    minLength: { value: 2, message: 'Minimum 2 znaki' },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jan Kowalski"
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
              </div>

              {/* Company Name Field */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  {...register('companyName', {
                    required: 'To pole jest wymagane',
                    minLength: { value: 2, message: 'Minimum 2 znaki' },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Firma Sp. z o.o."
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>}
              </div>

              {/* NIP Field */}
              <div>
                <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-2">
                  NIP <span className="text-red-500">*</span>
                </label>
                <input
                  id="nip"
                  type="text"
                  {...register('nip', {
                    required: 'To pole jest wymagane',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'NIP musi składać się z 10 cyfr',
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.nip ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234567890"
                  maxLength={10}
                />
                {errors.nip && <p className="mt-1 text-sm text-red-500">{errors.nip.message}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adres email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'To pole jest wymagane',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Nieprawidłowy adres email',
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jan.kowalski@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Numer telefonu <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    required: 'To pole jest wymagane',
                    pattern: {
                      value: /^(\+48)?\s?\d{3}\s?\d{3}\s?\d{3}$/,
                      message: 'Nieprawidłowy numer telefonu (format: +48 123 456 789)',
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+48 123 456 789"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Loan Amount Field */}
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Kwota pożyczki (PLN) <span className="text-red-500">*</span>
                </label>
                <input
                  id="loanAmount"
                  type="text"
                  {...register('loanAmount', {
                    required: 'To pole jest wymagane',
                    pattern: {
                      value: /^[1-9]\d*$/,
                      message: 'Wprowadź prawidłową kwotę (tylko cyfry)',
                    },
                    validate: (value) => {
                      const amount = parseInt(value);
                      if (amount < 1000000) return 'Minimalna kwota to 1 000 000 PLN';
                      if (amount > 20000000) return 'Maksymalna kwota to 20 000 000 PLN';
                      return true;
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="np. 5000000"
                />
                {errors.loanAmount && <p className="mt-1 text-sm text-red-500">{errors.loanAmount.message}</p>}
                <p className="mt-1 text-xs text-gray-500">Zakres: 1 000 000 - 20 000 000 PLN</p>
              </div>

              {/* Preferred Contact Time Field */}
              <div>
                <label htmlFor="preferredContactTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferowane godziny kontaktu <span className="text-red-500">*</span>
                </label>
                <select
                  id="preferredContactTime"
                  {...register('preferredContactTime', {
                    required: 'To pole jest wymagane',
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors ${
                    errors.preferredContactTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Wybierz przedział godzinowy</option>
                  <option value="8:00 - 10:00">8:00 - 10:00</option>
                  <option value="10:00 - 12:00">10:00 - 12:00</option>
                  <option value="12:00 - 14:00">12:00 - 14:00</option>
                  <option value="14:00 - 16:00">14:00 - 16:00</option>
                </select>
                {errors.preferredContactTime && (
                  <p className="mt-1 text-sm text-red-500">{errors.preferredContactTime.message}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Dodatkowe informacje (opcjonalnie)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register('message')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent transition-colors"
                  placeholder="Opisz swoje potrzeby finansowe lub dodaj dodatkowe informacje..."
                />
              </div>

              {/* RODO Consent Checkboxes */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* Data Processing Consent (Required) */}
                <div className="flex items-start gap-3">
                  <input
                    id="dataProcessingConsent"
                    type="checkbox"
                    {...register('dataProcessingConsent', {
                      required: 'Zgoda na przetwarzanie danych osobowych jest wymagana',
                    })}
                    className="mt-1 w-4 h-4 text-[#C5A572] border-gray-300 rounded focus:ring-[#C5A572]"
                  />
                  <label htmlFor="dataProcessingConsent" className="text-sm text-gray-700 cursor-pointer">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych przez TS Finanse w celu realizacji
                    zapytania ofertowego zgodnie z{' '}
                    <Link to="/polityka-prywatnosci" className="text-[#C5A572] hover:underline">
                      Polityką Prywatności
                    </Link>
                    . <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.dataProcessingConsent && (
                  <p className="text-sm text-red-500 ml-7">{errors.dataProcessingConsent.message}</p>
                )}

                {/* RODO Consent (Required) */}
                <div className="flex items-start gap-3">
                  <input
                    id="rodoConsent"
                    type="checkbox"
                    {...register('rodoConsent', {
                      required: 'Zapoznanie się z klauzulą RODO jest wymagane',
                    })}
                    className="mt-1 w-4 h-4 text-[#C5A572] border-gray-300 rounded focus:ring-[#C5A572]"
                  />
                  <label htmlFor="rodoConsent" className="text-sm text-gray-700 cursor-pointer">
                    Oświadczam, że zapoznałem/am się z{' '}
                    <Link to="/rodo" className="text-[#C5A572] hover:underline">
                      klauzulą informacyjną RODO
                    </Link>{' '}
                    i rozumiem swoje prawa dotyczące przetwarzania danych osobowych. <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.rodoConsent && <p className="text-sm text-red-500 ml-7">{errors.rodoConsent.message}</p>}

                {/* Marketing Consent (Optional) */}
                <div className="flex items-start gap-3">
                  <input
                    id="marketingConsent"
                    type="checkbox"
                    {...register('marketingConsent')}
                    className="mt-1 w-4 h-4 text-[#C5A572] border-gray-300 rounded focus:ring-[#C5A572]"
                  />
                  <label htmlFor="marketingConsent" className="text-sm text-gray-700 cursor-pointer">
                    Wyrażam zgodę na otrzymywanie informacji handlowych od TS Finanse drogą elektroniczną
                    (newsletter, oferty specjalne).
                  </label>
                </div>
              </div>

              {/* Art. 13 RODO Informational Clause */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-2">Informacja o przetwarzaniu danych osobowych (Art. 13 RODO):</p>
                <p>
                  Administratorem Twoich danych osobowych jest TS Finanse. Twoje dane będą przetwarzane w celu
                  obsługi zapytania ofertowego. Masz prawo do dostępu, sprostowania, usunięcia i ograniczenia
                  przetwarzania danych. Więcej informacji znajdziesz w{' '}
                  <Link to="/polityka-prywatnosci" className="text-[#C5A572] hover:underline font-medium">
                    Polityce Prywatności
                  </Link>{' '}
                  oraz{' '}
                  <Link to="/rodo" className="text-[#C5A572] hover:underline font-medium">
                    Klauzuli RODO
                  </Link>
                  .
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submissionState === 'loading'}
                className="w-full px-6 py-4 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {submissionState === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Wyślij zapytanie
                  </>
                )}
              </button>

              {/* Success Message */}
              {submissionState === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Wiadomość została wysłana!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Dziękujemy za kontakt. Odpowiemy w ciągu 24 godzin.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submissionState === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Wystąpił błąd</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

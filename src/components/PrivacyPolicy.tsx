export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-[#663F00] hover:text-[#4d2f00] transition-colors mb-8"
          >
            ← Powrót do strony głównej
          </a>
          <h1 className="mb-4 text-[#663F00]">
            Polityka Prywatności
          </h1>
          <p className="text-[#663F00]/70">
            Ostatnia aktualizacja: 3 listopada 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="p-8 rounded-xl bg-[#E2C7A1]/10 border border-[#663F00]/20 mb-8">
            <h2 className="text-[#663F00] mt-0">
              Strona w przygotowaniu
            </h2>
            <p className="text-[#663F00]/80 mb-0">
              Polityka prywatności jest obecnie przygotowywana przez nasz zespół prawny 
              i zostanie wkrótce opublikowana. Dokument będzie zawierał szczegółowe informacje 
              dotyczące przetwarzania danych osobowych zgodnie z RODO.
            </p>
          </div>

          <div className="space-y-6 text-[#663F00]/80">
            <section>
              <h2 className="text-[#663F00]">Administrator danych</h2>
              <p>
                Administratorem danych osobowych jest TS Finanse.
              </p>
              <ul>
                <li>Email kontaktowy: kontakt@tsfinanse.com</li>
                <li>NIP: [do uzupełnienia]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#663F00]">Zakres zbieranych danych</h2>
              <p>
                Zbieramy dane osobowe niezbędne do realizacji usługi finansowania:
              </p>
              <ul>
                <li>Dane identyfikacyjne (imię, nazwisko, nazwa firmy)</li>
                <li>Dane kontaktowe (email, telefon)</li>
                <li>Dane dotyczące wniosku o pożyczkę</li>
                <li>Dokumentacja finansowa i prawna</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#663F00]">Cel przetwarzania danych</h2>
              <p>Dane osobowe przetwarzane są w celu:</p>
              <ul>
                <li>Oceny zdolności kredytowej</li>
                <li>Przygotowania oferty finansowania</li>
                <li>Realizacji umowy pożyczki</li>
                <li>Kontaktu z klientem</li>
                <li>Wypełnienia obowiązków prawnych</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#663F00]">Prawa użytkownika</h2>
              <p>Zgodnie z RODO, przysługują Państwu następujące prawa:</p>
              <ul>
                <li>Prawo dostępu do danych</li>
                <li>Prawo do sprostowania danych</li>
                <li>Prawo do usunięcia danych</li>
                <li>Prawo do ograniczenia przetwarzania</li>
                <li>Prawo do przenoszenia danych</li>
                <li>Prawo do wniesienia sprzeciwu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#663F00]">Kontakt</h2>
              <p>
                W sprawie przetwarzania danych osobowych prosimy o kontakt:
              </p>
              <p>
                <strong>Email:</strong> kontakt@tsfinanse.com
              </p>
            </section>

            <div className="p-6 rounded-xl bg-[#663F00]/5 border border-[#663F00]/10 mt-8">
              <p className="text-sm text-[#663F00]/70 mb-0">
                <strong>Uwaga:</strong> Pełna wersja Polityki Prywatności zostanie opublikowana 
                przed rozpoczęciem zbierania danych osobowych przez formularz kontaktowy. 
                Dokument zostanie przygotowany przez prawnika specjalizującego się w ochronie danych osobowych.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

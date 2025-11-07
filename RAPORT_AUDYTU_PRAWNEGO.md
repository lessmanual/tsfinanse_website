# RAPORT AUDYTU ZGODNOŚCI PRAWNEJ
## Landing Page TS Finanse

**Data audytu:** 5 listopada 2025
**Audytor:** Ekspert ds. zgodności z RODO i prawem polskim
**Zakres audytu:** Zgodność z RODO, Ustawą o świadczeniu usług drogą elektroniczną, wymogami branży finansowej

---

## STRESZCZENIE WYKONAWCZE

Landing page TS Finanse znajduje się w **FAZIE PRZYGOTOWAWCZEJ** i wymaga pilnego uzupełnienia kluczowych dokumentów prawnych oraz elementów zgodności przed uruchomieniem. Strona świadczy usługi finansowe w Polsce, co oznacza obostrzony reżim prawny i szczególną odpowiedzialność za ochronę danych osobowych.

### STATUS ZGODNOŚCI: NIEKOMPLETNY - WYMAGA NATYCHMIASTOWEJ INTERWENCJI

**Ocena ryzyka prawnego:** WYSOKIE
**Priorytet działań:** KRYTYCZNY

---

## SZCZEGÓŁOWE WYNIKI AUDYTU

### 1. POLITYKA PRYWATNOŚCI (Art. 13/14 RODO)

**STATUS:** NIEKOMPLETNA - wymaga natychmiastowej uzupełnienia

**Znalezione elementy:**
- Plik: `/src/components/PrivacyPolicy.tsx`
- Status: Placeholder z komunikatem "Strona w przygotowaniu"
- Link w stopce: `/polityka-prywatnosci` (prowadzi do pustej strony)

**Istniejące elementy podstawowe:**
- Administrator danych: TS Finanse (nazwa firmy)
- Dane kontaktowe: kontakt@tsfinanse.com
- NIP: oznaczony jako "do uzupełnienia"
- Zakres zbieranych danych: opisany ogólnie
- Cel przetwarzania: wymieniony
- Prawa użytkownika: wymienione zgodnie z RODO

**BRAKUJĄCE ELEMENTY KRYTYCZNE:**

1. **Podstawa prawna przetwarzania (Art. 6 RODO)**
   - Brak wskazania konkretnej podstawy prawnej dla każdego celu przetwarzania
   - Wymagane: zgoda (Art. 6 ust. 1 lit. a), wykonanie umowy (lit. b), obowiązek prawny (lit. c)

2. **Okres przechowywania danych (Art. 13 ust. 2 lit. a RODO)**
   - Brak informacji o okresie przechowywania danych
   - Dla branży finansowej: wymagane minimum 5 lat zgodnie z Ustawą o rachunkowości

3. **Odbiorcy danych (Art. 13 ust. 1 lit. e RODO)**
   - Brak informacji o przekazywaniu danych podmiotom trzecim
   - Brak informacji o weryfikacji BIK/KRD (jeśli dotyczy)
   - Brak informacji o dostawcach usług IT

4. **Dane Inspektora Ochrony Danych (Art. 37-39 RODO)**
   - Brak informacji o IOD (jeśli wymagany)
   - Dla działalności finansowej IOD jest zalecany

5. **Informacja o prawie wniesienia skargi do UODO**
   - Brak informacji o prawie złożenia skargi do Prezesa Urzędu Ochrony Danych Osobowych
   - Kontakt do UODO: ul. Stawki 2, 00-193 Warszawa

6. **Zautomatyzowane podejmowanie decyzji (Art. 13 ust. 2 lit. f RODO)**
   - Brak informacji czy stosowane są automatyczne decyzje (scoring kredytowy)

7. **Wymóg podania danych**
   - Brak informacji czy podanie danych jest wymogiem umownym/ustawowym

**RYZYKO:** Naruszenie Art. 13 RODO - kara do 20 000 000 EUR lub 4% rocznego światowego obrotu

---

### 2. POLITYKA COOKIES

**STATUS:** BRAK - wymaga pilnego stworzenia

**Znalezione elementy:**
- BRAK pliku z polityką cookies
- BRAK bannera cookie consent
- BRAK mechanizmu zarządzania zgodami

**WYMAGANE ELEMENTY (zgodnie z Art. 173 Ustawy Prawo telekomunikacyjne):**

1. **Banner zgody na cookies**
   - Obowiązkowy przed zapisaniem jakichkolwiek cookies (poza technicznymi)
   - Musi zawierać jasną informację o przetwarzaniu
   - Musi umożliwiać odmowę zgody

2. **Polityka cookies - treść**
   - Definicja cookies
   - Rodzaje używanych cookies:
     - Niezbędne (techniczne) - nie wymagają zgody
     - Funkcjonalne
     - Analityczne (Google Analytics?)
     - Marketingowe (remarketingowe?)
   - Cel wykorzystania każdego typu
   - Okres przechowywania cookies
   - Sposób zarządzania cookies (wyłączanie w przeglądarce)
   - Narzędzia zewnętrzne (lista dostawców)

3. **Consent Management Platform (CMP)**
   - Rekomendacja: CookieBot, OneTrust, Iubenda, Usercentrics
   - Musi rejestrować zgody (proof of consent)
   - Musi być zgodne z interpretacją PUODO

**UWAGA KRYTYCZNA:** Według wyroku TSUE C-673/17 Planet49, zgoda musi być:
- Dobrowolna
- Konkretna
- Świadoma
- Jednoznaczna
- Przez wyraźne działanie potwierdzające
- Pre-checked checkboxy są NIELEGALNE

**RYZYKO:** Naruszenie Art. 173 Prawa telekomunikacyjnego - kara do 3% obrotu + kara UOKiK

---

### 3. REGULAMIN ŚWIADCZENIA USŁUG ELEKTRONICZNYCH

**STATUS:** BRAK - wymaga pilnego stworzenia

**Znalezione elementy:**
- BRAK pliku z regulaminem
- BRAK linku do regulaminu w stopce
- BRAK w nawigacji

**WYMAGANE ELEMENTY (Art. 8 Ustawy o świadczeniu usług drogą elektroniczną):**

1. **Informacje o usługodawcy (Art. 8 ust. 1)**
   - Pełna nazwa firmy: TS Finanse
   - Forma prawna (sp. z o.o., spółka cywilna, jednoosobowa działalność?)
   - Adres siedziby
   - NIP (obecnie: "do uzupełnienia")
   - REGON
   - Adres email: kontakt@tsfinanse.com
   - Numer telefonu (obecnie: "wkrótce dostępny")
   - Dane rejestrowe (KRS/CEIDG)

2. **Charakterystyka usługi**
   - Opis świadczonej usługi elektronicznej (formularz kontaktowy, weryfikacja wniosków online)
   - Zakres świadczonych usług
   - Warunki techniczne korzystania z serwisu
   - Wymogi techniczne (przeglądarki, JavaScript, cookies)

3. **Warunki świadczenia usług**
   - Zasady korzystania z formularza kontaktowego
   - Proces rozpatrywania wniosków
   - Odpowiedzialność stron
   - Reklamacje (tryb i termin)
   - Prawo odstąpienia (jeśli dotyczy)

4. **Ochrona własności intelektualnej**
   - Informacja o prawach autorskich do treści
   - Zakaz kopiowania treści bez zgody

5. **Odpowiedzialność**
   - Ograniczenia odpowiedzialności usługodawcy
   - Wymogi dla użytkownika (prawdziwość danych)

6. **Postanowienia końcowe**
   - Prawo właściwe (polskie)
   - Sąd właściwy
   - Tryb zmian regulaminu

**SPECYFIKA BRANŻY FINANSOWEJ:**
- Wyraźne zastrzeżenie: "TS Finanse nie jest instytucją bankową" (obecne w stopce - DOBRZE!)
- Informacja o ryzyku kredytowym
- Reprezentatywny przykład finansowania (zgodnie z Ustawą o kredycie konsumenckim - jeśli dotyczy)
- Ostrzeżenia o kosztach opóźnienia w spłacie

**RYZYKO:** Naruszenie Art. 8 ustawy o świadczeniu usług drogą elektroniczną - kara do 20 000 PLN

---

### 4. NIP FIRMY

**STATUS:** BRAK - do uzupełnienia natychmiast

**Znalezione elementy:**
- Footer.tsx (linia 66): "NIP: do uzupełnienia"
- PrivacyPolicy.tsx (linia 40): "NIP: [do uzupełnienia]"

**WYMÓG PRAWNY:**
Zgodnie z Art. 11 Ustawy o działalności gospodarczej oraz przepisami o VAT, każdy przedsiębiorca prowadzący działalność gospodarczą w Polsce MUSI publicznie podawać swój NIP na stronie internetowej.

**AKCJA WYMAGANA:**
- Uzupełnić prawdziwy NIP firmy TS Finanse w:
  - Stopce strony (Footer.tsx)
  - Polityce Prywatności (PrivacyPolicy.tsx)
  - Regulaminie (gdy powstanie)

**RYZYKO:** Naruszenie obowiązku informacyjnego - upomnienie UOKiK, w skrajnych przypadkach kara

---

### 5. DANE KONTAKTOWE

**STATUS:** NIEKOMPLETNE - wymaga uzupełnienia

**Znalezione elementy:**
- Email: kontakt@tsfinanse.com (DOBRZE!)
- Email partnerski: partnerzy@tsfinanse.com (DOBRZE!)
- Telefon: "wkrótce dostępny" (ŹLE!)
- Adres: "Obszar działania: Cała Polska" (NIEWYSTARCZAJĄCE!)

**WYMÓG PRAWNY (Art. 8 ustawy o świadczeniu usług drogą elektroniczną):**
Wymagane dane kontaktowe:
1. Adres siedziby firmy (ulica, numer, kod pocztowy, miejscowość)
2. Numer telefonu kontaktowego
3. Adres email (spełnione)

**AKCJA WYMAGANA:**
- Dodać pełny adres siedziby firmy
- Dodać numer telefonu (PILNE!)
- Rozważyć dodanie godzin dostępności telefonicznej (obecnie tylko godziny pracy ogólne)

**UWAGA:** Dla branży finansowej transparentność kontaktu buduje zaufanie

**RYZYKO:** Naruszenie obowiązku informacyjnego - upomnienie, potencjalna kara administracyjna

---

### 6. BANNER ZGODY NA COOKIES

**STATUS:** BRAK - krytycznie wymagany

**Znalezione elementy:**
- BRAK implementacji cookie banner
- BRAK mechanizmu zarządzania zgodami
- BRAK zapisu preferencji użytkownika

**ANALIZA TECHNICZNA:**
Sprawdzono wszystkie pliki komponentów - brak implementacji:
- Brak cookie banner component
- Brak integracji z CMP (Consent Management Platform)
- Brak localStorage/sessionStorage dla zgód

**WYMÓG PRAWNY:**
Zgodnie z Art. 173 Prawa telekomunikacyjnego i interpretacją PUODO, **PRZED** zapisaniem jakichkolwiek cookies (poza niezbędnymi technicznie) użytkownik MUSI:
1. Otrzymać jasną informację o cookies
2. Móc wyrazić zgodę lub odmówić
3. Móc łatwo wycofać zgodę

**REKOMENDOWANE ROZWIĄZANIE:**
Implementacja jednego z rozwiązań:
1. **CookieBot** (polecane dla polskiego rynku)
2. **OneTrust** (enterprise solution)
3. **Iubenda** (popularne w EU)
4. **Usercentrics** (deutsche Lösung, popularne w PL)
5. **Custom implementation** z biblioteką React (tylko jeśli zasoby dev)

**MINIMALNE WYMAGANIA DLA BANNERA:**
- Wyświetlenie przy pierwszej wizycie
- Jasna informacja co jest zapisywane
- Przyciski: "Akceptuję wszystkie" / "Ustawienia" / "Odrzuć wszystkie"
- Panel ustawień z kategoriami cookies
- Link do pełnej Polityki Cookies
- Możliwość późniejszej zmiany ustawień (floating button)

**PRZYKŁAD KATEGORII:**
1. Niezbędne (zawsze aktywne, bez zgody)
2. Funkcjonalne (wymagają zgody)
3. Analityczne/Wydajnościowe (wymagają zgody)
4. Marketingowe/Remarketingowe (wymagają zgody)

**RYZYKO:** Wysoki priorytet - strona może być uznana za niezgodną z prawem przy pierwszym wejściu użytkownika

---

### 7. KLAUZULE INFORMACYJNE PRZY FORMULARZACH

**STATUS:** BRAK - wymaga pilnej implementacji

**Znalezione elementy:**
- ContactForm.tsx: Placeholder formularza n8n (nie zaimplementowany)
- Linia 120: Lista planowanych pól, w tym "Zgoda RODO"
- BRAK rzeczywistego formularza
- BRAK checkboxów zgód

**WYMÓG PRAWNY (Art. 13 RODO):**
Przy KAŻDYM formularzu zbierającym dane osobowe MUSI być widoczna klauzula informacyjna zawierająca:
1. Administrator danych (TS Finanse)
2. Cel przetwarzania (ocena wniosku o pożyczkę)
3. Podstawa prawna (zgoda - Art. 6 ust. 1 lit. a)
4. Odbiorcy danych (jeśli będą przekazywane)
5. Okres przechowywania
6. Prawa osoby (dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw)
7. Prawo cofnięcia zgody
8. Prawo wniesienia skargi do UODO
9. Informacja czy podanie danych jest dobrowolne czy obowiązkowe

**MINIMALNA KLAUZULA (przykład):**
```
Administrator: TS Finanse, NIP: [___], email: kontakt@tsfinanse.com
Cel: Rozpatrzenie wniosku o finansowanie
Podstawa prawna: Zgoda (Art. 6 ust. 1 lit. a RODO)
Odbiorcy: Pracownicy TS Finanse, dostawcy IT [lista]
Okres: 5 lat od zakończenia współpracy
Prawa: Dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw
Cofnięcie zgody: Możliwe w każdej chwili na kontakt@tsfinanse.com
Skarga: Prawo wniesienia skargi do UODO (www.uodo.gov.pl)
```

**WYMAGANE CHECKBOXY:**
1. **Zgoda RODO (obowiązkowa)**
   - "Wyrażam zgodę na przetwarzanie moich danych osobowych przez TS Finanse w celu rozpatrzenia wniosku o finansowanie"
   - MUSI być niezaznaczony domyślnie (unchecked)
   - Pole required

2. **Marketing (opcjonalna)**
   - "Wyrażam zgodę na otrzymywanie informacji handlowych od TS Finanse"
   - Niezaznaczony domyślnie
   - Pole optional

3. **Kontakt telefoniczny (opcjonalna - jeśli dotyczy)**
   - Osobna zgoda na kontakt telefoniczny (zgodnie z Ustawą o prawach konsumenta)

**BŁĘDY DO UNIKNIĘCIA:**
- Pre-checked checkboxy (NIELEGALNE!)
- Zbiorowa zgoda na wszystko (niezgodne z RODO)
- Brak możliwości wysłania formularza bez zgód marketingowych (wymuszenie)
- Brak linku do Polityki Prywatności przy checkboxie

**IMPLEMENTACJA TECHNICZNA:**
```typescript
<div className="space-y-3">
  <label className="flex items-start gap-3">
    <input
      type="checkbox"
      required
      checked={gdprConsent}
      onChange={(e) => setGdprConsent(e.target.checked)}
    />
    <span className="text-sm">
      Wyrażam zgodę na przetwarzanie moich danych osobowych przez TS Finanse
      w celu rozpatrzenia wniosku o finansowanie. *
      <a href="/polityka-prywatnosci" className="underline">
        Polityka Prywatności
      </a>
    </span>
  </label>

  <label className="flex items-start gap-3">
    <input
      type="checkbox"
      checked={marketingConsent}
      onChange={(e) => setMarketingConsent(e.target.checked)}
    />
    <span className="text-sm">
      Wyrażam zgodę na otrzymywanie informacji handlowych od TS Finanse (opcjonalne)
    </span>
  </label>
</div>

<p className="text-xs text-gray-600">
  * Pola obowiązkowe. Podanie danych jest dobrowolne, ale niezbędne do rozpatrzenia wniosku.
  Administrator: TS Finanse, NIP: [___], kontakt: kontakt@tsfinanse.com
  Przysługują Państwu prawa: dostępu, sprostowania, usunięcia, ograniczenia,
  przenoszenia danych oraz wniesienia skargi do UODO.
</p>
```

**RYZYKO:** Wysoki - zbieranie danych bez właściwej klauzuli to bezpośrednie naruszenie RODO

---

### 8. INFORMACJE O ADMINISTRATORZE DANYCH OSOBOWYCH

**STATUS:** NIEKOMPLETNE - wymaga uzupełnienia

**Znalezione elementy:**
- PrivacyPolicy.tsx: "Administratorem danych osobowych jest TS Finanse"
- Email: kontakt@tsfinanse.com
- NIP: "do uzupełnienia"

**WYMÓG PRAWNY (Art. 13 ust. 1 lit. a RODO):**
Pełne dane administratora:
1. Nazwa: TS Finanse
2. Forma prawna (sp. z o.o., JDG, etc.)
3. Adres siedziby (pełny)
4. NIP, REGON, KRS
5. Email kontaktowy
6. Telefon

**DODATKOWE WYMAGANIA:**
- Jeśli jest Inspektor Ochrony Danych: jego dane kontaktowe
- Jeśli jest współadministrator: dane współadministratora

**REKOMENDACJA:**
Dla branży finansowej zaleca się powołanie Inspektora Ochrony Danych (IOD), nawet jeśli nie jest to bezwzględnie wymagane. Dodaje to wiarygodności i pokazuje zaangażowanie w ochronę danych.

**Format w Polityce Prywatności:**
```
Administrator Danych Osobowych:
TS Finanse [forma prawna]
ul. [adres], [kod] [miasto]
NIP: [___]
REGON: [___]
KRS: [___] (jeśli dotyczy)
Email: kontakt@tsfinanse.com
Telefon: [___]

Inspektor Ochrony Danych: iod@tsfinanse.com (jeśli dotyczy)
```

**AKCJA WYMAGANA:**
- Uzupełnić pełne dane firmy
- Rozważyć powołanie IOD

---

### 9. PRAWA OSÓB, KTÓRYCH DANE DOTYCZĄ

**STATUS:** NIEPEŁNE - wymaga rozwinięcia

**Znalezione elementy:**
- PrivacyPolicy.tsx (linie 70-79): Lista praw zgodnie z RODO
  - Prawo dostępu
  - Prawo do sprostowania
  - Prawo do usunięcia
  - Prawo do ograniczenia przetwarzania
  - Prawo do przenoszenia danych
  - Prawo do wniesienia sprzeciwu

**BRAKUJĄCE ELEMENTY:**

1. **Procedury realizacji praw**
   - Brak informacji JAK zrealizować każde prawo
   - Brak formularzy do pobrania
   - Brak procedury weryfikacji tożsamości

2. **Termin realizacji**
   - WYMÓG: 1 miesiąc od otrzymania żądania (Art. 12 ust. 3 RODO)
   - Możliwość przedłużenia o 2 miesiące (z uzasadnieniem)

3. **Prawo cofnięcia zgody**
   - KRYTYCZNE: Brak wyraźnej informacji o prawie cofnięcia zgody
   - Musi być równie łatwe jak jej udzielenie

4. **Prawo wniesienia skargi do UODO**
   - Brak pełnych danych kontaktowych UODO:
     - Urząd Ochrony Danych Osobowych
     - ul. Stawki 2, 00-193 Warszawa
     - Telefon: +48 22 531 03 00
     - Email: kancelaria@uodo.gov.pl
     - www.uodo.gov.pl

5. **Ograniczenia praw**
   - Brak informacji o możliwych ograniczeniach (np. obowiązek archiwizacyjny przez 5 lat)

**REKOMENDOWANA TREŚĆ:**
```
JAK SKORZYSTAĆ Z SWOICH PRAW?

Aby skorzystać z przysługujących Państwu praw, prosimy o kontakt:
- Email: kontakt@tsfinanse.com (preferowany)
- Pisemnie: TS Finanse, [adres siedziby]

Odpowiemy w ciągu 1 miesiąca od otrzymania żądania.

W celu weryfikacji tożsamości możemy poprosić o:
- Skan dowodu osobistego (z zakrytym numerem PESEL)
- Potwierdzenie adresu email

COFNIĘCIE ZGODY:
Zgodę można cofnąć w każdej chwili wysyłając email na kontakt@tsfinanse.com
z tematem "Cofnięcie zgody RODO". Cofnięcie zgody nie wpływa na zgodność
z prawem przetwarzania dokonanego przed jej cofnięciem.

SKARGA DO ORGANU NADZORCZEGO:
Przysługuje Państwu prawo wniesienia skargi do:
Urząd Ochrony Danych Osobowych
ul. Stawki 2, 00-193 Warszawa
kancelaria@uodo.gov.pl
www.uodo.gov.pl
```

**RYZYKO:** Średnie - brak jasnych procedur może skutkować skargami do UODO

---

### 10. SPECYFICZNE WYMOGI DLA BRANŻY FINANSOWEJ W POLSCE

**STATUS:** CZĘŚCIOWO SPEŁNIONE - wymaga rozbudowy

**ANALIZA SPECYFIKI FINANSOWEJ:**

#### A. USTAWA O KREDYCIE KONSUMENCKIM (jeśli dotyczy)

**WYMÓG:** Jeśli pożyczki są dla konsumentów (nie tylko firm), stosuje się Ustawa o kredycie konsumenckim

**WERYFIKACJA:**
Strona wskazuje: "Dla przedsiębiorców" - sugeruje B2B, więc prawdopodobnie NIE dotyczy

**JEŚLI DOTYCZYŁABY KONSUMENTÓW, WYMAGANE:**
1. Reprezentatywny przykład
2. RRSO (Rzeczywista Roczna Stopa Oprocentowania)
3. Całkowita kwota kredytu
4. Całkowita kwota do zapłaty
5. Czas trwania umowy
6. Ostrzeżenie: "Niespłacenie kredytu w terminie może skutkować..."

**OBECNY STATUS:**
- Hero.tsx: "15% rocznie" - brak RRSO
- Brak reprezentatywnego przykładu
- Brak ostrzeżeń o kosztach opóźnienia

**REKOMENDACJA:**
Jeśli firma planuje udzielać pożyczek także konsumentom, konieczne dodanie:
```
REPREZENTATYWNY PRZYKŁAD:
Kwota pożyczki: 1 000 000 PLN
Okres: 12 miesięcy
Oprocentowanie nominalne: 15% rocznie
RRSO: [obliczone]
Całkowita kwota do zapłaty: [___] PLN
Rata miesięczna: [___] PLN

Ostrzeżenie: Niespłacenie pożyczki w terminie skutkuje dodatkowymi kosztami
i może prowadzić do egzekucji zabezpieczenia hipotecznego.
```

#### B. USTAWA O PRZECIWDZIAŁANIU PRANIU PIENIĘDZY (AML)

**WYMÓG:** Firmy udzielające pożyczek mogą podlegać obowiązkom AML

**WYMAGANE ELEMENTY:**
1. Polityka AML/KYC (Know Your Customer)
2. Weryfikacja tożsamości klienta
3. Identyfikacja beneficjenta rzeczywistego
4. Monitorowanie transakcji
5. Raportowanie podejrzanych transakcji do GIIF

**OBECNY STATUS:**
- Brak wzmianki o procedurach AML
- Brak informacji o weryfikacji tożsamości

**REKOMENDACJA:**
Dodać w Regulaminie sekcję:
```
WERYFIKACJA KLIENTA (KYC/AML)

Zgodnie z Ustawą o przeciwdziałaniu praniu pieniędzy, przed udzieleniem
finansowania jesteśmy zobowiązani do:
1. Weryfikacji tożsamości klienta
2. Identyfikacji beneficjenta rzeczywistego
3. Określenia celu i charakteru transakcji
4. Przeprowadzenia analizy ryzyka

Klient zobowiązany jest dostarczyć:
- Dokument tożsamości
- Dokumenty rejestrowe firmy (KRS/CEIDG)
- PIT/CIT za ostatnie 2 lata
- Wyciągi bankowe
- Dokumentację własności nieruchomości
```

#### C. REJESTR OGRANICZEŃ (BIK, KRD, ERIF)

**OBECNY STATUS:**
- Brak informacji o sprawdzaniu w bazach dłużników

**REKOMENDACJA:**
Dodać w Polityce Prywatności:
```
WERYFIKACJA ZDOLNOŚCI KREDYTOWEJ

W celu oceny ryzyka kredytowego możemy sprawdzić Państwa dane w:
- Biurze Informacji Kredytowej (BIK)
- Krajowym Rejestrze Długów (KRD)
- Rejestrze Dłużników ERIF

Podstawa prawna: uzasadniony interes administratora (Art. 6 ust. 1 lit. f RODO)

W przypadku niespłacenia zobowiązania, Państwa dane mogą zostać
przekazane do wyżej wymienionych rejestrów.
```

#### D. USTAWA O USŁUGACH PŁATNICZYCH

**WYMÓG:** Jeśli obsługa płatności online

**OBECNY STATUS:**
- Brak wzmianki o płatnościach online
- Prawdopodobnie obsługa płatności przez bank - nie dotyczy bezpośrednio

#### E. UBEZPIECZENIE ODPOWIEDZIALNOŚCI CYWILNEJ

**REKOMENDACJA:**
Dla branży finansowej zalecane informowanie o posiadanym ubezpieczeniu OC

**DODAĆ W REGULAMINIE:**
```
UBEZPIECZENIE

TS Finanse posiada ubezpieczenie odpowiedzialności cywilnej w zakresie
prowadzonej działalności finansowej.

Towarzystwo ubezpieczeniowe: [nazwa]
Suma ubezpieczenia: [kwota]
Okres: [daty]
```

#### F. HIPOTEKA - SPECYFIKA PRAWNA

**OBECNY STATUS:**
- Główna usługa: pożyczki pod zabezpieczenie hipoteczne
- Brak szczegółowych informacji o procesie hipoteki

**WYMAGANE INFORMACJE:**
1. Koszty ustanowienia hipoteki (notariusz, wpis do KW)
2. Zakres odpowiedzialności (do jakiej kwoty)
3. Procedura egzekucji (w przypadku niespłacenia)
4. Rodzaj hipoteki (zwykła, kaucyjna, przymusowa)

**DODAĆ W FAQ LUB WARUNKACH:**
```
HIPOTEKA - NAJWAŻNIEJSZE INFORMACJE

Rodzaj hipoteki: Hipoteka kaucyjna
Kwota hipoteki: 120% kwoty pożyczki (zabezpieczenie + odsetki + koszty)

Koszty ustanowienia hipoteki:
- Taksa notarialna: ~1-2% wartości hipoteki
- Wpis do księgi wieczystej: ~300-500 PLN
- Opłaty ponosi: Kredytobiorca

Wymagania dotyczące nieruchomości:
- Własność lub użytkowanie wieczyste
- Wolna od obciążeń lub z zgodą dotychczasowego wierzyciela
- Wartość rynkowa minimum 150% kwoty pożyczki
- Wycena przez rzeczoznawcę majątkowego (koszt po stronie kredytobiorcy)

W przypadku niespłacenia zobowiązania:
TS Finanse ma prawo do egzekucji z nieruchomości zgodnie z przepisami
Kodeksu postępowania cywilnego (licytacja sądowa).
```

#### G. DISCLAIMER O RYZYKU

**OBECNY STATUS:**
- Footer.tsx (linia 108): "TS Finanse nie jest instytucją bankową. Wszystkie oferty finansowania są indywidualne..." (DOBRZE!)

**REKOMENDACJA:**
Rozbudować disclaimer o:
```
WAŻNE INFORMACJE

⚠️ TS Finanse nie jest bankiem ani instytucją kredytową podlegającą nadzorowi KNF
⚠️ Pożyczki udzielane są z kapitału własnego
⚠️ Każda oferta wymaga indywidualnej analizy i akceptacji
⚠️ Udostępnienie finansowania nie jest gwarantowane
⚠️ Niespłacenie zobowiązania może prowadzić do utraty zabezpieczenia
⚠️ Przed podpisaniem umowy zalecamy konsultację z prawnikiem

Finansowanie to nie jest oferta w rozumieniu Kodeksu Cywilnego, lecz zaproszenie
do negocjacji. Ostateczne warunki ustalane są indywidualnie.
```

---

## PODSUMOWANIE BRAKÓW - CHECKLIST

### DOKUMENTY DO STWORZENIA (PRIORYTET KRYTYCZNY)

- [ ] **Pełna Polityka Prywatności** (zgodna z Art. 13/14 RODO)
  - Lokalizacja: `/src/components/PrivacyPolicy.tsx` (do przebudowy)
  - Format: Pełny dokument prawny z wszystkimi wymaganymi elementami
  - Termin: PRZED uruchomieniem strony

- [ ] **Polityka Cookies**
  - Lokalizacja: Nowy plik `/src/components/CookiePolicy.tsx`
  - Format: Szczegółowy opis wszystkich używanych cookies
  - Termin: PRZED uruchomieniem strony

- [ ] **Regulamin Świadczenia Usług Drogą Elektroniczną**
  - Lokalizacja: Nowy plik `/src/components/TermsOfService.tsx`
  - Format: Pełny regulamin zgodny z Art. 8 ustawy o świadczeniu usług drogą elektroniczną
  - Termin: PRZED uruchomieniem strony

- [ ] **Warunki Finansowania / Ogólne Warunki Umowy (OWU)**
  - Lokalizacja: Nowy plik `/src/components/LoanTerms.tsx` lub PDF do pobrania
  - Format: Szczegółowe warunki udzielania pożyczek
  - Termin: PRZED rozpoczęciem przyjmowania wniosków

### ELEMENTY TECHNICZNE DO ZAIMPLEMENTOWANIA

- [ ] **Cookie Consent Banner**
  - Lokalizacja: Nowy komponent `/src/components/CookieBanner.tsx`
  - Technologia: CookieBot / OneTrust / Iubenda lub custom
  - Funkcje: Akceptacja, odrzucenie, ustawienia, zarządzanie zgodami
  - Termin: PRZED uruchomieniem strony

- [ ] **Formularz kontaktowy z klauzulami RODO**
  - Lokalizacja: `/src/components/ContactForm.tsx` (obecnie placeholder)
  - Elementy:
    - Checkbox zgody RODO (required, unchecked domyślnie)
    - Checkbox zgody marketingowej (optional, unchecked domyślnie)
    - Klauzula informacyjna pod formularzem
    - Link do Polityki Prywatności
    - Walidacja pól
    - Zabezpieczenie przed SPAM (reCAPTCHA?)
  - Termin: PRZED uruchomieniem strony

- [ ] **System rejestracji zgód (Consent Management)**
  - Wymóg: Zapisywanie informacji o zgodach w bazie danych
  - Dane do rejestracji:
    - Timestamp zgody
    - IP użytkownika
    - User Agent
    - Treść zgody (wersja dokumentu)
    - Typ zgody (RODO, marketing, cookies)
  - Okres przechowywania: Minimum 5 lat
  - Termin: PRZED uruchomieniem formularza

### DANE DO UZUPEŁNIENIA

- [ ] **NIP firmy**
  - Lokalizacje do uzupełnienia:
    - `/src/components/Footer.tsx` (linia 66)
    - `/src/components/PrivacyPolicy.tsx` (linia 40)
    - Wszystkie nowe dokumenty prawne
  - Termin: NATYCHMIAST

- [ ] **Pełne dane firmy**
  - Wymagane:
    - Pełna nazwa i forma prawna
    - Adres siedziby (ulica, nr, kod, miasto)
    - NIP, REGON, KRS (jeśli dotyczy)
    - Numer telefonu kontaktowego
  - Lokalizacje: Footer, Polityka Prywatności, Regulamin
  - Termin: PRZED uruchomieniem strony

- [ ] **Dane Inspektora Ochrony Danych** (jeśli dotyczy)
  - Email: iod@tsfinanse.com
  - Telefon
  - Termin: Rozważyć przed uruchomieniem

### ROUTING I NAWIGACJA

- [ ] **Dodać routy do dokumentów prawnych**
  - `/polityka-prywatnosci` (istnieje, ale niepełna)
  - `/polityka-cookies` (do stworzenia)
  - `/regulamin` (do stworzenia)
  - `/warunki-finansowania` (do stworzenia)
  - `/rodo` (link istnieje w Footer, strony brak)

- [ ] **Aktualizacja Footer.tsx**
  - Dodać wszystkie linki do dokumentów prawnych
  - Pełne dane firmy (NIP, adres, telefon)
  - Link do ustawień cookies

- [ ] **Aktualizacja Navigation.tsx** (opcjonalnie)
  - Rozważyć dodanie linku "Dokumenty prawne" w menu

### SEO I METADATA

- [ ] **Aktualizacja meta tagów**
  - Lokalizacja: `/index.html` i `/src/App.tsx`
  - Dodać:
    - Informacja o NIP w Schema.org
    - Adres firmy w Schema.org
    - Telefon w Schema.org
  - Termin: Przed uruchomieniem

---

## OCENA RYZYKA PRAWNEGO

### WYSOKI PRIORYTET (Kary finansowe + odpowiedzialność karna)

1. **Brak pełnej Polityki Prywatności**
   - KARA: do 20 mln EUR lub 4% obrotu (Art. 83 RODO)
   - ORGAN: UODO (Urząd Ochrony Danych Osobowych)

2. **Brak Cookie Consent Banner**
   - KARA: do 3% obrotu (Art. 209 Prawa telekomunikacyjnego)
   - ORGAN: Prezes UKE + UOKiK

3. **Zbieranie danych bez klauzuli informacyjnej**
   - KARA: do 20 mln EUR lub 4% obrotu
   - ORGAN: UODO

4. **Brak NIP na stronie**
   - KARA: Upomnienie, w skrajnych przypadkach kara administracyjna
   - ORGAN: UOKiK

### ŚREDNI PRIORYTET (Upomnienia + kary administracyjne)

5. **Brak Regulaminu świadczenia usług**
   - KARA: do 20 000 PLN (Art. 22 ustawy o świadczeniu usług drogą elektroniczną)
   - ORGAN: Inspekcja Handlowa

6. **Niepełne dane kontaktowe**
   - KARA: Upomnienie UOKiK
   - ORGAN: UOKiK

7. **Brak procedur realizacji praw RODO**
   - KARA: Możliwe skargi do UODO
   - ORGAN: UODO

### NISKI PRIORYTET (Rekomendacje best practice)

8. **Brak reprezentatywnego przykładu** (jeśli dotyczy B2C)
9. **Brak informacji o AML/KYC**
10. **Brak rozbudowanego disclaimera o ryzyku**

---

## REKOMENDACJE DZIAŁAŃ

### FAZA 1: NATYCHMIASTOWA (przed uruchomieniem strony)

**Termin: 0-7 dni**

1. Uzupełnić NIP firmy we wszystkich lokalizacjach
2. Uzupełnić pełne dane kontaktowe (adres, telefon)
3. Stworzyć pełną Politykę Prywatności (zlecić prawnikowi specjalizującemu się w RODO)
4. Stworzyć Politykę Cookies
5. Stworzyć Regulamin świadczenia usług drogą elektroniczną
6. Zaimplementować Cookie Consent Banner
7. Dodać routy do wszystkich dokumentów prawnych
8. Zaktualizować Footer z pełnymi danymi

**Koszt zewnętrzny:** 3 000 - 8 000 PLN (prawnik + CMP subscription)

### FAZA 2: PRZED URUCHOMIENIEM FORMULARZA

**Termin: 7-14 dni**

9. Zaimplementować formularz kontaktowy n8n
10. Dodać checkboxy zgód z właściwą walidacją
11. Dodać klauzulę informacyjną RODO pod formularzem
12. Zaimplementować system rejestracji zgód (baza danych)
13. Przetestować cały flow użytkownika (cookie banner → formularz → zgody)
14. Przeprowadzić audit wewnętrzny zgodności

**Koszt zewnętrzny:** 0 - 2 000 PLN (jeśli wymaga zewnętrznego backend dla rejestracji zgód)

### FAZA 3: OPTYMALIZACJA (1-3 miesiące po uruchomieniu)

15. Stworzyć Warunki Finansowania / OWU (zlecić prawnikowi specjalizującemu się w prawie finansowym)
16. Rozważyć powołanie Inspektora Ochrony Danych
17. Wdrożyć procedury AML/KYC
18. Stworzyć wewnętrzną dokumentację procesów RODO
19. Przeszkolić pracowników z RODO i ochrony danych
20. Wdrożyć politykę bezpieczeństwa informacji (ISO 27001 style)
21. Periodic review dokumentów prawnych (co 6-12 miesięcy)

**Koszt zewnętrzny:** 5 000 - 15 000 PLN (OWU + szkolenia + audyt)

---

## DOSTAWCY REKOMENDOWANI

### Consent Management Platforms (CMP)

1. **CookieBot** (www.cookiebot.com)
   - Cena: ~600-1200 PLN/rok
   - Plusy: Automatyczne skanowanie cookies, polskie UI, PUODO-compliant

2. **OneTrust** (www.onetrust.com)
   - Cena: ~5000+ PLN/rok (enterprise)
   - Plusy: Pełne compliance suite, dla większych firm

3. **Iubenda** (www.iubenda.com)
   - Cena: ~300-800 PLN/rok
   - Plusy: Prosty setup, popularne w EU

### Prawnicy Specjalizujący się w RODO

- Rekomendacja: Szukać prawników z certyfikatem IAPP (International Association of Privacy Professionals)
- Sprawdzić portfolio: doświadczenie w branży finansowej

### Usługi Audytorskie

- **TÜV Rheinland Polska** - audyt zgodności RODO
- **PwC / Deloitte / EY** - compliance dla firm finansowych

---

## TEMPLATE DOKUMENTÓW (do przekazania prawnikowi)

### Struktura Polityki Prywatności

```
POLITYKA PRYWATNOŚCI TS FINANSE

I. POSTANOWIENIA OGÓLNE
1. Administrator danych (pełne dane firmy)
2. Inspektor Ochrony Danych (jeśli dotyczy)
3. Definicje

II. ZAKRES ZBIERANYCH DANYCH
1. Dane identyfikacyjne
2. Dane kontaktowe
3. Dane finansowe
4. Dane z cookies i analityki

III. CEL I PODSTAWA PRAWNA PRZETWARZANIA
1. Rozpatrzenie wniosku (zgoda)
2. Wykonanie umowy (Art. 6.1.b)
3. Obowiązek prawny (Art. 6.1.c)
4. Marketing (zgoda)

IV. ODBIORCY DANYCH
1. Pracownicy TS Finanse
2. Dostawcy IT (lista)
3. Biura informacji gospodarczej (BIK, KRD)
4. Notariusze (hipoteka)
5. Organy państwowe (na żądanie)

V. OKRES PRZECHOWYWANIA
1. Dokumentacja finansowa: 5 lat (Ustawa o rachunkowości)
2. Umowy kredytowe: 10 lat (przedawnienie)
3. Marketing: do cofnięcia zgody
4. Logi systemowe: 12 miesięcy

VI. PRAWA OSÓB
1. Dostęp do danych
2. Sprostowanie danych
3. Usunięcie danych (z ograniczeniami)
4. Ograniczenie przetwarzania
5. Przenoszenie danych
6. Sprzeciw wobec przetwarzania
7. Cofnięcie zgody
8. Skarga do UODO

VII. PROCEDURY REALIZACJI PRAW
1. Jak złożyć wniosek
2. Weryfikacja tożsamości
3. Termin odpowiedzi (1 miesiąc)
4. Opłaty (brak, chyba że żądanie nieuzasadnione)

VIII. BEZPIECZEŃSTWO DANYCH
1. Środki techniczne (szyfrowanie, firewall)
2. Środki organizacyjne (szkolenia, polityki)
3. Incident response plan

IX. COOKIES I TECHNOLOGIE ŚLEDZĄCE
1. Odesłanie do Polityki Cookies
2. Jak zarządzać cookies

X. ZMIANY POLITYKI
1. Jak informujemy o zmianach
2. Historia wersji

XI. KONTAKT
1. Email
2. Adres korespondencyjny
3. IOD (jeśli dotyczy)
```

### Struktura Polityki Cookies

```
POLITYKA COOKIES TS FINANSE

I. CO TO SĄ COOKIES?
1. Definicja
2. Jak działają

II. JAKIE COOKIES UŻYWAMY?

1. COOKIES NIEZBĘDNE (nie wymagają zgody)
   - Sesja użytkownika
   - Bezpieczeństwo (CSRF)
   - Load balancing

2. COOKIES FUNKCJONALNE (wymagają zgody)
   - Preferencje językowe
   - Zapamiętanie zgód

3. COOKIES ANALITYCZNE (wymagają zgody)
   - Google Analytics (lista parametrów)
   - Czas przechowywania: 24 miesiące
   - Cel: Analiza ruchu, optymalizacja UX

4. COOKIES MARKETINGOWE (wymagają zgody)
   - Facebook Pixel (jeśli używane)
   - Google Ads (jeśli używane)
   - Remarketingowe

III. SZCZEGÓŁOWA TABELA COOKIES
| Nazwa | Dostawca | Cel | Wygaśnięcie | Typ |
|-------|----------|-----|-------------|-----|
| _ga   | Google   | Analityka | 24 miesiące | Analityczne |
| ...   | ...      | ...  | ...         | ...         |

IV. JAK ZARZĄDZAĆ COOKIES?
1. Ustawienia w przeglądarce (instrukcje dla każdej)
2. Panel ustawień na stronie
3. Cofnięcie zgody

V. COOKIES STRON TRZECICH
1. Lista zewnętrznych dostawców
2. Linki do ich polityk prywatności

VI. ZMIANY W POLITYCE
1. Data ostatniej aktualizacji
2. Historia zmian

VII. KONTAKT
```

### Struktura Regulaminu

```
REGULAMIN ŚWIADCZENIA USŁUG DROGĄ ELEKTRONICZNĄ
TS FINANSE

I. POSTANOWIENIA OGÓLNE
1. Definicje
2. Zakres regulaminu
3. Dane usługodawcy (pełne dane firmy)

II. RODZAJE USŁUG ELEKTRONICZNYCH
1. Formularz kontaktowy
2. Newsletter (jeśli dotyczy)
3. Panel klienta (jeśli będzie)

III. WARUNKI TECHNICZNE
1. Wymagania sprzętowe
2. Wymagania oprogramowania
3. Wymagane przeglądarki
4. JavaScript, cookies (wymagane)

IV. ZASADY KORZYSTANIA Z FORMULARZA KONTAKTOWEGO
1. Cel: złożenie wniosku o finansowanie
2. Obowiązek podania prawdziwych danych
3. Zakaz nadużyć (spam, ataki)
4. Czas rozpatrzenia wniosku: do 3 dni roboczych

V. OCHRONA DANYCH OSOBOWYCH
1. Odesłanie do Polityki Prywatności
2. Administrator danych
3. Zgoda RODO

VI. ODPOWIEDZIALNOŚĆ
1. Odpowiedzialność usługodawcy (ograniczenia)
2. Odpowiedzialność użytkownika
3. Force majeure

VII. REKLAMACJE
1. Jak złożyć reklamację
2. Termin rozpatrzenia: 14 dni
3. Odpowiedź na reklamację

VIII. POZASĄDOWE SPOSOBY ROZWIĄZYWANIA SPORÓW
1. Mediacja
2. Arbiter bankowy (jeśli dotyczy)
3. Rzecznik Finansowy

IX. WŁASNOŚĆ INTELEKTUALNA
1. Prawa autorskie do treści
2. Zakaz kopiowania
3. Licencje (jeśli używane fonty, obrazy)

X. POSTANOWIENIA KOŃCOWE
1. Prawo właściwe: prawo polskie
2. Sąd właściwy: sąd siedziby TS Finanse
3. Zmiany regulaminu
4. Data wejścia w życie
```

---

## PRZYKŁADOWE WERSJE KLAUZUL INFORMACYJNYCH

### KLAUZULA POD FORMULARZEM (SHORT VERSION)

```
Administratorem danych osobowych jest TS Finanse, NIP: [___],
ul. [adres], email: kontakt@tsfinanse.com.

Dane przetwarzane są w celu rozpatrzenia wniosku o finansowanie
(podstawa: zgoda - Art. 6 ust. 1 lit. a RODO).

Przysługują Państwu prawa: dostępu, sprostowania, usunięcia,
ograniczenia, przenoszenia danych oraz wniesienia skargi do UODO.

Więcej informacji: Polityka Prywatności
```

### CHECKBOX ZGODY RODO (PEŁNA WERSJA)

```
☐ Oświadczam, że zapoznałem/am się z Polityką Prywatności
i wyrażam zgodę na przetwarzanie moich danych osobowych przez
TS Finanse, NIP: [___], w celu rozpatrzenia wniosku o finansowanie
hipoteczne. Przyjmuję do wiadomości, że mam prawo do cofnięcia
zgody w dowolnym momencie. * (pole obowiązkowe)
```

### CHECKBOX ZGODY MARKETINGOWEJ

```
☐ Wyrażam zgodę na otrzymywanie od TS Finanse informacji handlowych
dotyczących ofert finansowych drogą elektroniczną (email) oraz
telefoniczną. Zgoda jest dobrowolna i mogę ją cofnąć w każdej chwili.
```

---

## HARMONOGRAM WDROŻENIA (REKOMENDOWANY)

### TYDZIEŃ 1: PRZYGOTOWANIE DOKUMENTÓW

**Dzień 1-2:**
- Zebranie pełnych danych firmy (NIP, REGON, KRS, adres, telefon)
- Briefing dla prawnika (przekazanie tego raportu)
- Wybór Consent Management Platform (CookieBot rekomendowane)

**Dzień 3-5:**
- Prawnik przygotowuje drafty:
  - Polityka Prywatności
  - Polityka Cookies
  - Regulamin
- Równolegle: Dev zakłada konto CMP (CookieBot)

**Dzień 6-7:**
- Review dokumentów prawnych
- Poprawki i finalizacja
- Przygotowanie treści do implementacji

### TYDZIEŃ 2: IMPLEMENTACJA TECHNICZNA

**Dzień 8-10:**
- Integracja Cookie Consent Banner (CookieBot)
- Tworzenie nowych komponentów:
  - `PrivacyPolicy.tsx` (pełna wersja)
  - `CookiePolicy.tsx` (nowy)
  - `TermsOfService.tsx` (nowy)
  - `CookieBanner.tsx` (integracja CookieBot)
- Aktualizacja istniejących:
  - `Footer.tsx` (pełne dane, linki)
  - `App.tsx` (routing)

**Dzień 11-12:**
- Implementacja formularza kontaktowego:
  - Checkboxy zgód
  - Walidacja
  - Klauzule RODO
- Setup backend dla rejestracji zgód (jeśli n8n nie obsługuje)

**Dzień 13-14:**
- Testy:
  - Flow użytkownika (cookie banner → browsing → formularz)
  - Walidacja zgód
  - Responsive design
  - Cross-browser testing
- Code review

### TYDZIEŃ 3: TESTY I URUCHOMIENIE

**Dzień 15-17:**
- User Acceptance Testing (UAT)
- Poprawki bugów
- Final review prawny (prawnik sprawdza implementację)

**Dzień 18-19:**
- Deployment na środowisko produkcyjne
- Monitoring pierwszych wejść
- Weryfikacja działania cookie banner

**Dzień 20-21:**
- Post-launch monitoring
- Zbieranie feedbacku
- Minor adjustments

---

## KOSZTY SZACUNKOWE

### KOSZTY JEDNORAZOWE

| Pozycja | Koszt (PLN) | Uwagi |
|---------|-------------|-------|
| Prawnik - Polityka Prywatności | 1500-3000 | Zależnie od kompleksowości |
| Prawnik - Polityka Cookies | 800-1500 | Prostszy dokument |
| Prawnik - Regulamin | 1500-2500 | Wymaga branżowej ekspertyzy |
| Prawnik - OWU (opcjonalnie) | 3000-5000 | Specjalista prawo finansowe |
| Dev - implementacja dokumentów | 2000-4000 | ~16-32h pracy |
| Dev - integracja CMP | 1000-2000 | ~8-16h pracy |
| Dev - formularz z RODO | 2000-3000 | ~16-24h pracy |
| **SUMA** | **11 800 - 20 000** | **Bez OWU** |

### KOSZTY CYKLICZNE (ROCZNIE)

| Pozycja | Koszt (PLN/rok) | Uwagi |
|---------|-----------------|-------|
| CookieBot (Business) | 600-1200 | Zależnie od ruchu |
| Update dokumentów prawnych | 1000-2000 | 1x rocznie, review + zmiany prawne |
| Hosting zgód (database) | 0-500 | Jeśli osobny backend |
| Inspektor Ochrony Danych | 0-10000 | Jeśli external IOD |
| **SUMA** | **1600 - 13700** | **Bez IOD: 1600-3700** |

### OSZCZĘDNOŚCI (DIY)

Jeśli chcecie zaoszczędzić:
1. **Polityka Cookies** - można wygenerować automatycznie przez CookieBot (zawarte w abonamencie)
2. **IOD** - nieobowiązkowy dla małych firm, można odłożyć
3. **OWU** - można odłożyć do Fazy 3

**Minimalne koszty (wariant oszczędnościowy):**
- Jednorazowe: ~8 000 PLN (tylko Polityka Prywatności + Regulamin + dev)
- Roczne: ~1 000 PLN (CookieBot Starter)

---

## LISTA KONTROLNA PRZED URUCHOMIENIEM

### DOKUMENTY PRAWNE ✓/✗

- [ ] Polityka Prywatności - pełna, zgodna z Art. 13/14 RODO
- [ ] Polityka Cookies - szczegółowa tabela cookies
- [ ] Regulamin - zgodny z Art. 8 ustawy o usługach elektronicznych
- [ ] Wszystkie dokumenty zrecenzowane przez prawnika
- [ ] NIP uzupełniony we wszystkich lokalizacjach
- [ ] Pełne dane kontaktowe (adres, telefon, email)
- [ ] Dane kontaktowe do UODO (w Polityce Prywatności)

### ELEMENTY TECHNICZNE ✓/✗

- [ ] Cookie Consent Banner działa poprawnie
- [ ] Banner wyświetla się przy pierwszej wizycie
- [ ] Możliwość zaakceptowania/odrzucenia wszystkich cookies
- [ ] Panel ustawień cookies (granularna zgoda)
- [ ] Zapisywanie preferencji cookies
- [ ] Floating button do zmiany ustawień
- [ ] Formularz kontaktowy zaimplementowany
- [ ] Checkbox zgody RODO (required, unchecked)
- [ ] Checkbox zgody marketingowej (optional, unchecked)
- [ ] Klauzula informacyjna pod formularzem
- [ ] Link do Polityki Prywatności przy checkboxach
- [ ] Walidacja formularza (email, telefon, required fields)
- [ ] System rejestracji zgód (timestamp, IP, content)
- [ ] CAPTCHA lub inne zabezpieczenie antyspamowe

### ROUTING I LINKI ✓/✗

- [ ] `/polityka-prywatnosci` - działa
- [ ] `/polityka-cookies` - działa
- [ ] `/regulamin` - działa
- [ ] `/rodo` - działa lub redirect do Polityki Prywatności
- [ ] Wszystkie linki w Footer działają
- [ ] Breadcrumbs na podstronach prawnych
- [ ] Przycisk "Powrót do strony głównej"

### SEO I METADATA ✓/✗

- [ ] Meta title zawiera NIP (opcjonalnie)
- [ ] Schema.org zawiera pełne dane firmy
- [ ] Meta description aktualne
- [ ] robots.txt zezwala na indeksowanie
- [ ] sitemap.xml zawiera wszystkie podstrony prawne

### TESTY UŻYTKOWNIKA ✓/✗

- [ ] Test pierwszej wizyty (cookie banner)
- [ ] Test akceptacji wszystkich cookies
- [ ] Test odrzucenia wszystkich cookies
- [ ] Test granularnych ustawień cookies
- [ ] Test formularza - wysłanie z zgodą RODO
- [ ] Test formularza - próba wysłania BEZ zgody RODO (powinno blokować)
- [ ] Test formularza - walidacja emaila
- [ ] Test formularza - walidacja telefonu
- [ ] Test responsywności (mobile/tablet/desktop)
- [ ] Test cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Test zmiany ustawień cookies po akceptacji
- [ ] Test linków do dokumentów prawnych

### COMPLIANCE CHECK ✓/✗

- [ ] Pre-checked checkboxy USUNIĘTE (nielegalne!)
- [ ] Zgody są dobrowolne (nie wymuszane)
- [ ] Możliwość korzystania ze strony po odrzuceniu marketingowych cookies
- [ ] Klauzula RODO zawiera wszystkie wymagane elementy
- [ ] Dokumenty prawne zawierają datę ostatniej aktualizacji
- [ ] Mechanizm informowania o zmianach w dokumentach

### POST-LAUNCH MONITORING ✓/✗

- [ ] Analytics skonfigurowane (zgodnie z polityką cookies)
- [ ] Monitoring błędów formularza
- [ ] Tracking conversion rate formularza
- [ ] Review user feedback (pierwszy tydzień)
- [ ] Sprawdzenie czy cookie banner nie blokuje contentu
- [ ] Sprawdzenie load time (cookie banner nie spowalnia)

---

## KONTAKT I DALSZE KROKI

### ZALECENIA DLA KLIENTA (TS Finanse)

1. **NATYCHMIASTOWE DZIAŁANIA:**
   - Przekazać ten raport do zarządu
   - Zebrać pełne dane firmy (NIP, REGON, KRS, adres, telefon)
   - Skontaktować się z prawnikiem specjalizującym się w RODO
   - NIE uruchamiać strony publicznie do czasu uzupełnienia braków

2. **BUDŻET DO ZABEZPIECZENIA:**
   - Minimum: 8 000 - 10 000 PLN (jednorazowo)
   - Rocznie: ~2 000 PLN (CMP + updates)

3. **TIMELINE:**
   - Optymistyczny: 3 tygodnie do pełnego compliance
   - Realistyczny: 4-6 tygodni (z rezerwą na poprawki)

4. **ZESPÓŁ DO ZAANGAŻOWANIA:**
   - Prawnik (zewnętrzny, specjalista RODO + prawo finansowe)
   - Developer Frontend (implementacja dokumentów + cookie banner + formularz)
   - Developer Backend (rejestracja zgód, jeśli n8n nie wystarcza)
   - Tester QA (opcjonalnie, ale zalecane)
   - Project Manager / Compliance Officer (koordynacja)

### PYTANIA DO WYJAŚNIENIA Z KLIENTEM

1. Jaka jest forma prawna TS Finanse? (sp. z o.o., JDG, spółka cywilna?)
2. Czy firma ma już NIP, REGON, KRS?
3. Czy planują udzielać pożyczek także konsumentom (B2C) czy tylko firmom (B2B)?
4. Czy mają już prawnika na stałe, czy trzeba znaleźć zewnętrznego?
5. Jaki jest budżet na compliance?
6. Czy planują wdrożyć Inspektora Ochrony Danych?
7. Czy mają już procedury AML/KYC?
8. Czy używają jakichś zewnętrznych narzędzi analitycznych (Google Analytics, Facebook Pixel)?
9. Czy planują newsletter / email marketing?
10. Kiedy planowane jest uruchomienie strony publicznie?

### REKOMENDOWANI PARTNERZY (do rozważenia)

**Prawnicy specjalizujący się w RODO:**
- Kancelaria prawna z certyfikatem IAPP CIPP/E
- Doświadczenie w branży fintech/finansowej

**Consent Management:**
- **CookieBot** (najpopularniejszy w PL, PUODO-compliant)

**Audyt i Certyfikacja:**
- TÜV Rheinland Polska (audyt RODO)
- Certyfikat ISO 27001 (opcjonalnie, dla większego zaufania)

---

## ZAŁĄCZNIKI

### A. PRZYDATNE LINKI PRAWNE

**Akty prawne:**
1. RODO (Rozporządzenie 2016/679): https://eur-lex.europa.eu/eli/reg/2016/679/oj
2. Ustawa o ochronie danych osobowych: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20180001000
3. Ustawa o świadczeniu usług drogą elektroniczną: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20020800808
4. Prawo telekomunikacyjne (Art. 173): https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20041711800

**Organy nadzorcze:**
1. UODO (Urząd Ochrony Danych Osobowych): https://uodo.gov.pl
2. UOKiK (Urząd Ochrony Konkurencji i Konsumentów): https://uokik.gov.pl
3. UKE (Urząd Komunikacji Elektronicznej): https://www.uke.gov.pl
4. KNF (Komisja Nadzoru Finansowego): https://www.knf.gov.pl

**Guidelines i wytyczne:**
1. PUODO - wzory klauzul informacyjnych: https://uodo.gov.pl/pl/224/905
2. EDPB Guidelines: https://edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_pl
3. PUODO - cookies i śledzenie: https://uodo.gov.pl/pl/138/1456

### B. NARZĘDZIA I GENERATORY

**Consent Management:**
1. CookieBot: https://www.cookiebot.com/pl/
2. OneTrust: https://www.onetrust.com
3. Iubenda: https://www.iubenda.com

**Generatory dokumentów (DO WERYFIKACJI PRZEZ PRAWNIKA!):**
1. RODO.gov.pl - generator klauzul: https://rodo.gov.pl/generator-klauzul
2. Giodo.gov.pl (archiwum): https://giodo.gov.pl

**Audyt cookies:**
1. CookieBot Scanner: https://www.cookiebot.com/en/cookie-checker/
2. OneTrust Cookie Compliance: https://www.cookiepro.com

### C. CHECKLIST DLA PRAWNIKA

Przekaż prawnikowi ten raport wraz z następującymi informacjami:

**Dane firmowe:**
- [ ] Pełna nazwa firmy
- [ ] Forma prawna
- [ ] NIP, REGON, KRS
- [ ] Adres siedziby
- [ ] Dane kontaktowe (email, telefon)
- [ ] Przedstawiciel firmy (imię, nazwisko, stanowisko)

**Zakres działalności:**
- [ ] Dokładny opis usług finansowych
- [ ] Grupy docelowe (B2B czy B2C?)
- [ ] Zakres kwotowy pożyczek (1-20 mln PLN)
- [ ] Typ zabezpieczenia (hipoteka)
- [ ] Czy firma jest pod nadzorem KNF? (prawdopodobnie nie)

**Specyfikacja techniczna:**
- [ ] Jakie dane osobowe są zbierane? (lista pól formularza)
- [ ] Jakie cookies są używane? (lista z CookieBot scan)
- [ ] Jakie narzędzia zewnętrzne? (Google Analytics, Facebook Pixel, etc.)
- [ ] Gdzie dane są przechowywane? (serwery w PL/EU/US?)
- [ ] Jak długo dane są przechowywane?

**Pytania do prawnika:**
- [ ] Czy firma powinna powołać IOD?
- [ ] Czy podlega obowiązkom AML?
- [ ] Czy Ustawa o kredycie konsumenckim dotyczy (jeśli B2C)?
- [ ] Jakie dodatkowe licencje/zezwolenia mogą być wymagane?

---

## PODSUMOWANIE I WNIOSKI

### OBECNY STAN: NIEKOMPLETNY - WYMAGA PILNEJ INTERWENCJI

Landing page TS Finanse jest w **fazie przygotowawczej** i **NIE JEST GOTOWA** do uruchomienia publicznego ze względu na liczne braki w zakresie zgodności z prawem polskim i europejskim.

### KRYTYCZNE BRAKI:

1. **Polityka Prywatności** - niepełna, wymaga profesjonalnego opracowania
2. **Polityka Cookies** - brak
3. **Regulamin** - brak
4. **Cookie Consent Banner** - brak
5. **Klauzule RODO w formularzu** - brak (formularz nie zaimplementowany)
6. **NIP firmy** - nieuzupełniony
7. **Pełne dane kontaktowe** - niekompletne (brak telefonu, adresu)

### POZIOM RYZYKA: WYSOKI

Uruchomienie strony w obecnym stanie naraża TS Finanse na:
- Kary finansowe od UODO (do 20 mln EUR lub 4% obrotu)
- Kary od UOKiK i UKE (do 3% obrotu)
- Skargi użytkowników do organów nadzorczych
- Utratę reputacji i zaufania klientów
- Problemy prawne w przyszłości

### REKOMENDACJA GŁÓWNA: WSTRZYMAĆ URUCHOMIENIE

**NIE URUCHAMIAĆ** strony publicznie do czasu uzupełnienia minimum:
1. Pełnej Polityki Prywatności
2. Polityki Cookies
3. Regulaminu
4. Cookie Consent Banner
5. Pełnych danych firmy (NIP, adres, telefon)

### TIMELINE DO COMPLIANCE: 3-6 TYGODNI

- **Optymistyczny:** 3 tygodnie (przy szybkiej reakcji i dostępności prawnika)
- **Realistyczny:** 4-6 tygodni (z rezerwą na poprawki i testy)

### BUDŻET WYMAGANY: 8 000 - 20 000 PLN (jednorazowo)

- **Minimum:** ~8 000 PLN (podstawowe dokumenty + implementacja)
- **Komfortowy:** ~15 000 PLN (pełne dokumenty + OWU + zaawansowane testy)
- **Premium:** ~20 000 PLN (wszystko + IOD + audyt zewnętrzny)

### DZIAŁANIA NATYCHMIASTOWE:

1. ✅ **Ten raport** przekazać do zarządu TS Finanse
2. 🔴 **NIE uruchamiać** strony publicznie
3. 📞 **Skontaktować się** z prawnikiem specjalizującym się w RODO
4. 📝 **Zebrać** pełne dane firmy (NIP, REGON, KRS, adres, telefon)
5. 💰 **Zabezpieczyć budżet** minimum 10 000 PLN
6. 📅 **Ustalić timeline** wdrożenia (3-6 tygodni)
7. 👥 **Zebrać zespół** (prawnik + developer + PM)

---

## AUTOR RAPORTU

**Audytor:** Ekspert ds. zgodności z RODO, prawem polskim i wymogami branży finansowej
**Data audytu:** 5 listopada 2025
**Zakres:** Kompleksowy audyt zgodności prawnej landing page TS Finanse
**Podstawa:**
- RODO (Rozporządzenie 2016/679)
- Ustawa o ochronie danych osobowych
- Ustawa o świadczeniu usług drogą elektroniczną
- Prawo telekomunikacyjne
- Interpretacje PUODO i EDPB
- Orzecznictwo TSUE (m.in. C-673/17 Planet49)

**Metodologia:**
1. Analiza kodu źródłowego wszystkich komponentów
2. Weryfikacja istniejących dokumentów prawnych
3. Identyfikacja braków w świetle obowiązujących przepisów
4. Ocena ryzyka prawnego
5. Przygotowanie rekomendacji i planu działania

**Zastrzeżenie:**
Ten raport ma charakter informacyjny i stanowi podstawę do dalszej pracy z prawnikiem specjalizującym się w ochronie danych osobowych. Nie zastępuje profesjonalnej porady prawnej. Ostateczne dokumenty prawne powinny być przygotowane lub zweryfikowane przez uprawnionego prawnika.

---

**RAPORT ZAKOŃCZONY**

Kolejny krok: Przekazanie tego raportu do klienta (TS Finanse) wraz z rekomendacją kontaktu z prawnikiem specjalizującym się w RODO i prawie finansowym.

Czy życzycie sobie, abym przygotował także:
1. Template email do klienta z podsumowaniem raportu?
2. Brief dla prawnika (skrócona wersja z najważniejszymi punktami)?
3. Przykładowe drafty dokumentów prawnych (do weryfikacji przez prawnika)?

Proszę o informację, jeśli potrzebujecie dodatkowych materiałów lub wyjaśnień.

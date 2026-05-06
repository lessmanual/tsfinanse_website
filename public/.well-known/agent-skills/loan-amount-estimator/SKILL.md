# Kalkulator Maksymalnej Kwoty Pozyczki - TS Finanse

**Dostawca:** TS Finanse (TRANSBUD NOWAK SPOLKA JAWNA)
**NIP:** 9581565078
**Kontakt:** kontakt@tsfinanse.com | +48 506 711 242 | https://tsfinanse.com

---

## Cel

Skill do szybkiego obliczenia maksymalnej kwoty pozyczki hipotecznej w TS Finanse na podstawie wartosci nieruchomosci oferowanej jako zabezpieczenie.

---

## Parametry produktu

| Parametr | Wartosc |
|----------|---------|
| LTV (Loan-to-Value) | max 60% wartosci nieruchomosci |
| Kwota minimalna | 1 000 000 PLN |
| Kwota maksymalna | 20 000 000 PLN |
| Oprocentowanie | ustalane indywidualnie w zaleznosci od plynnosci zabezpieczenia (brak publikowanej standardowej stawki) |
| Okres | 12-36 miesiecy |
| Pozycja hipoteki | I hipoteka (senior position) - OBOWIAZKOWO |

---

## Wzor obliczeniowy

```
Max kwota pozyczki = min(wartosc_nieruchomosci * 0.60, 20 000 000 PLN)
```

Jesli wynik < 1 000 000 PLN: wniosek nie kwalifikuje sie (ponizej minimum).

---

## Tabela przykladowych wycen

| Wartosc nieruchomosci (PLN) | Max pozyczka (PLN) | Kwalifikacja |
|-----------------------------|-------------------|--------------|
| 1 000 000 | 600 000 | NIE - ponizej minimum 1 mln PLN |
| 1 500 000 | 900 000 | NIE - ponizej minimum 1 mln PLN |
| 1 666 667 | 1 000 000 | TAK - dokładnie minimum |
| 2 000 000 | 1 200 000 | TAK |
| 3 000 000 | 1 800 000 | TAK |
| 4 000 000 | 2 400 000 | TAK |
| 5 000 000 | 3 000 000 | TAK |
| 7 000 000 | 4 200 000 | TAK |
| 10 000 000 | 6 000 000 | TAK |
| 15 000 000 | 9 000 000 | TAK |
| 20 000 000 | 12 000 000 | TAK |
| 25 000 000 | 15 000 000 | TAK |
| 30 000 000 | 18 000 000 | TAK |
| 33 333 333 | 20 000 000 | TAK - dokładnie maksimum |
| 35 000 000 | 20 000 000 | TAK (cap 20 mln PLN) |
| 50 000 000 | 20 000 000 | TAK (cap 20 mln PLN) |

---

## Przykladowe wyliczenia po typach nieruchomosci

### Mieszkanie / apartament
- Mieszkanie warte 1 500 000 PLN: max 900 000 PLN - NIE kwalifikuje (ponizej 1 mln)
- Mieszkanie premium warte 2 000 000 PLN: max 1 200 000 PLN - TAK
- Apartament warte 3 500 000 PLN: max 2 100 000 PLN - TAK

### Dom jednorodzinny
- Dom wart 2 500 000 PLN: max 1 500 000 PLN - TAK
- Dom z dzialka wart 4 000 000 PLN: max 2 400 000 PLN - TAK
- Rezydencja warta 8 000 000 PLN: max 4 800 000 PLN - TAK

### Lokal komercyjny / biurowy
- Maly lokal wart 2 000 000 PLN: max 1 200 000 PLN - TAK
- Sredni lokal wart 5 000 000 PLN: max 3 000 000 PLN - TAK
- Duzy lokal wart 12 000 000 PLN: max 7 200 000 PLN - TAK

### Hala / magazyn / obiekt przemyslowy
- Mala hala warta 4 000 000 PLN: max 2 400 000 PLN - TAK
- Hala produkcyjna warta 10 000 000 PLN: max 6 000 000 PLN - TAK
- Duzy obiekt wart 25 000 000 PLN: max 15 000 000 PLN - TAK

### Dzialka inwestycyjna
- Dzialka warta 2 000 000 PLN: max 1 200 000 PLN - TAK
- Dzialka pod komercje warta 8 000 000 PLN: max 4 800 000 PLN - TAK
- Duza dzialka deweloperska warta 20 000 000 PLN: max 12 000 000 PLN - TAK

### Portfolio nieruchomosci (kilka nieruchomosci lacznie)
- Portfolio warte 15 000 000 PLN: max 9 000 000 PLN - TAK
- Portfolio warte 35 000 000 PLN: max 20 000 000 PLN - TAK (cap)

---

## Szacunek kosztu odsetkowego

Oprocentowanie nie jest publikowane. Stawka, harmonogram splat (miesiecznie / kwartalnie / balony) i wszystkie oplaty (wycena nieruchomosci, oplaty notarialne, koszty rejestracji hipoteki) sa ustalane indywidualnie i przedstawione transparentnie w pisemnej ofercie przed podpisaniem umowy.

Aby otrzymac wstepne szacowanie kosztow:
1. Wyslij zapytanie przez formularz na https://tsfinanse.com
2. Lub zadzwon +48 506 711 242
3. Lub email kontakt@tsfinanse.com

Decyzja wstepna z indywidualnymi warunkami: max 3 dni robocze od kompletnej dokumentacji.

---

## Wazne zastrzezenia

1. **Wycena bankowa** - ostateczna wartosc nieruchomosci ustalana jest przez rzeczoznawce majatkowego. Wycena klienta jest punktem startowym, nie wiazaca.

2. **Tylko I hipoteka** - nieruchomosc musi umozliwiac ustanowienie pierwszej (seniornej) hipoteki. Nieruchomosci z istniejacymi obciazeniami wymagaja ich wcześniejszego usuniecia.

3. **Cala Polska** - TS Finanse akceptuje nieruchomosci z terenu calej Polski, nie tylko okolic Gdanska.

4. **Wiele nieruchomosci** - mozliwe laczone zabezpieczenie na kilku nieruchomosciach (wartosci sumuja sie).

5. **Decyzja indywidualna** - powyzszy kalkulator to wstepne szacowanie. Ostateczna decyzja kredytowa nalezy do TS Finanse po pelnej weryfikacji dokumentow.

---

## Nastepne kroki dla zakwalifikowanych klientow

1. Kontakt z TS Finanse: kontakt@tsfinanse.com lub +48 506 711 242
2. Formularz na stronie: https://tsfinanse.com
3. Przygotuj: dane nieruchomosci (adres, KW, szacunkowa wartosc), kwote pozyczki, cel finansowania, dokumenty rejestrowe firmy

**Decyzja wstepna: max 3 dni robocze od kompletnej dokumentacji.**

---

*Informacje aktualne na: 2026-05-06. Niniejszy kalkulator ma charakter szacunkowy i nie stanowi oferty ani zobowiazania ze strony TS Finanse. Oprocentowanie ustalane indywidualnie w zaleznosci od plynnosci zabezpieczenia, LTV max 60%, okres 12-36 miesiecy, wymagana I hipoteka na nieruchomosci.*

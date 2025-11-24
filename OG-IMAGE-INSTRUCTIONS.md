# Instrukcje: Obraz OG (Open Graph) dla TS Finanse

## 📋 Specyfikacja Obrazu

### Wymagane Parametry:
- **Wymiary**: 1200 x 630 pikseli (proporcje 1.91:1)
- **Format**: JPG lub PNG (zalecane JPG dla mniejszego rozmiaru)
- **Nazwa pliku**: `og-image.jpg`
- **Lokalizacja**: `/public/og-image.jpg`
- **Rozmiar**: Maksymalnie 8 MB (zalecane poniżej 300 KB)
- **Przestrzeń kolorów**: sRGB

---

## 🎨 Wytyczne Projektowe

### Kolory Brandu TS Finanse:
- **Główny (złoty)**: `#D4AF7A`
- **Ciemny brąz**: `#3D1F1F`
- **Jasny beż**: `#FEFEFE`

### Elementy do Uwzględnienia:

1. **Logo/Nazwa firmy**: "TS Finanse" widocznie w górnej części
2. **Główny komunikat**:
   - "Pożyczki Hipoteczne dla Przedsiębiorców"
   - Lub: "Finansowanie B2B od 1 do 20 mln PLN"
3. **Kluczowe wartości** (opcjonalnie):
   - ✓ Własny kapitał
   - ✓ Decyzja w 3 dni
   - ✓ Bez zależności od banków
4. **Adres strony**: www.tsfinanse.com (małym fontem w rogu)

---

## 📐 Strefy Bezpieczeństwa (Safe Zones)

### Ważne obszary:
- **Centralny prostokąt** (400x400px): Zawsze widoczny na wszystkich platformach
- **Marginesy**: Minimum 40px od krawędzi (Facebook/Twitter mogą przycinać brzegi)

### Platformy wykorzystujące OG Image:
- Facebook (feed + share)
- Twitter/X (cards)
- LinkedIn (share)
- WhatsApp (link preview)
- Slack, Discord, Teams (link embeds)

---

## ✅ Checklist przed Publikacją:

### 1. Techniczne:
- [ ] Wymiary dokładnie 1200x630px
- [ ] Format JPG lub PNG
- [ ] Rozmiar < 300 KB
- [ ] Zapisany w przestrzeni kolorów sRGB

### 2. Design:
- [ ] Logo TS Finanse widoczne
- [ ] Główny komunikat czytelny
- [ ] Kolory zgodne z brandem
- [ ] Tekst czytelny także w małej skali (minimum 16px font size)
- [ ] Nie używa zbyt wielu szczegółów (będzie skalowany)

### 3. Treść:
- [ ] Komunikat zgodny z obecną ofertą (bez "15% rocznie")
- [ ] Brak literówek
- [ ] Język polski

### 4. Testowanie:
- [ ] Wygląda dobrze w proporcjach 1.91:1
- [ ] Czytelny po przeskalowaniu do 600x315px
- [ ] Czytelny w ciemnym i jasnym motywie (Facebook/Twitter)

---

## 🛠️ Narzędzia do Tworzenia:

### Zalecane:
- **Canva** (darmowy template OG Image)
- **Figma** (profesjonalne projektowanie)
- **Adobe Photoshop/Illustrator**
- **Crello/Visme**

### Darmowe Szablony:
- https://www.canva.com/templates/s/open-graph/
- https://bannersnack.com/og-image-generator/

---

## 📝 Przykładowy Układ:

```
┌─────────────────────────────────────────────┐
│  Logo TS Finanse                     (top)  │
│                                              │
│         POŻYCZKI HIPOTECZNE                  │
│         DLA PRZEDSIĘBIORCÓW                  │
│                                              │
│    Finansowanie B2B od 1 do 20 mln PLN      │
│                                              │
│  ✓ Własny kapitał  ✓ Decyzja w 3 dni       │
│                                              │
│                     www.tsfinanse.com  (btm) │
└─────────────────────────────────────────────┘
```

---

## 🔍 Testowanie OG Image:

### Po dodaniu pliku `og-image.jpg` do `/public/`:

1. **Facebook Sharing Debugger**:
   - https://developers.facebook.com/tools/debug/
   - Wklej: https://www.tsfinanse.com
   - Kliknij "Scrape Again" aby wyczyścić cache

2. **Twitter Card Validator**:
   - https://cards-dev.twitter.com/validator
   - Wklej: https://www.tsfinanse.com

3. **LinkedIn Post Inspector**:
   - https://www.linkedin.com/post-inspector/
   - Wklej: https://www.tsfinanse.com

4. **Ręczny test**:
   - Wyślij link na prywatny czat Slack/Discord/WhatsApp
   - Sprawdź czy preview wygląda dobrze

---

## ⚠️ Częste Błędy do Uniknięcia:

1. **Zbyt mały tekst** - Minimum 40-50px dla głównego napisu
2. **Zbyt dużo tekstu** - Maksymalnie 3-4 linie
3. **Logo zbyt małe** - Logo powinno zajmować przynajmniej 10% wysokości
4. **Złe proporcje** - Zawsze 1200x630, nie inne wymiary
5. **Zbyt jasny tekst na jasłym tle** - Kontrast minimum 4.5:1
6. **Używanie starych informacji** - Sprawdź aktualność (np. bez "15% rocznie")

---

## 📌 Gdzie Umieścić Plik:

Po stworzeniu obrazu:

1. Zapisz jako `/public/og-image.jpg`
2. URL będzie: `https://www.tsfinanse.com/og-image.jpg`
3. Już skonfigurowane w:
   - `index.html` (linia 46): `<meta property="og:image" content="https://www.tsfinanse.com/og-image.jpg" />`
   - `SEO.tsx` (linia 16): `const defaultOgImage = ${siteUrl}/og-image.jpg;`

**Nie trzeba zmieniać kodu - wystarczy dodać plik!**

---

## 📞 W Razie Pytań:

- Grafik/Designer: Pokaż ten dokument
- Zespół techniczny: Plik `og-image.jpg` idzie do folderu `/public/`
- Tester: Użyj linków testowych powyżej po wdrożeniu

---

**Data utworzenia**: 2025-11-24
**Wersja**: 1.0
**Autor**: Claude Code AI

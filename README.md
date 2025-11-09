# TS Finanse - Landing Page

Profesjonalna strona internetowa dla TS Finanse - pożyczki biznesowe pod zabezpieczenie hipoteczne.

## 🌐 Wersja Live

**URL:** https://lessmanual.github.io/tsfinanse_website/

## ✨ Funkcjonalności

- 🏠 **Strona główna** - Hero z przyciskiem "Zadzwoń", sekcje informacyjne
- 📝 **Formularz kontaktowy** - Walidacja, NIP, kwota pożyczki, preferowane godziny
- 🤝 **Program Partnerski** - Informacje dla pośredników kredytowych
- 📄 **Strony prawne** - Regulamin, Polityka Prywatności, Polityka Cookies, RODO
- 🍪 **Cookie Banner** - Zgody na cookies z ustawieniami
- ⬆️ **Scroll to Top** - Przycisk przewijania do góry
- 📱 **Responsywność** - Pełna adaptacja mobile/tablet/desktop
- ⚡ **Performance** - Zoptymalizowane obrazy (AVIF, WebP), lazy loading
- 🔍 **SEO** - Meta tagi, Open Graph, sitemap, robots.txt

## 🚀 Deployment

Strona automatycznie deployuje się na GitHub Pages po każdym commicie do `main`.

**Szczegóły:** Zobacz [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Technologie

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **Router:** React Router DOM v7
- **Icons:** Lucide React
- **Forms:** React Hook Form
- **SEO:** React Helmet Async
- **Analytics:** Google Analytics 4

## 📦 Instalacja (Development)

```bash
# Instalacja dependencies
npm install

# Uruchom dev server
npm run dev

# Build production
npm run build

# Preview production build
npx serve build
```

## 📂 Struktura projektu

```
src/
├── components/          # Komponenty React
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── ContactForm.tsx
│   ├── CookieBanner.tsx
│   ├── ScrollToTopButton.tsx
│   └── ...
├── pages/              # Strony aplikacji
│   ├── HomePage.tsx
│   ├── ProgramPartnerski.tsx
│   ├── Regulamin.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useCookieConsent.ts
│   ├── useScrollThreshold.ts
│   └── use-auth.ts
├── assets/             # Obrazy, fonty
└── App.tsx             # Router główny
```

## 📞 Kontakt

**TS Finanse**
- Email: kontakt@tsfinanse.com
- Tel: +48 506 711 242
- Adres: ul. Gdańska 60, 84-240 Reda

## 🎨 Design

Original Figma design: https://www.figma.com/design/HQqESqCBIcLOVLwCPHiotY/TS-Finanse-Landing-Page

## 📝 Licencja

© 2025 TS Finanse. Wszelkie prawa zastrzeżone.

---

**Last updated:** 2025-11-09
**Version:** 1.0.0

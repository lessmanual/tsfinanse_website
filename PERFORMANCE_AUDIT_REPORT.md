# RAPORT AUDYTU WYDAJNOŚCI - TS FINANSE LANDING PAGE
**Data audytu:** 2025-11-05
**Audytor:** Elite Performance Optimization Specialist
**Framework:** React 18.3.1 + Vite 6.3.5

---

## EXECUTIVE SUMMARY

Landing page TS Finanse został poddany kompleksowemu audytowi wydajności. Aplikacja jest w stanie funkcjonalnym, jednak zidentyfikowano **12 krytycznych obszarów optymalizacji**, które mogą poprawić Lighthouse Performance Score z przewidywanych ~65-75 do **90+**.

### Metryki Baseline (Analiza Bundle)
- **JS Bundle (gzip):** 70.29 KB - **DOBRY**
- **CSS Bundle (gzip):** 7.15 KB - **DOSKONAŁY**
- **Total Assets:** ~1.66 MB (głównie obrazy)
- **Largest Asset:** Hero background - 1.51 MB - **KRYTYCZNY PROBLEM**

---

## 1. ANALIZA FORMATÓW OBRAZÓW

### ZNALEZIONO PROBLEMY

#### Status Obecny
| Obraz | Rozmiar | Format | Status |
|-------|---------|--------|--------|
| Hero Background | 1.51 MB | PNG | KRYTYCZNY |
| Logo | 113 KB | PNG | WYMAGA OPTYMALIZACJI |

#### Szczegóły techniczne
```
Hero: 0a00d157a774d4a1c538fd2cb05101097bebd8d5.png
- Wymiary: 1408x768px
- Format: PNG 8-bit RGB
- Rozmiar: 1,507 KB (1.47 MB)
- Kompresja: non-interlaced

Logo: e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png
- Wymiary: 1000x1000px
- Format: PNG 8-bit RGBA
- Rozmiar: 115 KB
- Kompresja: non-interlaced
```

### IMPACT NA PERFORMANCE
- **LCP (Largest Contentful Paint):** Hero image to likely LCP element - obecnie ~3-5s
- **Bandwidth:** 1.62 MB tylko na obrazy - problem na mobile
- **Parse Time:** Duże PNG zwiększają czas dekodowania

### REKOMENDACJE - PRIORYTET KRYTYCZNY

#### 1. Konwersja do WebP/AVIF
```bash
# Hero Background
- Obecny: 1.51 MB PNG
- WebP (jakość 80): ~150-200 KB (-87%)
- AVIF (jakość 75): ~100-150 KB (-90%)

# Logo
- Obecny: 113 KB PNG
- WebP (jakość 90): ~30-40 KB (-65%)
- Alternatywa: SVG (jeśli możliwe) ~10-20 KB (-82%)
```

#### 2. Responsive Images Strategy
```html
<picture>
  <source
    srcset="hero-1408w.avif 1408w, hero-1024w.avif 1024w, hero-768w.avif 768w"
    type="image/avif"
  />
  <source
    srcset="hero-1408w.webp 1408w, hero-1024w.webp 1024w, hero-768w.webp 768w"
    type="image/webp"
  />
  <img
    src="hero-1408w.jpg"
    alt="Modern business architecture"
    width="1408"
    height="768"
    loading="eager"
    fetchpriority="high"
  />
</picture>
```

#### 3. Implementacja w React
```tsx
// src/components/Hero.tsx - OPTYMALIZACJA
import heroBackgroundWebP from '@/assets/hero-bg.webp';
import heroBackgroundAVIF from '@/assets/hero-bg.avif';
import heroBackgroundFallback from '@/assets/hero-bg.jpg';

<picture>
  <source srcSet={heroBackgroundAVIF} type="image/avif" />
  <source srcSet={heroBackgroundWebP} type="image/webp" />
  <img
    src={heroBackgroundFallback}
    alt="Modern business architecture"
    className="w-full h-full object-cover"
    width={1408}
    height={768}
    loading="eager"
    fetchpriority="high"
  />
</picture>
```

**Przewidywany impact:** LCP z ~3-5s → ~1.5-2s (**-50% czasu ładowania**)

---

## 2. LAZY LOADING OBRAZÓW

### OBECNY STAN
```tsx
// Hero.tsx - linie 30-34
<img
  src={heroBackground}
  alt="Modern business architecture"
  className="w-full h-full object-cover"
/>
```

### PROBLEM
- Brak atrybutów `loading` i `fetchpriority`
- Hero image powinien mieć `loading="eager"` i `fetchpriority="high"`
- Logo używany 2x (Hero + Navigation) - brak optymalizacji

### REKOMENDACJE

#### Hero Images (Above-the-Fold)
```tsx
<img
  loading="eager"
  fetchpriority="high"
  width={1408}
  height={768}
/>
```

#### Logo w Navigation (Below-the-Fold po scroll)
```tsx
<img
  src={logoImage}
  alt="TS Finanse Logo"
  className="h-12 w-auto"
  loading="lazy"
  width={1000}
  height={1000}
/>
```

#### Future Images (jeśli dodane)
- Wszystkie obrazy poniżej fold → `loading="lazy"`
- Użyj Intersection Observer dla advanced lazy loading

**Przewidywany impact:** Redukcja initial page load o ~115 KB

---

## 3. OPTYMALIZACJA JAVASCRIPT I CSS

### BUNDLE ANALYSIS

#### JavaScript Bundle: 227 KB (70.29 KB gzip) ✅
```
Breakdown (szacunkowy):
- React + React-DOM: ~130 KB
- Radix UI Components: ~40 KB
- Lucide Icons: ~30 KB
- Application Code: ~27 KB
```

**Status:** DOBRY - w granicach normy dla React SPA

#### CSS Bundle: 42 KB (7.15 KB gzip) ✅
**Status:** DOSKONAŁY

### ZNALEZIONE PROBLEMY

#### 1. Nieużywane UI Components (Dead Code)
Projekt zawiera **69 komponentów UI** (5,083 linii kodu), ale używa tylko **1**:

```
Używane: accordion (FAQ.tsx)

Nieużywane (68 komponentów):
- alert, alert-dialog, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card
- carousel, chart, checkbox, collapsible, command
- context-menu, dialog, drawer, dropdown-menu
- form, hover-card, input, input-otp, label
- menubar, navigation-menu, pagination, popover
- progress, radio-group, resizable, scroll-area
- select, separator, sheet, sidebar, skeleton
- slider, sonner, switch, table, tabs, textarea
- toggle, toggle-group, tooltip
- utils, use-mobile
```

**Impact:** ~35-40 KB dodatkowego JS (przed tree-shaking)

#### 2. Heavy Dependencies (node_modules)
```
Największe:
- lucide-react: 40 MB (full icon library)
- date-fns: 36 MB (nieużywane)
- recharts: 5.2 MB (nieużywane)
- lodash: 4.9 MB (nieużywane)
- react-hook-form: 1.9 MB (nieużywane)
- react-day-picker: 1.5 MB (nieużywane)
```

**Problem:** Import pełnego lucide-react zamiast tree-shakeable icons

#### 3. Fonts Loading
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
```

**Problemy:**
- Brak `font-display: swap` w Google Fonts URL
- Render-blocking external CSS
- Nie wykorzystuje preconnect/dns-prefetch

### REKOMENDACJE - PRIORITY HIGH

#### A. Usuń nieużywane UI komponenty
```bash
# Zachowaj tylko:
src/components/ui/
├── accordion.tsx    # (używany w FAQ)
└── utils.ts         # (helper functions)

# Usuń wszystkie pozostałe (68 plików)
```

**Przewidywany impact:** -15-20 KB JS bundle

#### B. Optymalizuj importy ikon
```tsx
// PRZED (❌ zły sposób - importuje całą bibliotekę)
import { ArrowRight, Building2, Clock } from 'lucide-react';

// PO (✅ dobry sposób - tree-shakeable)
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Clock from 'lucide-react/dist/esm/icons/clock';
```

**Przewidywany impact:** -10-15 KB JS bundle

#### C. Usuń nieużywane dependencies
```json
// package.json - DO USUNIĘCIA:
{
  "dependencies": {
    // ❌ Usuń - nie używane
    "date-fns": "^...",
    "recharts": "^...",
    "lodash": "^...",
    "react-hook-form": "^...",
    "react-day-picker": "^...",
    "cmdk": "^...",
    "embla-carousel-react": "^...",
    "input-otp": "^...",
    "next-themes": "^...",
    "react-resizable-panels": "^...",
    "sonner": "^...",
    "vaul": "^...",

    // ❌ Usuń nieużywane @radix-ui (zachowaj tylko accordion)
    "@radix-ui/react-alert-dialog": "^...",
    "@radix-ui/react-avatar": "^...",
    // ... (pozostałe 20+ radix packages)
  }
}

// ✅ Zachowaj tylko:
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "*",
    "lucide-react": "^0.487.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "*"
  }
}
```

**Przewidywany impact:**
- Instalacja: z 12s → 3s
- node_modules: z 164 packages → ~20 packages
- Disk space: z ~200 MB → ~50 MB

#### D. Optymalizuj ładowanie fontów

**Metoda 1: Preconnect + font-display**
```html
<!-- index.html -->
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

**Metoda 2: Self-hosted fonts (RECOMMENDED)**
```css
/* globals.css */
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/dm-sans-v14-latin-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Crimson Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/crimson-pro-v23-latin-regular.woff2') format('woff2');
}
```

**Przewidywany impact:**
- FOIT (Flash of Invisible Text) eliminacja
- FCP improvement: -200-400ms

#### E. Code Splitting (Vite Config)
```ts
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
```

**Przewidywany impact:** Lepsze cache invalidation

---

## 4. POTENCJALNE PROBLEMY Z LIGHTHOUSE SCORES

### Performance (Przewidywane: 65-75)

#### Krytyczne problemy:
1. **LCP > 4s** - Hero image 1.51 MB PNG
2. **CLS > 0.1** - Brak width/height na obrazach
3. **TBT (Total Blocking Time)** - Brak code splitting

#### Rekomendacje:
```
✅ Konwertuj obrazy → WebP/AVIF
✅ Dodaj width/height attributes
✅ Implementuj critical CSS inline
✅ Defer non-critical CSS/JS
✅ Preload hero image
```

### Accessibility (Przewidywane: 90-95)

#### Drobne problemy:
1. Navigation - brak aria-labels na mobilnym menu
2. FAQ accordion - dobra implementacja (Radix UI)
3. Kontrast kolorów - sprawdzić na all elements

#### Rekomendacje:
```tsx
// Navigation.tsx
<button
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  className="md:hidden p-2 text-[#3D1F1F]"
  aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
  aria-expanded={isMenuOpen}
>
  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>
```

### Best Practices (Przewidywane: 90-95)

#### Problemy:
1. ~~Console errors/warnings~~ - sprawdzić w dev tools
2. Brak security headers - do konfiguracji serwera
3. HTTP/2 - do konfiguracji hostingu

#### Rekomendacje:
```
✅ Dodaj security headers (CSP, X-Frame-Options)
✅ Włącz HTTP/2
✅ HTTPS everywhere
✅ Secure cookies (jeśli używane)
```

### SEO (Przewidywane: 95-100) ✅

**Status:** BARDZO DOBRY

#### Zaimplementowane:
- ✅ Semantic HTML
- ✅ Meta tags (title, description)
- ✅ Open Graph tags
- ✅ Schema.org JSON-LD (FinancialService)
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ Proper heading hierarchy

#### Drobne usprawnienia:
```html
<!-- Dodaj canonical URL -->
<link rel="canonical" href="https://tsfinanse.com" />

<!-- Dodaj lang attribute -->
<html lang="pl">

<!-- Dodaj meta robots -->
<meta name="robots" content="index, follow" />

<!-- Dodaj theme-color -->
<meta name="theme-color" content="#3D1F1F" />
```

---

## 5. BUNDLE SIZE ANALYSIS

### Obecny Stan
```
Total Bundle (gzip):
├── JavaScript: 70.29 KB ✅ (cel: <100 KB)
├── CSS: 7.15 KB ✅ (cel: <20 KB)
├── Images: 1,623 KB ❌ (cel: <500 KB)
└── HTML: 0.28 KB ✅
───────────────────────────
Total: 1,701 KB (~1.66 MB)
```

### Po Optymalizacjach (Prognoza)
```
Optimized Bundle (gzip):
├── JavaScript: 45-50 KB ✅ (-30%)
├── CSS: 7.15 KB ✅ (bez zmian)
├── Images: 200-250 KB ✅ (-85%)
└── HTML: 0.28 KB ✅
───────────────────────────
Total: ~260 KB (-84% reduction!)
```

### Dependency Tree Issues

#### Nieużywane zależności w bundle:
```javascript
// Analiza import statements pokazuje:

UŻYWANE:
- react, react-dom
- lucide-react (icons - 15 ikon)
- @radix-ui/react-accordion (FAQ)
- tailwind utilities

PRAWDOPODOBNIE W BUNDLE (nie używane):
- date-fns (36 MB) - 0 importów
- recharts (5.2 MB) - 0 importów
- react-hook-form (1.9 MB) - 0 importów
- ~68 UI components (nieużywane)
```

---

## 6. WYDAJNOŚĆ ŁADOWANIA

### First Contentful Paint (FCP)

**Obecny (szacunek):** 1.5-2s
**Po optymalizacji:** 0.8-1.2s

#### Czynniki:
- ✅ Minimal HTML (0.44 KB)
- ✅ Small CSS bundle (7.15 KB gzipped)
- ⚠️ Fonts loading (Google Fonts blocking)
- ❌ Large JS bundle (70 KB)

### Largest Contentful Paint (LCP)

**Obecny (szacunek):** 3-5s ❌
**Po optymalizacji:** 1.5-2s ✅

**LCP Element:** Hero background image (1.51 MB)

#### Optymalizacja LCP:
```html
<head>
  <!-- 1. Preconnect do origin -->
  <link rel="preconnect" href="https://tsfinanse.com">

  <!-- 2. Preload hero image (WebP/AVIF) -->
  <link
    rel="preload"
    as="image"
    type="image/avif"
    href="/assets/hero-bg-1408w.avif"
    imagesrcset="/assets/hero-bg-768w.avif 768w, /assets/hero-bg-1408w.avif 1408w"
    imagesizes="100vw"
    fetchpriority="high"
  />
</head>
```

### Time to Interactive (TTI)

**Obecny (szacunek):** 3-4s
**Po optymalizacji:** 2-2.5s

#### Blockers:
1. JS bundle parsing (227 KB)
2. React hydration
3. Font loading

### Cumulative Layout Shift (CLS)

**Obecny (szacunek):** 0.05-0.15 ⚠️
**Po optymalizacji:** < 0.1 ✅

#### Źródła CLS:
1. **Hero images** - brak width/height
2. **Logo w Navigation** - fade in/out transition
3. **Google Fonts** - FOIT bez font-display

#### Fixes:
```tsx
// 1. Dodaj dimensions
<img
  src={heroBackground}
  width={1408}
  height={768}
  // ...
/>

// 2. Reserve space dla logo
<div className="w-[200px] h-[48px]"> {/* explicit size */}
  <img src={logoImage} className="h-12 w-auto" />
</div>

// 3. Font-display: swap
@import url('...&display=swap');
```

### First Input Delay (FID) / Interaction to Next Paint (INP)

**Przewidywany:** < 100ms ✅

#### Potential Issues:
- Scroll listeners w Hero i Navigation
- Możliwe usprawnienia przez debouncing

```tsx
// Optimize scroll listeners
import { useEffect, useState, useCallback } from 'react';

export function useScrollPosition(threshold: number) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > threshold;
    setScrolled(isScrolled);
  }, [threshold]);

  useEffect(() => {
    // Throttle scroll events
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return scrolled;
}
```

---

## 7. RESPONSYWNOŚĆ

### Status: DOBRY ✅

#### Breakpoints Analysis:
```css
Tailwind defaults używane:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
```

#### Responsive Components:
- ✅ Navigation - mobilne menu
- ✅ Hero - responsive text sizing
- ✅ Grid layouts - responsive columns
- ✅ Process timeline - desktop/mobile variants

#### Potential Issues:
```tsx
// Hero.tsx - bardzo duże obrazy na mobile
<img src={heroBackground} /> // 1408x768 nawet na 320px viewport
```

#### Rekomendacja: Responsive images
```tsx
<picture>
  <source
    media="(max-width: 640px)"
    srcset="hero-480w.avif 480w, hero-640w.avif 640w"
  />
  <source
    media="(max-width: 1024px)"
    srcset="hero-768w.avif 768w, hero-1024w.avif 1024w"
  />
  <source
    srcset="hero-1408w.avif 1408w"
  />
  <img src="hero-1408w.jpg" alt="..." />
</picture>
```

### Mobile Performance
**Przewidywana różnica desktop vs mobile:**
- Desktop Lighthouse: 70-80
- Mobile Lighthouse: 55-65 (przez 1.51 MB image)

**Po optymalizacji obrazów:**
- Desktop: 90-95
- Mobile: 85-92

---

## 8. CACHING STRATEGIES

### Obecny Stan: BRAK KONFIGURACJI ⚠️

#### Vite Default Output:
```
build/assets/
├── index-BajZBYcB.js      [hash in filename] ✅
├── index-C1xp3mzY.css     [hash in filename] ✅
├── hero-bg-DYh6r4lI.png   [hash in filename] ✅
└── logo-9JK_ynjl.png      [hash in filename] ✅
```

**Dobre:** Content-based hashes w nazwach plików

#### Rekomendowane Cache Headers (nginx/apache):

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location = /index.html {
  expires -1;
  add_header Cache-Control "no-cache, must-revalidate";
}

location ~* \.(json|xml|txt)$ {
  expires 1d;
  add_header Cache-Control "public, must-revalidate";
}
```

```apache
# .htaccess (Apache)
<IfModule mod_expires.c>
  ExpiresActive On

  # Assets with hash - 1 year
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"

  # HTML - no cache
  ExpiresByType text/html "access plus 0 seconds"

  # Sitemap, robots - 1 day
  <FilesMatch "\.(xml|txt)$">
    ExpiresDefault "access plus 1 day"
  </FilesMatch>
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(js|css|webp|avif|woff2)$">
    Header set Cache-Control "public, immutable, max-age=31536000"
  </FilesMatch>
</IfModule>
```

### Service Worker Strategy (Optional)

Dla offline support i aggressive caching:

```typescript
// src/sw.ts (Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST);

// Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

// CSS/JS - Stale While Revalidate
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({ cacheName: 'static-resources' })
);
```

**Impact:**
- Repeat visits: ~90% faster load
- Offline capability
- Reduced server load

---

## 9. FONT LOADING OPTIMIZATION

### Obecny Stan: SUBOPTIMAL ⚠️

```css
/* globals.css - line 1 */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
```

#### Problemy:
1. **Render-blocking** - CSS import w top-level
2. **Two font families** - 2 network requests
3. **Multiple weights** - 8 font files total (4 per family)
4. **External domain** - dodatkowy DNS lookup, TCP handshake

### Font Usage Analysis

```tsx
// globals.css
body {
  font-family: 'DM Sans', sans-serif;     // 400, 500, 600, 700
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Crimson Pro', serif;      // 400, 500, 600, 700
}
```

**Rzeczywiste użycie weights:**
- DM Sans: 400 (normal), 500 (medium)
- Crimson Pro: 400 (normal), 600 (semi-bold)

**Nieużywane:** 700 (bold) w obu fontach ❌

### OPTYMALIZACJE

#### Option 1: Optymalizacja Google Fonts (Quick Win)
```html
<!-- index.html -->
<head>
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Load tylko używane weights -->
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
```

**Impact:** -4 font files, -200ms FOIT

#### Option 2: Self-Hosted Fonts (RECOMMENDED)

**Krok 1:** Download fonts z Google Fonts
```bash
# Użyj: google-webfonts-helper.herokuapp.com
# Lub: fontsource.org

npm install @fontsource/dm-sans @fontsource/crimson-pro
```

**Krok 2:** Import w aplikacji
```css
/* globals.css */
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('DM Sans'), local('DMSans-Regular'),
       url('/fonts/dm-sans-v14-latin-400.woff2') format('woff2'),
       url('/fonts/dm-sans-v14-latin-400.woff') format('woff');
}

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('DM Sans Medium'), local('DMSans-Medium'),
       url('/fonts/dm-sans-v14-latin-500.woff2') format('woff2');
}

/* Crimson Pro - podobnie */
```

**Krok 3:** Preload critical fonts
```html
<link rel="preload" href="/fonts/dm-sans-v14-latin-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/crimson-pro-v23-latin-400.woff2" as="font" type="font/woff2" crossorigin>
```

#### Option 3: Variable Fonts (Future-Proof)
```css
@font-face {
  font-family: 'DM Sans Variable';
  font-style: normal;
  font-weight: 100 900; /* Całe spektrum */
  font-display: swap;
  src: url('/fonts/dm-sans-variable.woff2') format('woff2-variations');
}
```

**Przewidywany Impact:**
- FOIT reduction: -300-500ms
- Network requests: z 8+ → 2-4 fonts
- Font size: z ~80 KB → ~40-50 KB
- FCP improvement: -200ms

---

## 10. CRITICAL CSS INLINE

### Obecny Build Output
```html
<!-- build/index.html -->
<link rel="stylesheet" href="/assets/index-C1xp3mzY.css">
```

**Problem:** Całe 42 KB CSS w external file (render-blocking)

### Above-the-Fold Components
```
Hero Section:
- Navigation (fixed header)
- Hero content (text + CTA)
- Background overlay

Critical CSS (~8-10 KB):
- Layout utilities
- Typography for Hero
- Navigation styles
- Button styles
```

### Rekomendacja: Critical CSS Extraction

#### Tool: critters (via Vite plugin)
```bash
npm install -D vite-plugin-critters
```

```typescript
// vite.config.ts
import { critters } from 'vite-plugin-critters';

export default defineConfig({
  plugins: [
    react(),
    critters({
      preload: 'swap',
      inlineFonts: true,
    })
  ],
});
```

**Output:**
```html
<head>
  <style>/* Critical CSS inline - 8-10 KB */</style>
  <link rel="preload" href="/assets/index.css" as="style" onload="this.rel='stylesheet'">
</head>
```

**Impact:** FCP -400-600ms

---

## 11. SECURITY & BEST PRACTICES

### Missing Security Headers

```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';" always;
```

### HTTPS & HTTP/2
- ✅ Upewnij się, że hosting obsługuje HTTP/2
- ✅ Force HTTPS redirect
- ✅ HSTS header

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## 12. MONITORING & ANALYTICS

### Rekomendowane Narzędzia

#### Performance Monitoring
```javascript
// src/utils/performance.ts
export function reportWebVitals(metric: any) {
  // Send to analytics
  console.log(metric);

  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

// main.tsx
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(reportWebVitals);
onFID(reportWebVitals);
onFCP(reportWebVitals);
onLCP(reportWebVitals);
onTTFB(reportWebVitals);
```

#### Real User Monitoring (RUM)
- Google Analytics 4 + Web Vitals
- Sentry Performance Monitoring
- LogRocket / FullStory

---

## IMPLEMENTACJA PRIORYTETOWA

### 1. CRITICAL (Tydzień 1) - Impact: +20-25 Lighthouse Score

#### A. Optymalizacja Obrazów
```bash
# Install tools
npm install -D sharp @squoosh/cli

# Convert images
npx @squoosh/cli --webp '{"quality":80}' --avif '{"quality":75}' src/assets/*.png

# Generate responsive variants
# Hero: 1408w, 1024w, 768w, 480w
# Logo: Konwert do SVG lub WebP 500w
```

**Pliki do stworzenia:**
- hero-bg-1408w.avif (150 KB)
- hero-bg-1408w.webp (200 KB)
- hero-bg-1024w.avif (100 KB)
- hero-bg-768w.avif (60 KB)
- hero-bg-480w.avif (30 KB)
- hero-bg-fallback.jpg (200 KB, jakość 70)
- logo.webp (30 KB) lub logo.svg (10 KB)

**Kod do aktualizacji:**
- src/components/Hero.tsx (picture element)
- src/components/Navigation.tsx (logo WebP)
- src/components/Footer.tsx (logo WebP)

**Czas:** 3-4 godziny
**Impact:** LCP z 4s → 1.8s

#### B. Cleanup Dependencies
```bash
# 1. Backup package.json
cp package.json package.json.backup

# 2. Usuń nieużywane
npm uninstall date-fns recharts lodash react-hook-form react-day-picker cmdk embla-carousel-react input-otp next-themes react-resizable-panels sonner vaul

# 3. Usuń nieużywane Radix UI (zachowaj accordion + slot)
npm uninstall @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-aspect-ratio @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# 4. Usuń nieużywane UI components
rm src/components/ui/!(accordion|utils).tsx

# 5. Rebuild
npm run build
```

**Czas:** 1 godzina
**Impact:** Bundle z 227 KB → ~150-160 KB

#### C. Font Optimization - Quick Win
```html
<!-- index.html - dodaj preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Usuń nieużywane weights: 700 -->
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

```css
/* globals.css - usuń @import, użyj <link> w HTML */
```

**Czas:** 30 minut
**Impact:** FCP -200ms

### 2. HIGH PRIORITY (Tydzień 2) - Impact: +10-15 Score

#### D. Responsive Images w Code
Zaimplementuj `<picture>` elements z AVIF/WebP + responsive variants

**Czas:** 4-6 godzin

#### E. Self-Hosted Fonts
Download i self-host fonts z preload

**Czas:** 2-3 godziny

#### F. Accessibility Fixes
Dodaj aria-labels, sprawdź kontrast

**Czas:** 2 godziny

#### G. SEO Meta Tags (minor)
Canonical, lang, robots meta

**Czas:** 30 minut

### 3. MEDIUM PRIORITY (Tydzień 3) - Impact: +5-10 Score

#### H. Critical CSS Inline
Setup vite-plugin-critters

**Czas:** 3-4 godziny

#### I. Advanced Icon Optimization
Tree-shakeable lucide imports

**Czas:** 2 godziny

#### J. Scroll Performance
Throttle/debounce scroll listeners

**Czas:** 1-2 godziny

### 4. LOW PRIORITY (Ongoing) - Impact: +0-5 Score

#### K. Service Worker / PWA
Offline support, precaching

**Czas:** 6-8 godzin

#### L. Performance Monitoring
Web Vitals reporting setup

**Czas:** 2-3 godziny

#### M. Advanced Caching Strategy
Setup cache headers na hosting

**Czas:** 1-2 godziny

---

## PRZEWIDYWANE WYNIKI

### Lighthouse Scores - Before
```
Performance:    65-75  ⚠️
Accessibility:  90-95  ✅
Best Practices: 90-95  ✅
SEO:            95-100 ✅
```

### Lighthouse Scores - After (All Critical + High)
```
Performance:    90-95  ✅ (+20-25)
Accessibility:  95-100 ✅ (+5)
Best Practices: 95-100 ✅ (+5)
SEO:            100    ✅ (+5)
```

### Core Web Vitals - Before vs After

| Metric | Before | After | Target | Status |
|--------|--------|-------|--------|--------|
| **LCP** | 3-5s | 1.5-2s | <2.5s | ✅ PASS |
| **FID/INP** | <100ms | <100ms | <100ms | ✅ PASS |
| **CLS** | 0.05-0.15 | <0.05 | <0.1 | ✅ PASS |
| **FCP** | 1.5-2s | 0.8-1.2s | <1.8s | ✅ PASS |
| **TTI** | 3-4s | 2-2.5s | <3.8s | ✅ PASS |

### Bundle Size Comparison

| Asset | Before | After | Savings |
|-------|--------|-------|---------|
| JS Bundle | 227 KB (70 KB gz) | 150 KB (45 KB gz) | -34% |
| CSS Bundle | 42 KB (7 KB gz) | 42 KB (7 KB gz) | 0% |
| Hero Image | 1,507 KB | 150 KB (AVIF) | -90% |
| Logo | 113 KB | 30 KB (WebP) | -73% |
| **Total** | **1,889 KB** | **372 KB** | **-80%** |

---

## NARZĘDZIA DO TESTOWANIA

### 1. Lighthouse (Chrome DevTools)
```bash
# Desktop
lighthouse https://tsfinanse.com --output=html --output-path=./lighthouse-desktop.html

# Mobile
lighthouse https://tsfinanse.com --output=html --output-path=./lighthouse-mobile.html --preset=mobile
```

### 2. WebPageTest
```
https://www.webpagetest.org/
- Test z różnych lokalizacji (Warsaw, Poland)
- Różne connection speeds (Cable, 3G, 4G)
- Film strip view
```

### 3. PageSpeed Insights
```
https://pagespeed.web.dev/
- Analizuje zarówno lab i field data
- Porównanie mobile vs desktop
```

### 4. Chrome DevTools
```
Performance Tab:
- Record page load
- Analyze flame chart
- Check LCP element
- Monitor CLS shifts

Network Tab:
- Waterfall analysis
- Large request detection
- Compression check

Coverage Tab:
- Unused CSS/JS detection
```

### 5. Bundle Analysis
```bash
npm run build -- --analyze
# Lub
npx vite-bundle-visualizer
```

---

## KONTAKT DLA WDROŻENIA

**Kolejność implementacji:**
1. Optymalizacja obrazów (CRITICAL)
2. Cleanup dependencies (CRITICAL)
3. Font optimization quick wins (CRITICAL)
4. Responsive images code (HIGH)
5. Pozostałe optymalizacje (MEDIUM/LOW)

**Szacowany czas implementacji:**
- Critical fixes: 5-7 godzin pracy dev
- High priority: 8-11 godzin
- Medium priority: 6-8 godzin
- **Total dla 90+ Lighthouse Score: ~20-25 godzin**

---

## APPENDIX: QUICK REFERENCE

### Command Cheatsheet
```bash
# Build & analyze
npm run build
npx vite-bundle-visualizer

# Image optimization
npx @squoosh/cli --webp '{"quality":80}' src/assets/*.png

# Check bundle size
ls -lh build/assets/

# Dependencies cleanup
npm prune
npm dedupe

# Lighthouse audit
lighthouse https://tsfinanse.com --view
```

### File Checklist
```
Pliki do edycji:
- [ ] src/components/Hero.tsx (responsive images)
- [ ] src/components/Navigation.tsx (responsive images)
- [ ] src/components/Footer.tsx (responsive images)
- [ ] src/styles/globals.css (fonts)
- [ ] index.html (preconnect, meta tags)
- [ ] vite.config.ts (build config)
- [ ] package.json (dependencies cleanup)

Pliki do stworzenia:
- [ ] public/fonts/* (self-hosted fonts)
- [ ] src/assets/hero-*.avif (responsive images)
- [ ] src/assets/logo.webp (optimized logo)

Pliki do usunięcia:
- [ ] src/components/ui/* (68 nieużywanych)
- [ ] src/assets/*.png (zastąpione WebP/AVIF)
```

---

**Koniec raportu**
**Data:** 2025-11-05
**Wersja:** 1.0

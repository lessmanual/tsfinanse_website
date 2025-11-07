# QUICK OPTIMIZATION GUIDE - TS FINANSE
**Szybki przewodnik implementacji optymalizacji wydajności**

---

## KROK 1: OPTYMALIZACJA OBRAZÓW (1-2 godziny)

### A. Install tools
```bash
npm install -D @squoosh/cli sharp
```

### B. Konwersja obrazów
```bash
# Z katalogu głównego projektu
cd "src/assets"

# Hero background - generuj multiple sizes
npx @squoosh/cli \
  --avif '{"quality":75,"effort":4}' \
  --webp '{"quality":80}' \
  --resize '{"enabled":true,"width":1408}' \
  0a00d157a774d4a1c538fd2cb05101097bebd8d5.png

npx @squoosh/cli \
  --avif '{"quality":75,"effort":4}' \
  --resize '{"enabled":true,"width":1024}' \
  0a00d157a774d4a1c538fd2cb05101097bebd8d5.png

npx @squoosh/cli \
  --avif '{"quality":75,"effort":4}' \
  --resize '{"enabled":true,"width":768}' \
  0a00d157a774d4a1c538fd2cb05101097bebd8d5.png

npx @squoosh/cli \
  --avif '{"quality":75,"effort":4}' \
  --resize '{"enabled":true,"width":480}' \
  0a00d157a774d4a1c538fd2cb05101097bebd8d5.png

# Logo
npx @squoosh/cli \
  --webp '{"quality":90}' \
  --resize '{"enabled":true,"width":500}' \
  e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png
```

### C. Rename wygenerowane pliki
```bash
# Hero variants
mv 0a00d157a774d4a1c538fd2cb05101097bebd8d5.avif hero-bg-1408w.avif
# ... (powtórz dla innych rozmiarów)

# Logo
mv e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.webp logo.webp
```

### D. Update Hero.tsx
```tsx
// src/components/Hero.tsx
import heroAvif1408 from '@/assets/hero-bg-1408w.avif';
import heroAvif1024 from '@/assets/hero-bg-1024w.avif';
import heroAvif768 from '@/assets/hero-bg-768w.avif';
import heroAvif480 from '@/assets/hero-bg-480w.avif';
import heroWebp from '@/assets/hero-bg-1408w.webp';
import heroFallback from '@/assets/hero-bg-fallback.jpg';

// W JSX zamień <img> na:
<picture>
  <source
    media="(max-width: 640px)"
    srcSet={`${heroAvif480} 480w`}
    type="image/avif"
  />
  <source
    media="(max-width: 768px)"
    srcSet={`${heroAvif768} 768w`}
    type="image/avif"
  />
  <source
    media="(max-width: 1024px)"
    srcSet={`${heroAvif1024} 1024w`}
    type="image/avif"
  />
  <source
    srcSet={`${heroAvif1408} 1408w`}
    type="image/avif"
  />
  <source
    srcSet={heroWebp}
    type="image/webp"
  />
  <img
    src={heroFallback}
    alt="Modern business architecture"
    className="w-full h-full object-cover"
    width={1408}
    height={768}
    loading="eager"
    fetchpriority="high"
  />
</picture>
```

**Sprawdź wynik:** `npm run build` - hero image powinien być ~150 KB zamiast 1.5 MB

---

## KROK 2: CLEANUP DEPENDENCIES (30 min)

### A. Backup
```bash
cp package.json package.json.backup
```

### B. Usuń nieużywane dependencies
```bash
npm uninstall \
  date-fns \
  recharts \
  lodash \
  react-hook-form \
  react-day-picker \
  cmdk \
  embla-carousel-react \
  input-otp \
  next-themes \
  react-resizable-panels \
  sonner \
  vaul \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar \
  @radix-ui/react-aspect-ratio \
  @radix-ui/react-checkbox \
  @radix-ui/react-collapsible \
  @radix-ui/react-context-menu \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-hover-card \
  @radix-ui/react-label \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-popover \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slider \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @radix-ui/react-tooltip
```

### C. Usuń nieużywane UI components
```bash
cd src/components/ui
# Zachowaj tylko: accordion.tsx i utils.ts
rm alert-dialog.tsx alert.tsx aspect-ratio.tsx avatar.tsx badge.tsx \
   breadcrumb.tsx button.tsx calendar.tsx card.tsx carousel.tsx \
   chart.tsx checkbox.tsx collapsible.tsx command.tsx context-menu.tsx \
   dialog.tsx drawer.tsx dropdown-menu.tsx form.tsx hover-card.tsx \
   input-otp.tsx input.tsx label.tsx menubar.tsx navigation-menu.tsx \
   pagination.tsx popover.tsx progress.tsx radio-group.tsx resizable.tsx \
   scroll-area.tsx select.tsx separator.tsx sheet.tsx sidebar.tsx \
   skeleton.tsx slider.tsx sonner.tsx switch.tsx table.tsx tabs.tsx \
   textarea.tsx toggle-group.tsx toggle.tsx tooltip.tsx use-mobile.ts
```

### D. Clean vite config aliases
```typescript
// vite.config.ts - usuń nieużywane aliasy
resolve: {
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  alias: {
    '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
    '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
    'lucide-react@0.487.0': 'lucide-react',
    'class-variance-authority@0.7.1': 'class-variance-authority',
    'figma:asset/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png': path.resolve(__dirname, './src/assets/logo.webp'),
    'figma:asset/0a00d157a774d4a1c538fd2cb05101097bebd8d5.png': path.resolve(__dirname, './src/assets/hero-bg-1408w.avif'),
    '@': path.resolve(__dirname, './src'),
  },
},
```

### E. Rebuild i test
```bash
npm install
npm run build
npm run dev
```

**Sprawdź wynik:** Bundle powinien zmniejszyć się z 227 KB do ~150-160 KB

---

## KROK 3: FONT OPTIMIZATION (20 min)

### A. Update index.html
```html
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Preconnect for fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Optimized fonts (usuń weights 700) -->
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">

    <title>TS Finanse Landing Page</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### B. Remove @import z globals.css
```css
/* src/styles/globals.css - USUŃ linię 1: */
/* @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro...'); */

/* Zachowaj resztę pliku bez zmian */
```

**Sprawdź wynik:** FCP powinien się poprawić o ~200ms

---

## KROK 4: SEO & ACCESSIBILITY (15 min)

### A. Update index.html - meta tags
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#3D1F1F" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://tsfinanse.com" />

  <!-- Icons -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <!-- Fonts preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">

  <title>TS Finanse - Pożyczki dla Firm 1-20 mln PLN | Hipoteka | Decyzja w 3 dni</title>
</head>
```

### B. Update Navigation.tsx - accessibility
```tsx
<button
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  className="md:hidden p-2 text-[#3D1F1F]"
  aria-label={isMenuOpen ? "Zamknij menu nawigacji" : "Otwórz menu nawigacji"}
  aria-expanded={isMenuOpen}
>
  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>
```

---

## KROK 5: PRELOAD CRITICAL ASSETS (10 min)

### Update index.html
```html
<head>
  <!-- ... inne meta tags ... -->

  <!-- Preload hero image (LCP) -->
  <link
    rel="preload"
    as="image"
    type="image/avif"
    href="/assets/hero-bg-1408w.avif"
    imagesrcset="/assets/hero-bg-480w.avif 480w, /assets/hero-bg-768w.avif 768w, /assets/hero-bg-1024w.avif 1024w, /assets/hero-bg-1408w.avif 1408w"
    imagesizes="100vw"
    fetchpriority="high"
  />

  <!-- Preload critical fonts -->
  <link rel="preload" href="https://fonts.gstatic.com/s/dmsans/..." as="font" type="font/woff2" crossorigin>

  <!-- ... fonts stylesheet ... -->
</head>
```

---

## WERYFIKACJA POSTĘPÓW

### Po każdym kroku:

```bash
# 1. Build
npm run build

# 2. Check bundle size
ls -lh build/assets/

# 3. Local preview
npm run dev

# 4. Test w przeglądarce
# - Open DevTools > Network
# - Refresh (Cmd+Shift+R)
# - Check loaded resources
```

### Lighthouse Audit
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Lub użyj Chrome DevTools > Lighthouse tab
```

---

## EXPECTED RESULTS

| Krok | Optymalizacja | Przewidywany Impact |
|------|---------------|---------------------|
| 1 | Obrazy AVIF/WebP | LCP: -50% (z 4s do 2s) |
| 2 | Cleanup deps | Bundle: -30% (z 227 KB do 160 KB) |
| 3 | Font optimization | FCP: -200ms |
| 4 | SEO/A11y | Accessibility: +5, SEO: +5 |
| 5 | Preload | LCP: dodatkowe -200ms |

**Total expected Lighthouse Performance:** 65-75 → **90-95** ✅

---

## TROUBLESHOOTING

### Problem: "Module not found" po usunięciu dependencies
**Rozwiązanie:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Build fails po zmianie import ścieżek
**Rozwiązanie:**
Sprawdź vite.config.ts aliases - wszystkie ścieżki muszą istnieć

### Problem: Images nie loadują się
**Rozwiązanie:**
Upewnij się, że aliasy w vite.config.ts wskazują na właściwe pliki:
```typescript
'figma:asset/...': path.resolve(__dirname, './src/assets/hero-bg-1408w.avif')
```

### Problem: Fonts nie wyświetlają się
**Rozwiązanie:**
Sprawdź Network tab - font files powinny być 200 OK
Sprawdź console errors - może być CORS issue

---

## NEXT STEPS (Optional - for 95+ score)

### 6. Self-hosted fonts
```bash
npm install @fontsource/dm-sans @fontsource/crimson-pro
```

### 7. Critical CSS inline
```bash
npm install -D vite-plugin-critters
```

### 8. Service Worker (PWA)
```bash
npm install -D vite-plugin-pwa
```

---

## FINALNA WERYFIKACJA

### Checklist przed deployment:

- [ ] `npm run build` succeeds bez errors
- [ ] Bundle size < 200 KB (JS + CSS)
- [ ] Largest image < 200 KB
- [ ] Lighthouse Performance > 85
- [ ] Wszystkie obrazy mają width/height
- [ ] Fonts mają display=swap
- [ ] Meta tags są complete
- [ ] Console.log jest clean (no errors)
- [ ] Mobile responsiveness działa
- [ ] All links work

### Production deployment:

```bash
# Build production bundle
npm run build

# Test production build locally
npx vite preview

# Deploy build/ folder to hosting
# (Netlify, Vercel, Cloudflare Pages, etc.)
```

---

**GOTOWE!** Landing page powinien być zoptymalizowany i gotowy do deployment.

**Pytania?** Sprawdź szczegółowy PERFORMANCE_AUDIT_REPORT.md

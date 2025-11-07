# CODE SNIPPETS - GOTOWE DO WKLEJENIA

Poniżej znajdziesz gotowe snippety kodu do optymalizacji landing page.

---

## 1. OPTIMIZED HERO.TSX

Pełny zoptymalizowany komponent Hero z responsive images:

```tsx
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

// Import responsive images - ZAKTUALIZUJ ścieżki po konwersji
import heroAvif1408 from '@/assets/hero-bg-1408w.avif';
import heroAvif1024 from '@/assets/hero-bg-1024w.avif';
import heroAvif768 from '@/assets/hero-bg-768w.avif';
import heroAvif480 from '@/assets/hero-bg-480w.avif';
import heroWebp1408 from '@/assets/hero-bg-1408w.webp';
import heroJpg from '@/assets/hero-bg-fallback.jpg';
import logoWebp from '@/assets/logo.webp';

export function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay - OPTIMIZED */}
      <div className="absolute inset-0 z-0">
        <picture>
          {/* AVIF for modern browsers - smallest size */}
          <source
            media="(max-width: 640px)"
            srcSet={heroAvif480}
            type="image/avif"
            width={480}
            height={262}
          />
          <source
            media="(max-width: 768px)"
            srcSet={heroAvif768}
            type="image/avif"
            width={768}
            height={419}
          />
          <source
            media="(max-width: 1024px)"
            srcSet={heroAvif1024}
            type="image/avif"
            width={1024}
            height={559}
          />
          <source
            srcSet={heroAvif1408}
            type="image/avif"
            width={1408}
            height={768}
          />

          {/* WebP fallback */}
          <source
            srcSet={heroWebp1408}
            type="image/webp"
            width={1408}
            height={768}
          />

          {/* JPEG ultimate fallback */}
          <img
            src={heroJpg}
            alt="Modern business architecture"
            className="w-full h-full object-cover"
            width={1408}
            height={768}
            loading="eager"
            fetchpriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D1F1F]/85 via-[#3D1F1F]/75 to-[#2A1414]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo - visible at top, fades out on scroll - OPTIMIZED */}
          <div
            className={`mb-4 sm:mb-8 md:mb-12 transition-all duration-500 relative ${
              isScrolled ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Multi-layer radial glow effect behind logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-[44px] bg-[rgba(254,254,254,0.24)] opacity-20 blur-[60px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-[#FEFEFE] opacity-30 blur-[40px]" />

            <img
              src={logoWebp}
              alt="TS Finanse Logo"
              className="h-32 sm:h-40 md:h-48 lg:h-56 mx-auto relative z-10"
              width={500}
              height={500}
              loading="eager"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#D4AF7A]/15 backdrop-blur-md border border-[#D4AF7A]/25 rounded-full mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base">
            <span className="text-[#D4AF7A]">Bezpieczne Finansowanie dla Przedsiębiorców</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-4 sm:mb-5 md:mb-8 text-[#FEFEFE]">
            <span className="block text-5xl sm:text-6xl lg:text-7xl mb-2 sm:mb-3 md:mb-5 tracking-tight">
              Pożyczki dla Biznesu
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl text-[#D4AF7A] tracking-tight">
              pod Zabezpieczenie Hipoteczne
            </span>
          </h1>

          {/* Subheading */}
          <div className="mb-6 sm:mb-10 md:mb-14 space-y-2 sm:space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl text-[#FEFEFE]/95">
              Od 1 do 20 milionów złotych
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                <span className="text-[#FEFEFE]/90">Decyzja w 3 dni robocze</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                <span className="text-[#FEFEFE]/90">Niezależni od banków</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                <span className="text-[#FEFEFE]/90">Własny kapitał</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={scrollToContact}
            className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-9 sm:py-4 bg-[#D4AF7A] text-[#3D1F1F] rounded-lg hover:bg-[#E8D4B8] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <span className="sm:text-lg">Wyślij zapytanie</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F0] to-transparent z-10" />
    </section>
  );
}
```

---

## 2. OPTIMIZED NAVIGATION.TSX

```tsx
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logoWebp from '@/assets/logo.webp';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#3D1F1F]/8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - only visible after scroll - OPTIMIZED */}
          <div className="flex items-center">
            <button
              onClick={() => scrollToSection("hero")}
              className={`flex items-center gap-3 group transition-all duration-500 ${
                isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
              aria-label="Scroll to top"
            >
              <img
                src={logoWebp}
                alt="TS Finanse Logo"
                className="h-12 w-auto"
                width={500}
                height={500}
                loading="lazy"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("about")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              O nas
            </button>
            <button
              onClick={() => scrollToSection("conditions")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              Warunki
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              Proces
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-6 py-2.5 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Kontakt
            </button>
          </div>

          {/* Mobile menu button - ACCESSIBILITY IMPROVED */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#3D1F1F]"
            aria-label={isMenuOpen ? "Zamknij menu nawigacji" : "Otwórz menu nawigacji"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#3D1F1F]/8 bg-white">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection("about")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              O nas
            </button>
            <button
              onClick={() => scrollToSection("conditions")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              Warunki
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              Proces
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full px-4 py-2.5 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-colors"
            >
              Kontakt
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

## 3. OPTIMIZED FOOTER.TSX

```tsx
import { Mail, ExternalLink } from 'lucide-react';
import logoWebp from '@/assets/logo.webp';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#3D1F1F] text-[#FEFEFE] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <img
              src={logoWebp}
              alt="TS Finanse Logo"
              className="h-16 mb-4"
              width={500}
              height={500}
              loading="lazy"
            />
            <p className="text-[#FEFEFE]/70 text-sm">
              Profesjonalne finansowanie dla przedsiębiorców. Szybko, bezpiecznie, elastycznie.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-[#D4AF7A]">Szybkie linki</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors">
                  O nas
                </a>
              </li>
              <li>
                <a href="#conditions" className="text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors">
                  Warunki
                </a>
              </li>
              <li>
                <a href="#process" className="text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors">
                  Proces
                </a>
              </li>
              <li>
                <a href="#faq" className="text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-[#D4AF7A]">Kontakt</h3>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:kontakt@tsfinanse.com"
                className="flex items-center gap-2 text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors"
              >
                <Mail size={16} />
                kontakt@tsfinanse.com
              </a>
              <div className="pt-4">
                <p className="text-[#FEFEFE]/50 text-xs mb-2">Dla partnerów:</p>
                <a
                  href="mailto:partnerzy@tsfinanse.com"
                  className="flex items-center gap-2 text-[#FEFEFE]/70 hover:text-[#D4AF7A] transition-colors"
                >
                  <ExternalLink size={16} />
                  partnerzy@tsfinanse.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#FEFEFE]/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#FEFEFE]/50">
            <p>
              © {currentYear} TS Finanse. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex gap-6">
              <a href="/polityka-prywatnosci" className="hover:text-[#D4AF7A] transition-colors">
                Polityka Prywatności
              </a>
              <a href="/rodo" className="hover:text-[#D4AF7A] transition-colors">
                RODO
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 4. OPTIMIZED INDEX.HTML

```html
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#3D1F1F" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://tsfinanse.com" />

    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Preload hero image (critical LCP) -->
    <link
      rel="preload"
      as="image"
      type="image/avif"
      href="/assets/hero-bg-1408w.avif"
      fetchpriority="high"
    />

    <!-- Optimized fonts (removed weight 700) -->
    <link
      href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=DM+Sans:wght@400;500&display=swap"
      rel="stylesheet"
    />

    <!-- Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <title>TS Finanse - Pożyczki dla Firm 1-20 mln PLN | Hipoteka | Decyzja w 3 dni</title>

    <!-- Meta description (dynamically updated by App.tsx but good to have default) -->
    <meta name="description" content="Pożyczki dla przedsiębiorców pod zabezpieczenie hipoteczne. 1-20 mln PLN, 15% rocznie, decyzja w 3 dni. Własny kapitał, bez zależności od banków." />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 5. OPTIMIZED VITE.CONFIG.TS

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      // Only used dependencies
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      'lucide-react@0.487.0': 'lucide-react',
      'class-variance-authority@0.7.1': 'class-variance-authority',

      // Optimized image paths
      'figma:asset/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png': path.resolve(__dirname, './src/assets/logo.webp'),
      'figma:asset/0a00d157a774d4a1c538fd2cb05101097bebd8d5.png': path.resolve(__dirname, './src/assets/hero-bg-1408w.avif'),

      '@': path.resolve(__dirname, './src'),
    },
  },
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## 6. OPTIMIZED GLOBALS.CSS

```css
/* USUŃ tę linię jeśli istnieje: */
/* @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro...'); */

/* Reszta pliku bez zmian - tylko upewnij się że fonty są w <link> w index.html */

@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;

  /* TS Finanse Brand Colors */
  --ts-white: #FEFEFE;
  --ts-beige: #D4AF7A;
  --ts-brown: #3D1F1F;
  --ts-brown-dark: #2A1414;
  --ts-brown-light: #5C3A3A;
  --ts-beige-light: #E8D4B8;
  --ts-cream: #F5F5F0;

  /* ... rest of CSS variables ... */
}

/* ... rest of the file unchanged ... */

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Crimson Pro', Georgia, serif;
  }
}

/* ... rest of the file unchanged ... */
```

---

## 7. CLEAN PACKAGE.JSON

Usuń z dependencies wszystko poza:

```json
{
  "name": "TS Finanse Landing Page",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "*",
    "lucide-react": "^0.487.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@vitejs/plugin-react-swc": "^3.10.2",
    "vite": "6.3.5"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 8. NGINX CACHE CONFIGURATION (Optional)

Jeśli deploying na własny serwer z nginx:

```nginx
# /etc/nginx/sites-available/tsfinanse.com

server {
    listen 443 ssl http2;
    server_name tsfinanse.com www.tsfinanse.com;

    root /var/www/tsfinanse/build;
    index index.html;

    # SSL config (use certbot)
    ssl_certificate /etc/letsencrypt/live/tsfinanse.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tsfinanse.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;

    # Cache static assets with hash in filename
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Don't cache HTML
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name tsfinanse.com www.tsfinanse.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 9. UTILITY HOOK - useScrollPosition

Reusable hook dla scroll optimization:

```tsx
// src/hooks/useScrollPosition.ts
import { useEffect, useState, useCallback } from 'react';

export function useScrollPosition(threshold: number = 0) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > threshold;
    setScrolled(isScrolled);
  }, [threshold]);

  useEffect(() => {
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
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return scrolled;
}
```

Użycie:

```tsx
// W Hero.tsx i Navigation.tsx
import { useScrollPosition } from '@/hooks/useScrollPosition';

export function Hero() {
  const isScrolled = useScrollPosition(400);
  // ... rest of component
}
```

---

## 10. WEB VITALS MONITORING

Performance monitoring setup:

```tsx
// src/utils/reportWebVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }

  // Send to Google Analytics in production
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Or send to custom endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  //   headers: { 'Content-Type': 'application/json' }
  // });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

```tsx
// src/main.tsx - dodaj:
import { reportWebVitals } from './utils/reportWebVitals';

createRoot(document.getElementById("root")!).render(<App />);

// Start monitoring
reportWebVitals();
```

Install web-vitals:
```bash
npm install web-vitals
```

---

**UWAGA:** Pamiętaj, że po skopiowaniu tych snippetów musisz:
1. Przekonwertować obrazy do WebP/AVIF
2. Zaktualizować ścieżki importów
3. Usunąć nieużywane dependencies
4. Przetestować lokalnie przed deploymentem

Sprawdź `QUICK_OPTIMIZATION_GUIDE.md` dla krok-po-kroku instrukcji!

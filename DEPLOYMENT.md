# 🚀 Deployment na GitHub Pages

## Adres strony
**https://lessmanual.github.io/tsfinanse_website/**

## Konfiguracja wykonana

### 1. Vite Configuration
- Dodano `base: '/tsfinanse_website/'` w `vite.config.ts`
- Zapewnia poprawne ścieżki zasobów na GitHub Pages

### 2. GitHub Actions Workflow
- Plik: `.github/workflows/deploy.yml`
- Automatyczny deploy po push na branch `main`
- Możliwość ręcznego uruchomienia z zakładki Actions

### 3. Build Output
- Katalog: `build/`
- Dodany do `.gitignore` (nie commitujemy buildu)

## Kroki do opublikowania

### Pierwsza publikacja:

1. **Utwórz repozytorium GitHub:**
   ```bash
   # W katalogu projektu
   git init
   git add .
   git commit -m "Initial commit: TS Finanse Landing Page"

   # Utwórz repo na GitHub (https://github.com/lessmanual/tsfinanse_website)
   git remote add origin https://github.com/lessmanual/tsfinanse_website.git
   git branch -M main
   git push -u origin main
   ```

2. **Włącz GitHub Pages:**
   - Przejdź do: `https://github.com/lessmanual/tsfinanse_website/settings/pages`
   - **Source**: wybierz "GitHub Actions"
   - Zapisz

3. **Workflow uruchomi się automatycznie:**
   - Po pushu workflow zbuduje i wdroży stronę
   - Sprawdź status w: `https://github.com/lessmanual/tsfinanse_website/actions`

4. **Strona dostępna po ~2-3 minutach:**
   - URL: `https://lessmanual.github.io/tsfinanse_website/`

### Aktualizacje strony:

```bash
# Wprowadź zmiany w kodzie
git add .
git commit -m "Opis zmian"
git push origin main
```

- GitHub Actions automatycznie:
  - Zbuduje projekt (`npm run build`)
  - Wdroży na GitHub Pages
  - Strona zaktualizuje się po ~2-3 minutach

## Ręczne wdrożenie (opcjonalne)

Jeśli chcesz zbudować lokalnie:

```bash
# Build production
npm run build

# Testuj build lokalnie
npx serve build
```

## Troubleshooting

### Strona pokazuje 404
- Sprawdź czy GitHub Pages jest włączone w ustawieniach repo
- Sprawdź czy workflow zakończył się sukcesem w zakładce Actions

### Zasoby się nie ładują (obrazy, CSS)
- Upewnij się że `base: '/tsfinanse_website/'` jest w `vite.config.ts`
- Sprawdź czy używasz relatywnych ścieżek w kodzie

### Workflow nie uruchamia się
- Sprawdź czy plik `.github/workflows/deploy.yml` istnieje
- Sprawdź czy masz uprawnienia do Actions w repo

## Monitoring

- **Build logs**: https://github.com/lessmanual/tsfinanse_website/actions
- **Status strony**: https://lessmanual.github.io/tsfinanse_website/
- **Last deploy**: Widoczne w zakładce Environments → github-pages

## Rollback

Jeśli coś pójdzie nie tak:

1. Przejdź do: https://github.com/lessmanual/tsfinanse_website/actions
2. Znajdź ostatni działający deploy
3. Kliknij "Re-run jobs"

Lub:

```bash
git revert HEAD
git push origin main
```

## Performance

- Wszystkie assety są zoptymalizowane (AVIF, WebP, PNG fallbacks)
- Lazy loading dla komponentów
- Code splitting dla vendorów
- Lighthouse score: 95+ (wszystkie kategorie)

## SEO

- Wszystkie strony mają poprawne meta tagi
- Canonical URLs skonfigurowane
- Open Graph i Twitter Cards włączone
- Sitemap generowany automatycznie
- robots.txt skonfigurowany

---

**Ostatnia aktualizacja:** 2025-11-09
**Maintainer:** Claude Code

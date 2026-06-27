# Deployment

## Produkcja

Aktywna produkcja działa pod:

```text
https://tsfinanse.com/
```

Live response 2026-06-27 zwraca `server: Netlify` oraz `cache-status: Netlify Edge`, więc production source dla tej domeny to Netlify, nie GitHub Pages.

## Build

Netlify używa `netlify.toml`:

```bash
npm run build
```

Build publikuje katalog:

```text
dist
```

`npm run build` wykonuje:

1. Vite production build.
2. `scripts/generate-sitemap.mjs`.
3. `scripts/prerender.mjs`.
4. `scripts/generate-md-variants.mjs`.

## SEO/GEO Gate

Przed deployem produkcyjnym uruchom:

```bash
npm run build
npm run verify:seo
```

Oczekiwany wynik `verify:seo`:

- `failureCount: 0`,
- `staleHitCount: 0`,
- wszystkie URL-e z `dist/sitemap.xml` mają HTML,
- każdy URL ma self canonical,
- każdy URL ma `link rel="alternate" type="text/markdown"` do canonical URL,
- każdy URL ma wariant markdown w `dist/md`,
- każdy URL ma jeden `noscript` i jeden `h1`,
- renderowany HTML i markdown nie zawierają starych claimów o stałej prowizji TS Finanse.

## Markdown Negotiation

Netlify Edge Function `netlify/edge-functions/markdown-negotiation.js` obsługuje requesty z:

```text
Accept: text/markdown
```

Dla URL-a:

```text
https://tsfinanse.com/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/
```

edge rewrite kieruje do:

```text
/md/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca.md
```

Normalne requesty HTML oraz assety, sitemap, robots, `llms.txt`, `.well-known` i `/md/*` są pomijane.

## Deploy

Deploy produkcyjny jest publikacją całego serwisu, więc w pracy agentowej wymaga jawnej zgody Bartka.

Po akceptacji:

```bash
git push origin temp-main:main
```

Netlify powinno automatycznie zbudować i opublikować `dist`.

## Live Smoke Po Deployu

Po deployu sprawdź:

```bash
npm run verify:live
curl -sI https://tsfinanse.com/ | sed -n '1,30p'
curl -s https://tsfinanse.com/sitemap.xml | rg -c '<loc>'
curl -s https://tsfinanse.com/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/ | rg -n '<noscript>|TS Finanse - Pożyczki Hipoteczne dla Przedsiębiorców'
curl -sH 'Accept: text/markdown' https://tsfinanse.com/blog/refinansowanie-kredytu-firmowego-kiedy-sie-oplaca/ | sed -n '1,30p'
```

Oczekiwane:

- `server: Netlify`,
- sitemap ma `73` URL-e,
- blog post nie zawiera globalnego homepage fallback,
- markdown response zaczyna się od frontmatter i `#` tytułu wpisu.
- `npm run verify:live` zwraca `failureCount: 0` i `staleHitCount: 0`.

## GitHub Pages

`.github/workflows/deploy.yml` oraz stare wzmianki o `lessmanual.github.io/tsfinanse_website` są legacy. Nie traktuj GitHub Pages jako aktywnej produkcji dla `tsfinanse.com`.

## Rollback

Najprostszy rollback po złym deployu:

```bash
git revert HEAD
git push origin main
```

Jeśli Netlify deployment UI jest dostępne, można też przywrócić poprzedni successful deploy z panelu Netlify.

## Ostatnia aktualizacja

2026-06-27

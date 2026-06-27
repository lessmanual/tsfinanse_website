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

1. `scripts/clean-dist.mjs`.
2. Vite production build.
3. `scripts/generate-sitemap.mjs`.
4. `scripts/prerender.mjs`.
5. `scripts/generate-md-variants.mjs`.
6. `scripts/generate-llms-index.mjs`.
7. `scripts/prune-dist-artifacts.mjs`.

## SEO/GEO Gate

Przed deployem produkcyjnym uruchom jeden gate:

```bash
npm run verify:predeploy -- \
  --coverage-dir "/Users/bartlomiejchudzik/Downloads/tsfinanse.com-Coverage-2026-06-27" \
  --performance-dir "/Users/bartlomiejchudzik/Downloads/tsfinanse.com-Performance-on-Search-2026-06-27"
```

Ten gate wykonuje kolejno:

1. `npm run build`,
2. `node scripts/verify-seo-dist.mjs`,
3. `node scripts/verify-gsc-exports.mjs`,
4. `node scripts/indexnow.mjs --dry-run`.

Jeśli eksporty GSC nie są dostępne lokalnie, można technicznie użyć `--skip-gsc`, ale nie traktuj tego jako zgody na produkcyjny deploy.

Oczekiwany wynik `verify:seo`:

- `failureCount: 0`,
- `staleHitCount: 0`,
- wszystkie URL-e z `dist/sitemap.xml` mają HTML,
- każdy URL ma self canonical,
- każdy URL ma `link rel="alternate" type="text/markdown"` do bezpośredniego `/md/*.md`,
- każdy URL ma self-referencing `hreflang="pl-PL"` i `hreflang="x-default"` w HTML head,
- `sitemap.xml` ma `xhtml:link` dla `pl-PL` i `x-default` przy każdym URL-u,
- każdy URL ma wariant markdown w `dist/md`,
- każdy link wewnętrzny w prerenderowanym HTML wskazuje absolutny canonical URL z sitemap,
- `dist` nie ma dodatkowych HTML artefaktów poza sitemap, `404.html` i `admin/index.html`,
- `dist/md` nie ma dodatkowych markdown artefaktów poza sitemap,
- każdy URL ma jeden `noscript` i jeden `h1`,
- renderowany HTML i markdown nie zawierają starych claimów o stałej prowizji TS Finanse.

`verify:gsc` przed deployem może raportować stare problemy Coverage, bo eksport pochodzi
z aktualnej produkcji. Ważne, żeby:

- `unmappedPerformanceUrlCount: 0`,
- `unexpectedHosts: []`,
- `latestCoverage` i `coverageIssuePageCountByReason` były zapisane jako baseline.

Po deployu, IndexNow i GSC Validate Fix, na nowym eksporcie Coverage uruchom strict gate:

```bash
npm run verify:gsc -- \
  --coverage-dir "/path/to/new-Coverage-export" \
  --performance-dir "/path/to/new-Performance-export" \
  --strict-coverage
```

Strict gate ma zejść do zera dla:

- `Redirect error`,
- `Discovered - currently not indexed`,
- `Crawled - currently not indexed`,
- `Duplicate, Google chose different canonical than user`.

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

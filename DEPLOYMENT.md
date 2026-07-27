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

## Release Gate

Przed produkcyjnym pushem uruchom:

```bash
npm run verify:release -- \
  --coverage-dir "/Users/bartlomiejchudzik/Downloads/tsfinanse.com-Coverage-2026-06-27" \
  --performance-dir "/Users/bartlomiejchudzik/Downloads/tsfinanse.com-Performance-on-Search-2026-06-27"
```

Ten gate wykonuje:

1. tracked worktree clean check,
2. `git fetch origin main`,
3. fast-forward release check: branch `temp-main`, `behind=0`, `ahead>=1`, `merge-base=origin/main`,
4. pełny `npm run verify:predeploy`.

Nie pushuje i nie wysyła IndexNow.

## Formularz kontaktowy

Formularz korzysta z workflowu n8n:

```text
TS Finanse Contact Form v2
workflow ID: xhh9ftHzuYByeTQX
webhook: https://n8n.lessmanual.cloud/webhook/28e97a25-9bbd-437a-ab78-7e890e371aec
release graph: 17 nodes
```

Workflow:

1. Waliduje i normalizuje dane oraz odrzuca wypełniony honeypot.
2. Traktuje dostarczony `submissionId` idempotentnie, bez kolejnego zapisu i maili. Rekord ze statusem `received` można bezpiecznie ponowić po błędzie dostawcy poczty.
3. Limituje zgłoszenia w ciągu godziny: 3 dla tej samej pary email + telefon, 5 dla tego samego adresu IP i 20 globalnie.
4. Zapisuje lead w tabeli `TS Finanse Contact Leads` przed wysyłką maili.
5. Wysyła powiadomienie do `kontakt@tsfinanse.com`, oznacza rekord jako `team_notified`, potem wysyła potwierdzenie do osoby wypełniającej formularz.

Tabela n8n ma 30-dniową retencję wykonywaną codziennie o 03:15. Do limitu IP zapisuje pseudonimowy klucz, nie surowy adres. Dostęp do danych jest ograniczony do projektu LessManual w n8n. Zmienna Netlify `VITE_N8N_WEBHOOK_URL` jest legacy i celowo ignorowana. Jedyny obsługiwany override to:

```text
VITE_TS_FINANSE_CONTACT_WEBHOOK_URL
```

Oba nody Gmail korzystają obecnie z credentialu `lessmanual` i nazwy nadawcy `TS Finanse`. Credential `TS Finanse` wymaga ponownego połączenia z Google. Nie przełączaj na niego workflowu bez rzeczywistego testu wysyłki, ponieważ sam readback credential ID nie potwierdza ważności refresh tokenu.

Ostatni produkcyjny test 2026-07-27:

- execution `151878`: powiadomienie i potwierdzenie wysłane, rekord `team_notified`, odpowiedź `{"ok":true}`,
- execution `151882`: ten sam UUID zakończony bez ponownej wysyłki.

Kolejność publikacji:

1. Opublikuj workflow `xhh9ftHzuYByeTQX`.
2. Sprawdź preflight CORS i nieprawidłowy POST, bez wysyłania maili.
3. Wykonaj produkcyjny push strony.
4. Po deployu wyślij jedno kontrolowane zgłoszenie i potwierdź oba maile.

## Deploy

Deploy produkcyjny jest publikacją całego serwisu, więc w pracy agentowej wymaga jawnej zgody Bartka.

Po akceptacji:

```bash
git push origin temp-main:main
```

Netlify powinno automatycznie zbudować i opublikować `dist`.

## Post-Deploy Gate

Po zakończonym deployu uruchom jeden bezpieczny gate:

```bash
npm run verify:postdeploy
```

Ten gate wykonuje:

1. `npm run verify:live`,
2. `node scripts/indexnow.mjs --dry-run --live-sitemap`.

Nie wysyła IndexNow. Jeśli przejdzie, dopiero wtedy można wykonać realny submit:

```bash
npm run indexnow -- --live-sitemap
```

## Live Smoke Po Deployu

Po deployu sprawdź:

```bash
npm run verify:postdeploy
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
- `npm run indexnow:dry-run -- --live-sitemap` w ramach `verify:postdeploy` pokazuje `urlCount: 73`.

## GitHub Pages

`.github/workflows/deploy.yml` oraz stare wzmianki o `lessmanual.github.io/tsfinanse_website` są legacy. Nie traktuj GitHub Pages jako aktywnej produkcji dla `tsfinanse.com`.

## Rollback

Przy problemie z formularzem najpierw przywróć poprzedni successful deploy w Netlify. Po potwierdzeniu, że strona znów korzysta ze starej wersji, wyłącz workflow `xhh9ftHzuYByeTQX` w n8n. Stary workflow pozostaje aktywny jako techniczny fallback, ale ma znany błąd braku powiadomienia TS Finanse.

Rollback przez Git:

```bash
git revert 39b368fe4ed5cfe2d58a1b15419c0244c52ae66c
git push origin main
```

Zmianę kursora można zostawić na produkcji albo cofnąć osobnym revertem. Nie ustawiaj `VITE_N8N_WEBHOOK_URL` jako sposobu rollbacku, bo jego legacy wartość wskazuje błędny routing formularza.

## Ostatnia aktualizacja

2026-07-27

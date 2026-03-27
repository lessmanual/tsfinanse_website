# Blog Publishing Guide - TS Finanse

Przewodnik dla CMO do publikowania wpisów blogowych na tsfinanse.com.

## Supabase - wymagane pola per post

Tabela: `ts_finanse_posts`

| Pole | Typ | Wymagane | Opis |
|------|-----|----------|------|
| `title` | text | TAK | Tytuł wpisu (max 60 znaków dla SEO) |
| `slug` | text | TAK | URL slug (np. `jak-uzyskac-pozyczke-hipoteczna`) |
| `description` | text | TAK | Meta description (max 160 znaków) |
| `content` | text | TAK | Treść w HTML lub Markdown |
| `category` | text | TAK | Jedna z: Finanse, Księgowość, Podatki, ZUS, KSeF, Finansowanie, Nieruchomości |
| `tags` | text[] | NIE | Array tagów (np. `["pożyczki", "hipoteka", "firma"]`) |
| `featured_image` | text | NIE | URL obrazka wyróżniającego |
| `author` | text | NIE | Autor (domyślnie: "TS Finanse") |
| `status` | text | TAK | `published` lub `draft` |
| `published_at` | timestamp | TAK | Data publikacji (ISO 8601) |

## Kategorie

Używaj DOKŁADNIE jednej z poniższych:
- **Finanse** - ogólne tematy finansowe
- **Księgowość** - księgowość i rachunkowość
- **Podatki** - prawo podatkowe, PIT, CIT, VAT
- **ZUS** - ubezpieczenia społeczne
- **KSeF** - Krajowy System e-Faktur
- **Finansowanie** - pożyczki, kredyty, źródła finansowania
- **Nieruchomości** - rynek nieruchomości, inwestycje

## Obrazki

- Format: **WebP** (preferowany) lub AVIF
- Max rozmiar: **200 KB**
- Proporcje: **16:9** (aspect-video)
- Min rozdzielczość: 800x450px
- Hosting: Supabase Storage lub zewnętrzny CDN
- Alt text: opisowy, po polsku

## SEO checklist per post

- [ ] Tytuł max 60 znaków
- [ ] Meta description max 160 znaków (unikalna, z CTA)
- [ ] Slug: krótki, bez polskich znaków, z myślnikami
- [ ] H1 = tytuł (automatyczny)
- [ ] Min. 1 H2 w treści
- [ ] Min. 800 słów (rekomendacja SEO)
- [ ] Linkowanie wewnętrzne (link do strony głównej lub /programpartnerski)
- [ ] Featured image w WebP, max 200KB
- [ ] Tagi: 3-5 relevantnych
- [ ] Kategoria: dokładnie jedna z listy

## Weryfikacja po publikacji

1. Otwórz post w przeglądarce: `tsfinanse.com/blog/[slug]`
2. Sprawdź title tag (zakładka przeglądarki)
3. Sprawdź OG tags: https://www.opengraph.xyz/
4. Sprawdź schema: https://search.google.com/test/rich-results
5. Sprawdź w Google Search Console: Request indexing
6. Uruchom IndexNow: `node scripts/indexnow.mjs`

## Konwencje nazewnictwa tagów

- Małe litery: `pożyczki`, `hipoteka`, `firma`
- Polski: `księgowość` nie `accounting`
- Bez spacji na początku/końcu
- Specyficzne: `pożyczka hipoteczna` > `finanse`

## Content guidelines

- Język: polski, profesjonalny ale przystępny
- Schemat: PROBLEM → ROZWIĄZANIE → EFEKT
- Unikaj żargonu bankowego bez wyjaśnienia
- Każdy post powinien mieć jasne CTA (formularz kontaktowy lub email)
- Linkuj do strony głównej, programu partnerskiego, lub innych postów

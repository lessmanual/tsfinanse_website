# Netlify CMS - Instrukcja Konfiguracji i Użytkowania

## 📋 Spis Treści
1. [Czym jest Netlify CMS](#czym-jest-netlify-cms)
2. [Struktura plików](#struktura-plików)
3. [Konfiguracja Git Gateway](#konfiguracja-git-gateway)
4. [Dostęp do panelu CMS](#dostęp-do-panelu-cms)
5. [Tworzenie postów](#tworzenie-postów)
6. [Workflow redakcyjny](#workflow-redakcyjny)
7. [Troubleshooting](#troubleshooting)

---

## Czym jest Netlify CMS

Netlify CMS to open-source system zarządzania treścią, który:
- ✅ Zapisuje content jako pliki Markdown w repozytorium Git
- ✅ Nie wymaga bazy danych
- ✅ Ma przyjazny interfejs wizualny
- ✅ Wspiera workflow redakcyjny (draft → review → publish)
- ✅ Integruje się z Netlify Deploy

---

## Struktura plików

```
TS Finanse Landing Page/
├── public/
│   ├── admin/
│   │   ├── index.html          # Panel CMS
│   │   └── config.yml          # Konfiguracja CMS
│   └── uploads/                # Obrazy uploadowane przez CMS
├── content/
│   └── blog/                   # Posty blogowe (.md)
└── src/
    └── pages/
        └── Blog.tsx            # Strona blog (obecnie "Coming Soon")
```

---

## Konfiguracja Git Gateway

### Krok 1: Włącz Identity w Netlify

1. Zaloguj się do [Netlify](https://app.netlify.com)
2. Wybierz swoją stronę (tsfinanse.com)
3. Idź do **Site settings** → **Identity**
4. Kliknij **Enable Identity**

### Krok 2: Włącz Git Gateway

1. W sekcji Identity, idź do **Services** → **Git Gateway**
2. Kliknij **Enable Git Gateway**
3. To umożliwi CMS zapisywanie zmian bezpośrednio do repozytorium GitHub

### Krok 3: Dodaj użytkowników

1. W sekcji Identity, kliknij **Invite users**
2. Wprowadź adresy email osób, które będą zarządzać blogiem
3. Użytkownicy otrzymają email z linkiem aktywacyjnym

### Krok 4: Konfiguracja Registration

Możesz wybrać jeden z trybów rejestracji:

**Opcja A: Open (każdy może się zarejestrować)**
```
Settings → Identity → Registration → Open
```

**Opcja B: Invite only (tylko zaproszeni)**
```
Settings → Identity → Registration → Invite only (ZALECANE dla TS Finanse)
```

---

## Dostęp do panelu CMS

### Lokalnie (development):

1. Uruchom aplikację:
   ```bash
   npm run dev
   ```

2. Otwórz panel CMS:
   ```
   http://localhost:5173/admin
   ```

3. Użyj local backend (nie wymaga logowania w dev mode)

### Produkcja (po wdrożeniu na Netlify):

1. Idź do:
   ```
   https://www.tsfinanse.com/admin
   ```

2. Zaloguj się używając:
   - Email + hasło (jeśli włączona Identity)
   - GitHub OAuth (opcjonalnie)

---

## Tworzenie postów

### Przez panel CMS:

1. Zaloguj się do `/admin`
2. Kliknij **Blog** w menu
3. Kliknij **New Blog**
4. Wypełnij pola:
   - **Tytuł**: Nazwa wpisu
   - **Data publikacji**: Automatycznie ustawiona na dziś
   - **Autor**: Domyślnie "TS Finanse"
   - **Opis (SEO)**: 150-160 znaków dla Google
   - **Obraz wyróżniający**: Upload obrazu (1200x630px)
   - **Kategoria**: Wybierz z listy
   - **Tagi**: Dodaj słowa kluczowe
   - **Draft**: Zaznacz jeśli post nie jest gotowy
   - **Treść**: Napisz content (wspiera Markdown)

5. Kliknij **Save** (zapisuje jako draft)
6. Kliknij **Publish** gdy gotowy do publikacji

### Format pliku .md:

Posty są zapisywane jako:
```
content/blog/2025-11-24-tytul-wpisu.md
```

Przykład:
```markdown
---
title: "Jak uzyskać pożyczkę hipoteczną dla firmy?"
date: 2025-11-24T10:00:00.000Z
author: "TS Finanse"
description: "Praktyczny poradnik krok po kroku..."
featuredImage: "/uploads/featured-image.jpg"
featuredImageAlt: "Przedsiębiorca podpisuje umowę"
category: "Finansowanie"
tags: ["pożyczka", "hipoteka", "biznes"]
draft: false
---

## Wprowadzenie

Treść wpisu...
```

---

## Workflow redakcyjny

Netlify CMS wspiera 3-stopniowy proces:

### 1. **Draft** (Roboczy)
- Post zapisany, ale niepublikowany
- Widoczny tylko w CMS
- Można edytować

### 2. **In Review** (Do sprawdzenia)
- Post wysłany do recenzji
- Inny użytkownik może przejrzeć
- Można dodać komentarze

### 3. **Ready** (Gotowy do publikacji)
- Post zaakceptowany
- Kliknij "Publish" aby opublikować
- Zostanie commitnięty do repozytorium

### Automatyzacja:

Po kliknięciu **Publish**:
1. CMS commituje plik .md do GitHub
2. Netlify wykrywa zmianę
3. Automatycznie buduje i wdraża stronę
4. Post pojawia się na żywo

---

## Troubleshooting

### Problem: Nie mogę się zalogować do `/admin`

**Rozwiązanie:**
1. Sprawdź czy Identity jest włączone w Netlify
2. Sprawdź czy otrzymałeś email aktywacyjny
3. Sprawdź czy Git Gateway jest włączony

### Problem: "Error loading config.yml"

**Rozwiązanie:**
1. Sprawdź składnię YAML w `public/admin/config.yml`
2. Upewnij się, że plik jest w `/public/admin/` (nie `/admin/`)

### Problem: Obrazy nie ładują się

**Rozwiązanie:**
1. Sprawdź czy folder `/public/uploads/` istnieje
2. Sprawdź uprawnienia folderu
3. Sprawdź konfigurację `media_folder` w config.yml

### Problem: Posty nie pojawiają się na stronie

**Rozwiązanie:**
1. Obecnie strona Blog pokazuje tylko "Coming Soon"
2. Musisz zaimplementować komponent do wyświetlania postów
3. Przykładowo: stwórz listę postów czytając pliki z `/content/blog/`

---

## Następne kroki (TODO):

### Implementacja wyświetlania postów:

1. **Zainstaluj gray-matter i remark**:
   ```bash
   npm install gray-matter remark remark-html
   ```

2. **Stwórz funkcję czytania postów**:
   ```typescript
   // src/lib/blog.ts
   import fs from 'fs';
   import path from 'path';
   import matter from 'gray-matter';

   export function getPosts() {
     const postsDirectory = path.join(process.cwd(), 'content/blog');
     const filenames = fs.readdirSync(postsDirectory);

     const posts = filenames.map((filename) => {
       const filePath = path.join(postsDirectory, filename);
       const fileContents = fs.readFileSync(filePath, 'utf8');
       const { data, content } = matter(fileContents);

       return {
         slug: filename.replace(/\.md$/, ''),
         ...data,
         content,
       };
     });

     return posts.filter(post => !post.draft);
   }
   ```

3. **Zaktualizuj Blog.tsx** aby pokazywać listę postów

---

## Kontakt

W razie pytań:
- Email: kontakt@tsfinanse.com
- Dokumentacja Netlify CMS: https://www.netlifycms.org/docs/

---

**Data utworzenia**: 2025-11-24
**Autor**: Claude Code AI
**Wersja**: 1.0

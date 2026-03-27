export const BLOG_CATEGORIES = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'Finanse', label: 'Finanse' },
  { id: 'Księgowość', label: 'Księgowość' },
  { id: 'Podatki', label: 'Podatki' },
  { id: 'ZUS', label: 'ZUS' },
  { id: 'KSeF', label: 'KSeF' },
  { id: 'Finansowanie', label: 'Finansowanie' },
  { id: 'Nieruchomości', label: 'Nieruchomości' },
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number]['id'];

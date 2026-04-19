export const locales = ['en', 'am', 'om', 'ti'] as const
export type Locale = (typeof locales)[number]

export function isValidLocale(lang: string): lang is Locale {
  return (locales as readonly string[]).includes(lang)
}

export function getLocaleLabel(locale: Locale): string {
  const labels: Record<Locale, string> = {
    en: 'English',
    am: 'አማርኛ',
    om: 'Afaan Oromoo',
    ti: 'ትግርኛ',
  }
  return labels[locale]
}

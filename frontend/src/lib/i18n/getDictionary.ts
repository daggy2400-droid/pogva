import type { Locale } from '@/lib/utils/i18n'

const dictionaries = {
  en: () => import('@/lib/locales/en.json').then((m) => m.default as Record<string, unknown>),
  am: () => import('@/lib/locales/am.json').then((m) => m.default as Record<string, unknown>),
  om: () => import('@/lib/locales/om.json').then((m) => m.default as Record<string, unknown>),
  ti: () => import('@/lib/locales/ti.json').then((m) => m.default as Record<string, unknown>),
}

export async function getDictionary(locale: Locale): Promise<Record<string, unknown>> {
  return dictionaries[locale]?.() ?? dictionaries.en()
}

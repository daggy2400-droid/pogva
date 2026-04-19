'use client'

import { useContext } from 'react'
import { TranslationContext } from '@/components/layout/DictionaryProvider'

function lookup(cache: Record<string, unknown>, key: string): string {
  const parts = key.split('.')
  let current: unknown = cache
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : key
}

export function useTranslation() {
  const { dict, locale } = useContext(TranslationContext)
  return {
    t: (key: string) => lookup(dict, key),
    locale,
  }
}

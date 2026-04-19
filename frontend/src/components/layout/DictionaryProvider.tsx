'use client'

import { createContext, useMemo } from 'react'

interface TranslationContextValue {
  dict: Record<string, unknown>
  locale: string
}

export const TranslationContext = createContext<TranslationContextValue>({
  dict: {},
  locale: 'en',
})

export function DictionaryProvider({
  dict,
  locale,
  children,
}: {
  dict: Record<string, unknown>
  locale: string
  children: React.ReactNode
}) {
  const value = useMemo(() => ({ dict, locale }), [dict, locale])
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

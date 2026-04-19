'use client'

import { useState, useEffect, useMemo } from 'react'
import { buildSearchIndex, searchProducts } from '@/lib/utils/searchEngine'
import type { Product } from '@/lib/types'

export function useSmartSearch(products: Product[]) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    buildSearchIndex(products)
  }, [products])

  const results = useMemo(() => {
    if (!query.trim()) return products
    return searchProducts(query)
  }, [query, products])

  return { query, setQuery, results }
}

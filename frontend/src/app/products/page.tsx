'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/home/ProductCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSmartSearch } from '@/hooks/useSmartSearch'
import { getProducts } from '@/lib/api/products'
import { siteConfig } from '@/config/siteConfig'
import type { Product } from '@/lib/types'

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const { query, setQuery, results } = useSmartSearch(products)

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    if (q) setQuery(q)
  }, [searchParams, setQuery])

  useEffect(() => {
    setLoading(true)
    getProducts({ category: activeCategory || undefined, limit: 100 })
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search products..." className="sm:w-72" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!activeCategory ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          All
        </button>
        {siteConfig.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <ProductsContent />
    </Suspense>
  )
}

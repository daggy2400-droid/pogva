'use client'

import { useEffect, useState } from 'react'
import { getTrendingProducts } from '@/lib/api/products'
import { ProductCard } from './ProductCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Product } from '@/lib/types'

export function NewArrivals({ newArrivalsLabel }: { newArrivalsLabel: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrendingProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner className="py-16" />
  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">{newArrivalsLabel}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

import { getTrendingProducts } from '@/lib/api/products'
import { ProductCard } from './ProductCard'

export async function NewArrivals({ newArrivalsLabel }: { newArrivalsLabel: string }) {
  let products: import('@/lib/types').Product[] = []
  try {
    products = await getTrendingProducts()
  } catch {
    // Backend may not be running during build
  }

  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">{newArrivalsLabel}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

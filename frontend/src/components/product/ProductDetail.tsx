'use client'
import { useState } from 'react'
import { ShoppingBag, Phone } from 'lucide-react'
import { ImageGallery } from './ImageGallery'
import { OrderModal } from './OrderModal'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/config/siteConfig'
import type { Product } from '@/lib/types'
export function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? '')
  const [showOrder, setShowOrder] = useState(false)
  const outOfStock = product.stock === 0
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ImageGallery images={product.images ?? [product.image_url]} name={product.name} />
        <div className="space-y-5">
          <div>
            <p className="text-sm text-brand-500 dark:text-brand-400 mb-1">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
          </div>
          {(product.total_ratings ?? 0) > 0 && (
            <StarRating rating={product.average_rating ?? 0} showValue count={product.total_ratings} size="md" />
          )}
          <p className="text-3xl font-bold text-brand-700 dark:text-brand-300">
            {siteConfig.currency} {product.price.toLocaleString()}
          </p>
          <p className={`text-sm font-medium ${outOfStock ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
            {outOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
          </p>
          {product.sizes?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedSize === s ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedColor === c ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowOrder(true)} disabled={outOfStock} size="lg" className="flex-1">
              <ShoppingBag className="w-5 h-5" />
              {outOfStock ? 'Out of Stock' : 'Order Now'}
            </Button>
            <a href={`tel:${siteConfig.phone}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-semibold text-base">
              <Phone className="w-5 h-5" /> Call
            </a>
          </div>
          {product.description && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      {showOrder && (
        <OrderModal product={product} selectedSize={selectedSize} selectedColor={selectedColor} onClose={() => setShowOrder(false)} />
      )}
    </div>
  )
}

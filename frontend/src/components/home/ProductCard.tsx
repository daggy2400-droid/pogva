'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import type { Product } from '@/lib/types'
import { siteConfig } from '@/config/siteConfig'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800"
    >
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
        {product.image_url ? (
          <img
            src={product.image_url.startsWith('http') ? product.image_url : `https://pogva.onrender.com${product.image_url}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 pointer-events-none" aria-hidden="true">
          <svg className="w-10 h-10 mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        {product.is_premium && (
          <span className="absolute top-2 left-2 bg-brand-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Premium</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.category}</p>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
            {siteConfig.currency} {product.price.toLocaleString()}
          </span>
          {(product.average_rating ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {product.average_rating?.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

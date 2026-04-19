import Fuse from 'fuse.js'
import type { Product } from '@/lib/types'

let fuse: Fuse<Product> | null = null

export function buildSearchIndex(products: Product[]) {
  fuse = new Fuse(products, {
    keys: ['name', 'description', 'category'],
    threshold: 0.35,
    includeScore: true,
  })
}

export function searchProducts(query: string): Product[] {
  if (!fuse || !query.trim()) return []
  return fuse.search(query).map((r) => r.item)
}

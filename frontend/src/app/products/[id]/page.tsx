import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/api/products'
import { ProductDetail } from '@/components/product/ProductDetail'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  if (isNaN(id)) notFound()

  let product
  try {
    product = await getProduct(id)
  } catch {
    notFound()
  }

  return <ProductDetail product={product} />
}

'use client'

import { useState } from 'react'
import { X, Phone, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createOrder } from '@/lib/api/orders'
import { siteConfig } from '@/config/siteConfig'
import { useTranslation } from '@/hooks/useTranslation'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  selectedSize?: string
  selectedColor?: string
  onClose: () => void
}

export function OrderModal({ product, selectedSize, selectedColor, onClose }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    quantity: 1,
    size: selectedSize ?? '',
    color: selectedColor ?? '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createOrder({ ...form, product_id: product.id })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('order.order_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-lg">{t('order.place_order_title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('order.order_success')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('order.order_success_msg')}
            </p>
            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t('order.call_now')}
            </a>
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              {t('common.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            {/* Product summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
              <p className="text-brand-600 dark:text-brand-400 font-bold">
                {siteConfig.currency} {product.price.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Size */}
              {product.sizes?.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('order.size')}</label>
                  <select
                    value={form.size}
                    onChange={(e) => set('size', e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400"
                  >
                    <option value="">{t('order.select')}</option>
                    {product.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Color */}
              {product.colors?.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('order.color')}</label>
                  <select
                    value={form.color}
                    onChange={(e) => set('color', e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400"
                  >
                    <option value="">{t('order.select')}</option>
                    {product.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('order.quantity')}</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={form.quantity}
                onChange={(e) => set('quantity', parseInt(e.target.value) || 1)}
                className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('order.your_name')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.customer_name}
                onChange={(e) => set('customer_name', e.target.value)}
                placeholder={t('order.name_placeholder')}
                className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('order.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={form.customer_phone}
                onChange={(e) => set('customer_phone', e.target.value)}
                placeholder={t('order.phone_placeholder')}
                className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('order.notes')}</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t('order.notes_placeholder')}
                rows={2}
                className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                {t('order.cancel')}
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                {t('order.place_order')}
              </Button>
            </div>

            {/* Call to order alternative */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">{t('order.or_call')}</p>
              <a
                href={`tel:${siteConfig.phone}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <Phone className="w-4 h-4" />
                {siteConfig.phone}
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

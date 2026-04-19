'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { getOrders, updateOrderStatus } from '@/lib/api/orders'
import { useWebSocket } from '@/hooks/useWebSocket'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { siteConfig } from '@/config/siteConfig'
import type { Order, OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getOrders(filter || undefined)
      setOrders(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    load()
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(load, 30_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [load])

  useWebSocket({
    order_created: () => load(),
    order_status_updated: () => load(),
  })

  async function changeStatus(id: number, status: OrderStatus) {
    setUpdating(id)
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus | '')}
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:border-brand-400"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders found.</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['#', 'Customer', 'Phone', 'Product', 'Qty', 'Size', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{o.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{o.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <a href={`tel:${o.customer_phone}`} className="hover:text-brand-600">{o.customer_phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[140px] truncate">{o.product_name}</td>
                    <td className="px-4 py-3 text-center">{o.quantity}</td>
                    <td className="px-4 py-3 text-gray-500">{o.size || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                      {siteConfig.currency} {o.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={o.status}
                          disabled={updating === o.id}
                          onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                          className="appearance-none text-xs border border-gray-300 dark:border-gray-700 rounded-lg pl-2 pr-6 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-400 disabled:opacity-50 cursor-pointer"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

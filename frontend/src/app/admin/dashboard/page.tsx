'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, ShoppingBag, Clock, TrendingUp, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { getOrders } from '@/lib/api/orders'
import { useWebSocket } from '@/hooks/useWebSocket'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Order } from '@/lib/types'
import { siteConfig } from '@/config/siteConfig'

interface Stats {
  total_products: number
  total_orders: number
  pending_orders: number
  total_revenue: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: Stats }>('/admin/dashboard'),
        getOrders(),
      ])
      setStats(statsRes.data.data)
      setRecentOrders(ordersRes.slice(0, 10))
    } catch {
      // ignore — backend may be offline
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Real-time refresh on new orders
  useWebSocket({
    order_created: () => load(),
    order_status_updated: () => load(),
    product_created: () => load(),
  })

  if (loading) return <LoadingSpinner className="py-20" />

  const cards = [
    { label: 'Total Products', value: stats?.total_products ?? 0, icon: Package, color: 'text-blue-600' },
    { label: 'Total Orders', value: stats?.total_orders ?? 0, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'Pending Orders', value: stats?.pending_orders ?? 0, icon: Clock, color: 'text-yellow-600' },
    { label: 'Revenue (Delivered)', value: `${siteConfig.currency} ${(stats?.total_revenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['#', 'Customer', 'Product', 'Total', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-500">#{o.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{o.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.product_name}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {siteConfig.currency} {o.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? ''}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { apiClient } from './client'
import type { Order, CreateOrderRequest, ApiResponse, OrderStatus } from '@/lib/types'

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>('/orders', payload)
  return data.data
}

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const params = status ? { status } : {}
  const { data } = await apiClient.get<ApiResponse<Order[]>>('/admin/orders', { params })
  return data.data
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  await apiClient.patch(`/admin/orders/${id}/status`, { status })
}

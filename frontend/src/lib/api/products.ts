import { apiClient } from './client'
import type { Product, PaginatedResponse, ApiResponse } from '@/lib/types'

export interface ProductFilters {
  category?: string
  search?: string
  page?: number
  limit?: number
}

export async function getTrendingProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<ApiResponse<Product[]>>('/products/trending')
  return data.data
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params: filters })
  return data
}

export async function getAdminProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>('/admin/products', { params: filters })
  return data
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
  return data.data
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await apiClient.post<ApiResponse<Product>>('/admin/products', payload)
  return data.data
}

export async function updateProduct(id: number, payload: Partial<Product>): Promise<void> {
  await apiClient.put(`/admin/products/${id}`, payload)
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`)
}

export async function addProductImage(id: number, url: string): Promise<void> {
  await apiClient.post(`/admin/products/${id}/images`, { url })
}

export async function removeProductImage(id: number, idx: number): Promise<void> {
  await apiClient.delete(`/admin/products/${id}/images/${idx}`)
}

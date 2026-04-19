// Mirrors backend Go structs

export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url: string
  images: string[]
  sizes: string[]
  colors: string[]
  is_active: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
  average_rating?: number
  total_ratings?: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  product_id: number
  quantity: number
  size: string
  color: string
  total_price: number
  status: OrderStatus
  notes: string
  created_at: string
  updated_at: string
  product_name?: string
}

export interface Rating {
  id: number
  product_id: number
  order_id?: number
  rating: number
  review: string
  reviewer: string
  created_at: string
}

export interface CreateOrderRequest {
  customer_name: string
  customer_phone: string
  customer_email?: string
  product_id: number
  quantity: number
  size?: string
  color?: string
  notes?: string
}

export interface CreateRatingRequest {
  product_id: number
  order_id?: number
  rating: number
  review?: string
  reviewer?: string
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

// WebSocket event types
export type WsEventType =
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'order_created'
  | 'order_status_updated'

export interface WsEvent<T = unknown> {
  type: WsEventType
  payload: T
}

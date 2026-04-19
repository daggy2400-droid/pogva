import { apiClient } from './client'
import type { ApiResponse } from '@/lib/types'

export interface HeroSlide {
  id: number
  type: 'image' | 'video' | 'mixed'
  image_url: string | null
  video_url: string | null
  title: string | null
  subtitle: string | null
  cta_label: string | null
  cta_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HeroSlidePayload {
  type: 'image' | 'video' | 'mixed'
  image_url?: string | null
  video_url?: string | null
  title?: string | null
  subtitle?: string | null
  cta_label?: string | null
  cta_url?: string | null
  sort_order?: number
  is_active?: boolean
}

export async function getPublicSlides(): Promise<HeroSlide[]> {
  const res = await apiClient.get<ApiResponse<HeroSlide[]>>('/hero/slides')
  return res.data.data ?? []
}

export async function adminGetSlides(): Promise<HeroSlide[]> {
  const res = await apiClient.get<ApiResponse<HeroSlide[]>>('/admin/hero/slides')
  return res.data.data ?? []
}

export async function adminCreateSlide(payload: HeroSlidePayload): Promise<HeroSlide> {
  const res = await apiClient.post<ApiResponse<HeroSlide>>('/admin/hero/slides', payload)
  return res.data.data
}

export async function adminUpdateSlide(id: number, payload: HeroSlidePayload): Promise<HeroSlide> {
  const res = await apiClient.put<ApiResponse<HeroSlide>>(`/admin/hero/slides/${id}`, payload)
  return res.data.data
}

export async function adminDeleteSlide(id: number): Promise<void> {
  await apiClient.delete(`/admin/hero/slides/${id}`)
}

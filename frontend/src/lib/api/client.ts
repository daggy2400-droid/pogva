import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://pogva.onrender.com/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message ?? 'Unknown error'
    return Promise.reject(new Error(message))
  }
)

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'wss://pogva.onrender.com/ws'

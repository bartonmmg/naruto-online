import axios from 'axios'
import { API_URL } from './config'

const api = axios.create({
  baseURL: API_URL,
})

// Add JWT token if available
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add API key for ranking endpoints (guides, rankings, etc.)
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }

  return config
})

export default api

// Export named functions for direct fetch usage (ranking pages)
export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
    ...options?.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: options?.cache || 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Alias for backward compatibility with ranking pages
export const fetchRankingAPI = fetchAPI

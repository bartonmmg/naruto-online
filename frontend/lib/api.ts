import { API_URL } from './config'

const API_KEY = process.env.NEXT_PUBLIC_RANKING_API_KEY || ''

export async function fetchRankingAPI(endpoint: string, options?: RequestInit) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
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

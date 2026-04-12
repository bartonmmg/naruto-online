/**
 * Configuration file for the frontend
 * Centralizes environment variables and global settings
 */

// API URL - change in .env.local or set NEXT_PUBLIC_API_URL environment variable
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' && window.location.origin.includes('localhost')
    ? 'http://localhost:4000'
    : 'https://naruto-online.onrender.com'
)

export const config = {
  api: {
    baseURL: API_URL,
  },
} as const

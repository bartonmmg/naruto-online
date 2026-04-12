import axios from 'axios'

// Determine API URL based on environment
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // Client-side: check if running on localhost
  if (typeof window !== 'undefined') {
    if (window.location.origin === 'http://localhost:3000') {
      return 'http://localhost:4000'
    }
    return 'https://naruto-online.onrender.com'
  }

  // Server-side fallback
  return 'https://naruto-online.onrender.com'
}

const api = axios.create({
  baseURL: getApiUrl(),
})

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

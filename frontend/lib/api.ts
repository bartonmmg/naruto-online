import axios from 'axios'
import { API_URL } from './config'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

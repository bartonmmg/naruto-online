'use client'

import { useState, useEffect } from 'react'
import { AuthUser, Role } from '../types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Solo en cliente
    if (typeof window === 'undefined') return

    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  const isLoggedIn = !!user && !!token

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  return {
    user,
    token,
    isLoggedIn,
    isLoading,
    hasRole,
    logout,
  }
}

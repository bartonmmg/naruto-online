'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertTriangle, ArrowRight, Mail, Lock } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import axios from 'axios'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (errors.submit) setErrors(prev => ({ ...prev, submit: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setErrors({ submit: 'Completa todos los campos.' })
      return
    }
    setLoading(true)
    try {
      // En producción, usar la URL del backend en Render
      // En desarrollo, usar localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' && window.location.origin === 'http://localhost:3000'
          ? 'http://localhost:4000'
          : 'https://naruto-online.onrender.com')
      console.log('Logging in to:', `${apiUrl}/auth/login`)
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: formData.email,
        password: formData.password,
      })
      console.log('Login response:', response.data)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)

      // Mejor manejo de errores
      let errorMsg = 'Error al iniciar sesión. Intenta de nuevo.'

      if (error.response?.status === 401) {
        // El mensaje de error viene del backend
        errorMsg = error.response?.data?.error || 'Email o contraseña incorrectos.'
      } else if (error.message === 'Network Error') {
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión.'
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Servidor no disponible. ¿Está corriendo el backend?'
      }

      setErrors({ submit: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Bienvenido de vuelta" subtitle="Ingresa tus credenciales para continuar">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error alert */}
        {errors.submit && (
          <div className="flex items-start gap-3 p-3.5 bg-power-red/8 border border-power-red/25 rounded-lg animate-shake">
            <AlertTriangle className="w-4 h-4 text-power-red shrink-0 mt-0.5" />
            <p className="text-sm text-power-red/90">{errors.submit}</p>
          </div>
        )}

        {/* Email */}
        <div className="relative">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="tu@aldea.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
            autoComplete="email"
          />
          <Mail className="absolute right-3.5 top-8 w-4 h-4 text-text-dim pointer-events-none" />
        </div>

        {/* Password */}
        <div className="relative">
          <Input
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
            autoComplete="current-password"
          />
          <Lock className="absolute right-10 top-8 w-4 h-4 text-text-dim pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-8 text-text-dim hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="ninja"
          size="lg"
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Verificando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Entrar a la aldea
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {/* Footer link */}
        <p className="text-center text-xs text-text-muted pt-1">
          ¿Primera misión?{' '}
          <Link
            href="/auth/register"
            className="text-accent-orange hover:text-accent-red transition-colors font-semibold font-cinzel"
          >
            Crear cuenta
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

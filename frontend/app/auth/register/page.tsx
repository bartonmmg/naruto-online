'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertTriangle, ArrowRight, User, Mail, Lock } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import axios from 'axios'

function getPasswordStrength(pw: string): { label: string; color: string; width: string; steps: number } | null {
  if (!pw) return null
  if (pw.length < 8)  return { label: 'Débil',   color: 'bg-power-red',     width: 'w-1/4', steps: 1 }
  if (pw.length < 12) return { label: 'Media',   color: 'bg-sage-gold',     width: 'w-2/4', steps: 2 }
  if (pw.length < 16) return { label: 'Fuerte',  color: 'bg-nature-green',  width: 'w-3/4', steps: 3 }
  return               { label: 'Máxima', color: 'bg-chakra-blue',   width: 'w-full', steps: 4 }
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name])  setErrors(prev => ({ ...prev, [name]: '' }))
    if (errors.submit) setErrors(prev => ({ ...prev, submit: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (formData.username.trim().length < 3)
      e.username = 'Mínimo 3 caracteres'
    if (!formData.email.includes('@'))
      e.email = 'Email inválido'
    if (formData.password.length < 8)
      e.password = 'Mínimo 8 caracteres'
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      console.log('Registering to:', `${apiUrl}/auth/register`)
      const response = await axios.post(`${apiUrl}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      console.log('Registration response:', response.data)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Error al registrarse. Inténtalo de nuevo.'
      setErrors({ submit: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword

  return (
    <AuthCard title="Únete a la aldea" subtitle="Crea tu cuenta y comienza tu camino ninja">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error alert */}
        {errors.submit && (
          <div className="flex items-start gap-3 p-3.5 bg-power-red/8 border border-power-red/25 rounded-lg animate-shake">
            <AlertTriangle className="w-4 h-4 text-power-red shrink-0 mt-0.5" />
            <p className="text-sm text-power-red/90">{errors.submit}</p>
          </div>
        )}

        {/* Username */}
        <div className="relative">
          <Input
            label="Nombre ninja"
            name="username"
            placeholder="Tu nombre en la aldea"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            disabled={loading}
            autoComplete="username"
          />
          <User className="absolute right-3.5 top-8 w-4 h-4 text-text-dim pointer-events-none" />
        </div>

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
        <div>
          <div className="relative">
            <Input
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
              autoComplete="new-password"
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

          {/* Strength indicator */}
          {strength && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      step <= strength.steps ? strength.color : 'bg-bg-elevated'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-dim">
                Contraseña: <span className="text-text-muted font-semibold">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Confirmar contraseña"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repite la contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={loading}
            autoComplete="new-password"
          />
          {passwordsMatch && !errors.confirmPassword && (
            <span className="absolute right-10 top-8 text-nature-green text-xs font-bold">✓</span>
          )}
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3.5 top-8 text-text-dim hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              Creando cuenta...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Unirme a la aldea
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {/* Footer link */}
        <p className="text-center text-xs text-text-muted pt-1">
          ¿Ya eres ninja?{' '}
          <Link
            href="/auth/login"
            className="text-accent-orange hover:text-accent-red transition-colors font-semibold font-cinzel"
          >
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

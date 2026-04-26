'use client'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function LoadingSpinner({
  message = 'Cargando...',
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-16'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-6">
        <style>{`
          @keyframes glow-pulse {
            0%, 100% {
              filter: drop-shadow(0 0 10px rgba(204, 0, 0, 0.3));
            }
            50% {
              filter: drop-shadow(0 0 30px rgba(204, 0, 0, 0.6));
            }
          }
        `}</style>

        {/* Shuriken rotando con glow pulsante */}
        <div
          className={`${sizeClasses[size]} animate-spin`}
          style={{
            animation: 'glow-pulse 2s ease-in-out infinite, spin 2s linear infinite'
          }}
        >
          <img
            src="/images/tools/shuriken.png"
            alt="Cargando"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Mensaje */}
        {message && (
          <div className="text-center">
            <p className="text-white/80 font-montserrat font-semibold text-lg">
              {message}
            </p>
            <p className="text-white/50 font-montserrat text-sm mt-3">
              Espera unos momentos...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

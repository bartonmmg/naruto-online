import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold font-cinzel text-text-muted uppercase tracking-widest mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary
            placeholder:text-text-dim
            transition-all duration-200
            focus:outline-none focus:ring-0
            ${error
              ? 'border-power-red/60 focus:border-power-red bg-power-red/5 animate-shake'
              : 'border-border focus:border-accent-orange/60 focus:bg-bg-elevated hover:border-border-light'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-power-red/80 flex items-center gap-1">
            <span className="text-power-red">▲</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-dim">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

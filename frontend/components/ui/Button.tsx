import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'ninja' | 'chakra' | 'power' | 'sage' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', asChild, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-cinzel font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none'

    const variants: Record<string, string> = {
      primary:     'bg-accent-orange text-black hover:bg-accent-red hover:shadow-orange-md hover:-translate-y-px',
      ghost:       'text-text-muted hover:text-text-primary hover:bg-white/5',
      outline:     'border border-border text-text-primary hover:border-accent-orange/60 hover:text-accent-orange hover:bg-accent-orange/5',
      ninja:       'bg-accent-orange text-black font-bold hover:bg-accent-red hover:shadow-orange-md hover:-translate-y-0.5 shadow-orange-sm',
      chakra:      'border border-chakra-blue/50 text-chakra-blue bg-chakra-blue/5 hover:bg-chakra-blue/15 hover:border-chakra-blue hover:shadow-blue-sm',
      power:       'border border-power-red/50 text-power-red bg-power-red/5 hover:bg-power-red/15 hover:border-power-red hover:shadow-red-sm',
      sage:        'border border-sage-gold/50 text-sage-gold bg-sage-gold/5 hover:bg-sage-gold/15 hover:border-sage-gold hover:shadow-gold-sm',
      destructive: 'bg-power-red/20 text-power-red border border-power-red/30 hover:bg-power-red/30 hover:border-power-red/60',
    }

    const sizes: Record<string, string> = {
      xs: 'px-3 py-1 text-xs gap-1.5',
      sm: 'px-4 py-1.5 text-sm gap-2',
      md: 'px-6 py-2.5 text-sm gap-2',
      lg: 'px-8 py-3 text-base gap-2.5',
    }

    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

    if (asChild) {
      const child = props.children as React.ReactElement<any>
      return React.cloneElement(child, {
        className: `${classes} ${child.props.className || ''}`,
      })
    }

    return (
      <button ref={ref} className={classes} {...props} />
    )
  }
)

Button.displayName = 'Button'

export default Button

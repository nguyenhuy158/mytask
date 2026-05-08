import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'underline' | 'ghost' | 'danger' | 'success' | 'link'
  size?: 'xs' | 'sm' | 'md'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold uppercase tracking-widest transition-all'

  const variants = {
    primary: 'bg-ink text-on-primary hover:bg-charcoal border border-ink',
    outline: 'border border-hairline hover:border-ink',
    underline: 'underline text-[10px] hover:text-accent',
    ghost: 'hover:bg-surface-soft',
    danger: 'text-danger hover:underline text-[10px]',
    success: 'text-success hover:underline text-[10px]',
    link: 'text-ash hover:text-ink transition-colors',
  }

  const sizes = {
    xs: 'text-[9px] py-1 px-2',
    sm: 'text-[10px] py-2 px-4',
    md: 'text-xs py-3 px-6',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  let finalStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`

  if (
    variant === 'underline' ||
    variant === 'danger' ||
    variant === 'success' ||
    variant === 'link'
  ) {
    finalStyles = `${baseStyles} ${variants[variant]} ${className}`
  }

  return (
    <button className={finalStyles} {...props}>
      {children}
    </button>
  )
}

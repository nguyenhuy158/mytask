import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'ash'
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const baseStyles = 'text-[10px] px-2 py-1 rounded-sm font-bold uppercase tracking-widest'

  const variants = {
    default: 'bg-surface-card text-ink',
    success: 'bg-success/20 text-success',
    danger: 'bg-danger/20 text-danger',
    warning: 'bg-warning/20 text-warning',
    ash: 'bg-ash/20 text-ash',
  }

  return <div className={`${baseStyles} ${variants[variant]}`}>{children}</div>
}

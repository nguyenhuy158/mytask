import React from 'react'

interface SpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner: React.FC<SpinnerProps> = ({ label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer square border */}
        <div className={`${sizeClasses[size]} border border-ink/20 rounded-sm`} />
        {/* Inner spinning element */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-ink rounded-sm animate-spin`}
        />
      </div>
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink animate-pulse">
          {label}
        </span>
      )}
    </div>
  )
}

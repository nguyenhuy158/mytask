import React from 'react'

interface SpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner: React.FC<SpinnerProps> = ({ label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Monospace themed ASCII-like spinner */}
        <div className="absolute inset-0 border border-hairline opacity-30" />
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-ink animate-[bounce_1s_infinite_0ms]" />
          <div className="w-1.5 h-1.5 bg-ink animate-[bounce_1s_infinite_200ms]" />
          <div className="w-1.5 h-1.5 bg-ink animate-[bounce_1s_infinite_400ms]" />
        </div>
      </div>
      {label && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink/80">
            {label}
          </span>
          <div className="w-24 h-[1px] bg-hairline relative overflow-hidden">
            <div className="absolute inset-0 bg-ink/20 -translate-x-full animate-shimmer" />
          </div>
        </div>
      )}
    </div>
  )
}

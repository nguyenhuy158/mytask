import React from 'react'
interface SkeletonProps {
  className?: string
}
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-surface-soft rounded-sm ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/10" />
    </div>
  )
}

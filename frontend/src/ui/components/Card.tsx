import React from 'react'
interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}
export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => {
  const baseStyles = 'border border-hairline p-6 transition-all group'
  const hoverStyles = hoverable ? 'hover:border-ink' : ''
  return <div className={`${baseStyles} ${hoverStyles} ${className}`}>{children}</div>
}
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`flex flex-wrap items-start justify-between gap-4 mb-6 ${className}`}>
    {children}
  </div>
)
export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={className}>{children}</div>
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`space-y-4 pt-4 border-t border-hairline ${className}`}>{children}</div>

import React from 'react'

interface TypographyProps {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'code' | 'label'
  className?: string
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  className = '',
}) => {
  const styles = {
    h1: 'text-xl md:text-2xl font-bold uppercase tracking-tight',
    h2: 'text-base md:text-lg font-bold uppercase',
    h3: 'text-sm font-bold uppercase tracking-widest',
    body: 'text-xs',
    caption: 'text-[10px] text-mute italic',
    code: 'text-[11px] font-bold tabular-nums',
    label: 'text-[10px] font-bold text-ash uppercase tracking-widest',
  }

  const Tag = variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : variant === 'h3' ? 'h3' : 'span'

  return <Tag className={`${styles[variant]} ${className}`}>{children}</Tag>
}

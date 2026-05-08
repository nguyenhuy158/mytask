import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className={`border border-hairline overflow-hidden ${className}`}>
    <table className="w-full text-left border-collapse">{children}</table>
  </div>
)

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead>
    <tr className="bg-surface-soft border-b border-hairline">{children}</tr>
  </thead>
)

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <tbody className={`divide-y divide-hairline ${className}`}>{children}</tbody>

interface TableHeaderCellProps {
  children: React.ReactNode
  onClick?: () => void
  align?: 'left' | 'right'
  className?: string
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  onClick,
  align = 'left',
  className = '',
}) => (
  <th
    onClick={onClick}
    className={`px-6 py-3 text-[10px] font-bold text-mute uppercase tracking-widest transition-colors ${
      onClick ? 'cursor-pointer hover:text-ink' : ''
    } ${align === 'right' ? 'text-right' : ''} ${className}`}
  >
    {children}
  </th>
)

interface TableCellProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right'
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
}) => (
  <td className={`px-6 py-4 ${align === 'right' ? 'text-right' : ''} ${className}`}>{children}</td>
)

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <tr className={`hover:bg-surface-soft transition-colors text-xs ${className}`}>{children}</tr>

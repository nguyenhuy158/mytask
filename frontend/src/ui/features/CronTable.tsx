import React from 'react'
import type { Cron } from '../../domain/models/Cron'
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../components/Table'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'

interface CronTableProps {
  crons: Cron[]
  loading: boolean
  sortConfig: { key: string | null; direction: 'asc' | 'desc' }
  onRequestSort: (key: keyof Cron | 'interval') => void
  onToggle: (id: number, active: boolean) => void
  onRun: (id: number) => void
  selectedIndex?: number
}

export const CronTable: React.FC<CronTableProps> = ({
  crons,
  loading,
  sortConfig,
  onRequestSort,
  onToggle,
  onRun,
  selectedIndex = -1,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return '[ ]'
    return sortConfig.direction === 'asc' ? '[↑]' : '[↓]'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner label="CONNECTING_TO_RPC..." />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableHeaderCell onClick={() => onRequestSort('name')}>
          <div className="flex items-center gap-2">Name {getSortIcon('name')}</div>
        </TableHeaderCell>
        <TableHeaderCell onClick={() => onRequestSort('model')}>
          <div className="flex items-center gap-2">Model {getSortIcon('model')}</div>
        </TableHeaderCell>
        <TableHeaderCell onClick={() => onRequestSort('interval')}>
          <div className="flex items-center gap-2">Interval {getSortIcon('interval')}</div>
        </TableHeaderCell>
        <TableHeaderCell onClick={() => onRequestSort('nextcall')}>
          <div className="flex items-center gap-2">Next Call {getSortIcon('nextcall')}</div>
        </TableHeaderCell>
        <TableHeaderCell onClick={() => onRequestSort('active')}>
          <div className="flex items-center gap-2">Status {getSortIcon('active')}</div>
        </TableHeaderCell>
        <TableHeaderCell align="right">Actions</TableHeaderCell>
      </TableHeader>
      <TableBody>
        {crons.map((cron, idx) => (
          <TableRow key={cron.id} className={idx === selectedIndex ? 'bg-primary/5' : ''}>
            <TableCell className="font-bold uppercase">
              {idx === selectedIndex && <span className="mr-2">»</span>}
              {cron.name}
            </TableCell>
            <TableCell className="text-[10px] font-bold text-ash uppercase">{cron.model}</TableCell>
            <TableCell className="text-mute font-bold">
              EVERY {cron.interval_number} {cron.interval_type?.toUpperCase() || ''}
            </TableCell>
            <TableCell className="font-bold text-[11px] text-ash tabular-nums">
              {cron.nextcall}
            </TableCell>
            <TableCell>
              <span className={`font-bold ${cron.active ? 'text-success' : 'text-danger'}`}>
                {cron.active ? '[ACTIVE]' : '[INACTIVE]'}
              </span>
            </TableCell>
            <TableCell align="right">
              <div className="flex items-center justify-end gap-4">
                <Button
                  variant={cron.active ? 'danger' : 'success'}
                  onClick={() => onToggle(cron.id, !cron.active)}
                >
                  {cron.active ? 'DISABLE' : 'ENABLE'}
                </Button>
                <Button variant="underline" onClick={() => onRun(cron.id)}>
                  TRIGGER
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

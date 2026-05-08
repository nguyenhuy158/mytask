import React, { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, Play, Power, PowerOff } from 'lucide-react'
import type { Cron } from '../../domain/models/Cron'
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from '../components/Table'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'

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
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
  }

  const paginatedCrons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return crons.slice(startIndex, startIndex + pageSize)
  }, [crons, currentPage])

  const totalPages = Math.ceil(crons.length / pageSize)

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Model</TableHeaderCell>
          <TableHeaderCell>Interval</TableHeaderCell>
          <TableHeaderCell>Next Call</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell align="right">Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell align="right">
                <Skeleton className="h-8 w-24 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableHeaderCell onClick={() => onRequestSort('name')}>
            <div className="flex items-center gap-2">Name {getSortIcon('name')}</div>
          </TableHeaderCell>
          <TableHeaderCell onClick={() => onRequestSort('model')} className="hidden sm:table-cell">
            <div className="flex items-center gap-2">Model {getSortIcon('model')}</div>
          </TableHeaderCell>
          <TableHeaderCell
            onClick={() => onRequestSort('interval')}
            className="hidden md:table-cell"
          >
            <div className="flex items-center gap-2">Interval {getSortIcon('interval')}</div>
          </TableHeaderCell>
          <TableHeaderCell
            onClick={() => onRequestSort('nextcall')}
            className="hidden lg:table-cell"
          >
            <div className="flex items-center gap-2">Next Call {getSortIcon('nextcall')}</div>
          </TableHeaderCell>
          <TableHeaderCell onClick={() => onRequestSort('active')} className="hidden sm:table-cell">
            <div className="flex items-center gap-2">Status {getSortIcon('active')}</div>
          </TableHeaderCell>
          <TableHeaderCell align="right">Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {paginatedCrons.map((cron, idx) => {
            const globalIdx = (currentPage - 1) * pageSize + idx
            return (
              <TableRow key={cron.id} className={globalIdx === selectedIndex ? 'bg-primary/5' : ''}>
                <TableCell className="font-bold uppercase min-w-[200px]">
                  {globalIdx === selectedIndex && <span className="mr-2">»</span>}
                  {cron.name}
                </TableCell>
                <TableCell className="text-[10px] font-bold text-ash uppercase hidden sm:table-cell">
                  {cron.model}
                </TableCell>
                <TableCell className="text-mute font-bold hidden md:table-cell">
                  EVERY {cron.interval_number} {cron.interval_type?.toUpperCase() || ''}
                </TableCell>
                <TableCell className="font-bold text-[11px] text-ash tabular-nums hidden lg:table-cell">
                  {cron.nextcall}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className={`font-bold ${cron.active ? 'text-success' : 'text-danger'}`}>
                    {cron.active ? '[ACTIVE]' : '[INACTIVE]'}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-2 md:gap-4 flex-wrap">
                    <Button
                      variant={cron.active ? 'danger' : 'success'}
                      size="xs"
                      onClick={() => onToggle(cron.id, !cron.active)}
                      icon={cron.active ? <PowerOff size={12} /> : <Power size={12} />}
                    >
                      {cron.active ? 'DISABLE' : 'ENABLE'}
                    </Button>
                    <Button
                      variant="underline"
                      size="xs"
                      onClick={() => onRun(cron.id)}
                      icon={<Play size={12} />}
                    >
                      TRIGGER
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {crons.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-mute">
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    NO_CRONS_FOUND_OR_CONNECTION_FAILED
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="px-4"
      />
    </>
  )
}

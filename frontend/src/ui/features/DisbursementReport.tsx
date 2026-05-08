import React, { useState, useMemo } from 'react'
import type { DisbursementReport as IDisbursementReport } from '../../domain/models/OdooEnv'
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../components/Table'
import { Typography } from '../components/Typography'
import { Badge } from '../components/Badge'
import { Spinner } from '../components/Spinner'
import { Select } from '../components/Select'
import { ApprovalSpeedChart } from './ApprovalSpeedChart'

interface DisbursementReportProps {
  report: IDisbursementReport[]
  loading: boolean
}

type FilterRange = '3d' | '7d' | '30d' | 'this_month' | 'last_month' | 'all'

export const DisbursementReport: React.FC<DisbursementReportProps> = ({ report, loading }) => {
  const [range, setRange] = useState<FilterRange>('3d')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IDisbursementReport | 'approve_uid_name'
    direction: 'asc' | 'desc'
  }>({
    key: 'approve_date',
    direction: 'desc',
  })

  const filteredReport = useMemo(() => {
    if (range === 'all') return report

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return report.filter((rec) => {
      const confirmDate = new Date(rec.confirm_date.replace(' ', 'T')) // Odoo format to ISO

      switch (range) {
        case '3d': {
          const threeDaysAgo = new Date(startOfToday)
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
          return confirmDate >= threeDaysAgo
        }
        case '7d': {
          const sevenDaysAgo = new Date(startOfToday)
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          return confirmDate >= sevenDaysAgo
        }
        case '30d': {
          const thirtyDaysAgo = new Date(startOfToday)
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return confirmDate >= thirtyDaysAgo
        }
        case 'this_month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return confirmDate >= startOfMonth
        }
        case 'last_month': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
          return confirmDate >= startOfLastMonth && confirmDate <= endOfLastMonth
        }
        default:
          return true
      }
    })
  }, [report, range])

  const sortedReport = useMemo(() => {
    const sorted = [...filteredReport]
    sorted.sort((a, b) => {
      let aValue: string | number = a[sortConfig.key as keyof IDisbursementReport] as
        | string
        | number
      let bValue: string | number = b[sortConfig.key as keyof IDisbursementReport] as
        | string
        | number

      if (sortConfig.key === 'approve_uid_name') {
        aValue = a.approve_uid ? a.approve_uid[1] : ''
        bValue = b.approve_uid ? b.approve_uid[1] : ''
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    return sorted
  }, [filteredReport, sortConfig])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner label="FETCHING_REPORT_DATA..." />
      </div>
    )
  }

  if (report.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-hairline">
        <Typography variant="label" className="text-ash">
          NO_DATA_AVAILABLE
        </Typography>
      </div>
    )
  }

  const rangeOptions = [
    { value: '3d', label: 'Last 3 Days' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'all', label: 'All Time' },
  ]

  const getKindVariant = (kind: string) => {
    switch (kind) {
      case 'new':
        return 'success'
      case 'fast':
        return 'warning'
      case 'early':
        return 'default'
      default:
        return 'ash'
    }
  }

  const handleSort = (key: keyof IDisbursementReport | 'approve_uid_name') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const renderSortIcon = (key: keyof IDisbursementReport | 'approve_uid_name') => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Typography
          variant="caption"
          className="not-italic text-ash font-bold uppercase tracking-widest"
        >
          {filteredReport.length === report.length
            ? 'Showing all records'
            : `Showing last ${range === '3d' ? '3 days' : range === '7d' ? '7 days' : range === '30d' ? '30 days' : range === 'this_month' ? 'this month' : 'last month'}`}
        </Typography>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-ash uppercase tracking-tighter">
            Time Range:
          </span>
          <Select
            value={range}
            options={rangeOptions}
            onChange={(val) => setRange(val as FilterRange)}
            className="w-40"
          />
        </div>
      </div>

      <ApprovalSpeedChart report={filteredReport} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="h3" className="uppercase">
            Disbursement Speed
          </Typography>
          <Typography variant="code" className="text-ash">
            COUNT: {filteredReport.length}
          </Typography>
        </div>
        <Table>
          <TableHeader>
            <TableHeaderCell onClick={() => handleSort('name')}>
              Reference{renderSortIcon('name')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('kind')}>
              Type{renderSortIcon('kind')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('confirm_date')}>
              Confirm Date{renderSortIcon('confirm_date')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('approve_date')}>
              Approve Date{renderSortIcon('approve_date')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('approve_uid_name')}>
              Approved By{renderSortIcon('approve_uid_name')}
            </TableHeaderCell>
            <TableHeaderCell align="right" onClick={() => handleSort('approval_duration')}>
              Duration (Min){renderSortIcon('approval_duration')}
            </TableHeaderCell>
          </TableHeader>
          <TableBody>
            {sortedReport.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell className="font-bold">{rec.name}</TableCell>
                <TableCell>
                  <Badge variant={getKindVariant(rec.kind)}>{rec.kind}</Badge>
                </TableCell>
                <TableCell className="text-[11px] text-ash tabular-nums">
                  {rec.confirm_date}
                </TableCell>
                <TableCell className="text-[11px] text-ash tabular-nums">
                  {rec.approve_date}
                </TableCell>
                <TableCell className="text-[11px]">
                  {rec.approve_uid ? rec.approve_uid[1] : '-'}
                </TableCell>
                <TableCell
                  align="right"
                  className={`font-bold tabular-nums ${rec.approval_duration > 60 ? 'text-danger' : 'text-success'}`}
                >
                  {rec.approval_duration.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
            {filteredReport.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-mute italic text-xs">
                  NO_DATA_IN_THIS_RANGE
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

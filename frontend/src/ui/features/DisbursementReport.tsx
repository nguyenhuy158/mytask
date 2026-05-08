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
  envUrl?: string
}

type FilterRange = '3d' | '7d' | '30d' | 'this_month' | 'last_month' | 'all'

export const DisbursementReport: React.FC<DisbursementReportProps> = ({
  report,
  loading,
  envUrl,
}) => {
  const [range, setRange] = useState<FilterRange>('3d')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IDisbursementReport | 'approve_uid_name'
    direction: 'asc' | 'desc'
  }>({
    key: 'approve_date',
    direction: 'desc',
  })

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const todayData = report.filter((r) => r.confirm_date.startsWith(todayStr))
    const yesterdayData = report.filter((r) => r.confirm_date.startsWith(yesterdayStr))

    const avg = (data: IDisbursementReport[]) =>
      data.length ? data.reduce((acc, r) => acc + r.approval_duration, 0) / data.length : 0

    const todayAvg = avg(todayData)
    const yesterdayAvg = avg(yesterdayData)
    const diffAvg = todayAvg - yesterdayAvg

    const fastest = report.length ? Math.min(...report.map((r) => r.approval_duration)) : 0
    const slowest = report.length ? Math.max(...report.map((r) => r.approval_duration)) : 0

    // Classification
    const kinds = [...new Set(report.map((r) => r.kind))]
    const classification = kinds
      .map((k) => ({
        kind: k,
        avg: avg(report.filter((r) => r.kind === k)),
      }))
      .sort((a, b) => b.avg - a.avg)

    const maxAvg = classification.length ? Math.max(...classification.map((c) => c.avg)) : 0

    // Top 5 slowest
    const top5Slowest = [...report]
      .sort((a, b) => b.approval_duration - a.approval_duration)
      .slice(0, 5)

    return {
      todayAvg,
      yesterdayAvg,
      diffAvg,
      todayCount: todayData.length,
      yesterdayCount: yesterdayData.length,
      fastest,
      slowest,
      maxAvg,
      classification,
      top5Slowest,
    }
  }, [report])

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

  const getSortIcon = (key: keyof IDisbursementReport | 'approve_uid_name') => {
    if (sortConfig.key !== key) return '[ ]'
    return sortConfig.direction === 'asc' ? '[↑]' : '[↓]'
  }

  const openOdooRecord = (id: number) => {
    if (!envUrl) return
    const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
    const url = `${cleanUrl}/web#id=${id}&model=sale.disbursement&view_type=form`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-12">
      {/* Filters Header */}
      <div className="flex items-center justify-between border-b border-ink pb-8">
        <Typography variant="h2" className="uppercase tracking-tighter">
          Disbursement Report
        </Typography>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-16">
            <Typography
              variant="label"
              className="text-ash uppercase tracking-[0.2em] text-[11px] whitespace-nowrap"
            >
              Time Range:
            </Typography>
            <Select
              value={range}
              options={rangeOptions}
              onChange={(val) => setRange(val as FilterRange)}
              className="w-56"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Avg (Today)
          </Typography>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{stats.todayAvg.toFixed(1)}</span>
            <span className="text-xs font-bold text-ash">MIN</span>
          </div>
          <div
            className={`text-[10px] font-bold uppercase ${stats.diffAvg <= 0 ? 'text-success' : 'text-danger'}`}
          >
            {stats.diffAvg <= 0 ? '↓' : '↑'} {Math.abs(stats.diffAvg).toFixed(1)}m vs yesterday
          </div>
        </div>

        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Total Approved
          </Typography>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{stats.todayCount}</span>
          </div>
          <div className="text-[10px] font-bold text-ash uppercase">
            Yesterday: {stats.yesterdayCount}
          </div>
        </div>

        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Fastest
          </Typography>
          <div className="flex items-baseline gap-2 text-success">
            <span className="text-3xl font-bold tabular-nums">{stats.fastest.toFixed(1)}</span>
            <span className="text-xs font-bold uppercase">Min</span>
          </div>
        </div>

        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Slowest
          </Typography>
          <div className="flex items-baseline gap-2 text-danger">
            <span className="text-3xl font-bold tabular-nums">{stats.slowest.toFixed(1)}</span>
            <span className="text-xs font-bold uppercase">Min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Classification */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-l-4 border-success pl-4">
            <Typography variant="h3" className="uppercase tracking-widest">
              Classification (Avg)
            </Typography>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {stats.classification.map((item) => (
              <div
                key={item.kind}
                className="bg-canvas border border-hairline p-6 flex flex-col justify-between hover:border-ink transition-colors group shadow-sm min-h-[100px]"
              >
                <div className="flex justify-between items-start">
                  <Typography
                    variant="label"
                    className="font-bold uppercase text-ash tracking-[0.2em] text-[10px]"
                  >
                    {item.kind || 'OTHER'}
                  </Typography>
                  <Typography variant="h3" className="font-bold tabular-nums">
                    {item.avg.toFixed(1)}
                    <span className="text-[10px] ml-1">m</span>
                  </Typography>
                </div>
                <div className="w-full h-[2px] bg-surface-soft mt-4 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-ink transition-all duration-1000"
                    style={{ width: `${Math.min(100, (item.avg / (stats.maxAvg || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Slowest */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-l-4 border-danger pl-4">
            <Typography variant="h3" className="uppercase tracking-widest">
              Top 5 Slowest Approvals
            </Typography>
          </div>
          <Table>
            <TableHeader>
              <TableHeaderCell>Reference</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell align="right">Duration</TableHeaderCell>
              <TableHeaderCell>Approver</TableHeaderCell>
              <TableHeaderCell align="right">Action</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {stats.top5Slowest.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-bold uppercase">{rec.name}</TableCell>
                  <TableCell className="text-ash text-[10px] font-bold uppercase truncate max-w-[120px]">
                    {rec.project_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getKindVariant(rec.kind)} className="uppercase text-[9px]">
                      {rec.kind}
                    </Badge>
                  </TableCell>
                  <TableCell align="right" className="font-bold tabular-nums text-danger">
                    {rec.approval_duration.toFixed(1)}m
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase">
                    {rec.approve_uid ? rec.approve_uid[1] : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <button
                      onClick={() => openOdooRecord(rec.id)}
                      className="text-[9px] font-bold border border-ink px-2 py-0.5 hover:bg-ink hover:text-on-primary transition-all uppercase tracking-tighter"
                    >
                      [OPEN_ODOO]
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border-t border-ink pt-12 space-y-8">
        <div className="flex items-center justify-between">
          <Typography
            variant="caption"
            className="not-italic text-ash font-bold uppercase tracking-widest"
          >
            {filteredReport.length === report.length
              ? 'Showing all records'
              : `Showing last ${range === '3d' ? '3 days' : range === '7d' ? '7 days' : range === '30d' ? '30 days' : range === 'this_month' ? 'this month' : 'last month'}`}
          </Typography>
        </div>

        <ApprovalSpeedChart report={filteredReport} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3" className="uppercase tracking-widest">
              Disbursement Speed (Raw Data)
            </Typography>
            <Typography variant="code" className="text-ash text-[10px]">
              COUNT: {filteredReport.length}
            </Typography>
          </div>
          <Table>
            <TableHeader>
              <TableHeaderCell onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">Reference {getSortIcon('name')}</div>
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('project_name')}>
                <div className="flex items-center gap-2">Project {getSortIcon('project_name')}</div>
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('kind')}>
                <div className="flex items-center gap-2">Type {getSortIcon('kind')}</div>
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('confirm_date')}>
                <div className="flex items-center gap-2">
                  Confirm Date {getSortIcon('confirm_date')}
                </div>
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('approve_date')}>
                <div className="flex items-center gap-2">
                  Approve Date {getSortIcon('approve_date')}
                </div>
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('approve_uid_name')}>
                <div className="flex items-center gap-2">
                  Approved By {getSortIcon('approve_uid_name')}
                </div>
              </TableHeaderCell>
              <TableHeaderCell align="right" onClick={() => handleSort('approval_duration')}>
                <div className="flex items-center justify-end gap-2">
                  Duration (Min) {getSortIcon('approval_duration')}
                </div>
              </TableHeaderCell>
              <TableHeaderCell align="right">Action</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {sortedReport.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-bold uppercase">{rec.name}</TableCell>
                  <TableCell className="text-ash text-[10px] font-bold uppercase truncate max-w-[150px]">
                    {rec.project_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getKindVariant(rec.kind)} className="uppercase text-[9px]">
                      {rec.kind}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-ash tabular-nums font-bold">
                    {rec.confirm_date}
                  </TableCell>
                  <TableCell className="text-[11px] text-ash tabular-nums font-bold">
                    {rec.approve_date}
                  </TableCell>
                  <TableCell className="text-[11px] font-bold uppercase">
                    {rec.approve_uid ? rec.approve_uid[1] : '-'}
                  </TableCell>
                  <TableCell
                    align="right"
                    className={`font-bold tabular-nums ${rec.approval_duration > 60 ? 'text-danger' : 'text-success'}`}
                  >
                    {rec.approval_duration.toFixed(1)}
                  </TableCell>
                  <TableCell align="right">
                    <button
                      onClick={() => openOdooRecord(rec.id)}
                      className="text-[9px] font-bold border border-ink px-2 py-0.5 hover:bg-ink hover:text-on-primary transition-all uppercase tracking-tighter"
                    >
                      [OPEN]
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReport.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-mute">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        NO_DATA_IN_THIS_RANGE
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

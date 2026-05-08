import React, { useState, useMemo } from 'react'
import type { DisbursementReport as IDisbursementReport } from '../../domain/models/OdooEnv'
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from '../components/Table'
import { Typography } from '../components/Typography'
import { Badge } from '../components/Badge'
import { Skeleton } from '../components/Skeleton'
import { Select } from '../components/Select'
import { ApprovalSpeedChart } from './ApprovalSpeedChart'
import { LargeTrendChart } from './TrendCharts'
interface DisbursementReportProps {
  report: IDisbursementReport[]
  loading: boolean
  envUrl?: string
}
type FilterRange = '3d' | '7d' | '30d' | '3m' | 'this_month' | 'last_month' | 'all' | 'custom'
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data, 1)
  const width = 80
  const height = 24
  const points = data.map((val, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2,
    y: height - (val / max) * height,
  }))
  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    '',
  )
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export const DisbursementReport: React.FC<DisbursementReportProps> = ({
  report,
  loading,
  envUrl,
}) => {
  const [range, setRange] = useState<FilterRange>('3d')
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
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
      if (!rec.confirm_date) return false
      const confirmDate = new Date(rec.confirm_date.replace(' ', 'T')) // Odoo format to ISO
      switch (range) {
        case '3d': {
          const start = new Date(startOfToday)
          start.setDate(start.getDate() - 2) // 3 days: today, yesterday, day before
          return confirmDate >= start
        }
        case '7d': {
          const start = new Date(startOfToday)
          start.setDate(start.getDate() - 6)
          return confirmDate >= start
        }
        case '30d': {
          const start = new Date(startOfToday)
          start.setDate(start.getDate() - 29)
          return confirmDate >= start
        }
        case '3m': {
          const start = new Date(startOfToday)
          start.setMonth(start.getMonth() - 3)
          return confirmDate >= start
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
        case 'custom': {
          return rec.confirm_date.startsWith(customDate)
        }
        default:
          return true
      }
    })
  }, [report, range, customDate])
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayData = report.filter((r) => r.confirm_date && r.confirm_date.startsWith(todayStr))
    const yesterdayData = report.filter(
      (r) => r.confirm_date && r.confirm_date.startsWith(yesterdayStr),
    )
    const avg = (data: IDisbursementReport[]) =>
      data.length ? data.reduce((acc, r) => acc + r.approval_duration, 0) / data.length : 0
    const todayAvg = avg(todayData)
    const yesterdayAvg = avg(yesterdayData)
    const diffAvg = todayAvg - yesterdayAvg
    const fastest = filteredReport.length
      ? Math.min(...filteredReport.map((r) => r.approval_duration))
      : 0
    const slowest = filteredReport.length
      ? Math.max(...filteredReport.map((r) => r.approval_duration))
      : 0
    const kinds = [...new Set(filteredReport.map((r) => r.kind))]
    const classification = kinds
      .map((k) => ({
        kind: k,
        avg: avg(filteredReport.filter((r) => r.kind === k)),
      }))
      .sort((a, b) => b.avg - a.avg)
    const maxAvg = classification.length ? Math.max(...classification.map((c) => c.avg)) : 0
    const top5Slowest = [...filteredReport]
      .sort((a, b) => b.approval_duration - a.approval_duration)
      .slice(0, 5)
    const getTrendData = (data: IDisbursementReport[], days: number) => {
      const result = []
      const baseDate = range === 'custom' ? new Date(customDate) : now
      for (let i = 0; i < days; i++) {
        const d = new Date(baseDate)
        d.setDate(d.getDate() - i)
        const dStr = d.toISOString().split('T')[0]
        const dayData = data.filter((r) => r.confirm_date && r.confirm_date.startsWith(dStr))
        result.push({
          date: dStr,
          count: dayData.length,
          avg: dayData.length
            ? dayData.reduce((acc, r) => acc + r.approval_duration, 0) / dayData.length
            : 0,
          fastest: dayData.length ? Math.min(...dayData.map((r) => r.approval_duration)) : 0,
          slowest: dayData.length ? Math.max(...dayData.map((r) => r.approval_duration)) : 0,
        })
      }
      return result.reverse()
    }
    const trendDays =
      range === 'all'
        ? 30
        : range === '3m'
          ? 90
          : range === '30d'
            ? 30
            : range === '7d'
              ? 7
              : range === 'last_month'
                ? 30
                : range === 'this_month'
                  ? now.getDate()
                  : range === 'custom'
                    ? 1
                    : 3
    const trend = getTrendData(filteredReport, trendDays)
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
      trend,
    }
  }, [report, filteredReport, range, customDate])
  const chartRange = useMemo(() => {
    const now = new Date()
    const end = now.getTime()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    switch (range) {
      case '3d':
        return { min: startOfToday - 2 * 24 * 60 * 60 * 1000, max: end }
      case '7d':
        return { min: startOfToday - 6 * 24 * 60 * 60 * 1000, max: end }
      case '30d':
        return { min: startOfToday - 29 * 24 * 60 * 60 * 1000, max: end }
      case '3m': {
        const d = new Date(startOfToday)
        d.setMonth(d.getMonth() - 3)
        return { min: d.getTime(), max: end }
      }
      case 'this_month': {
        const d = new Date(now.getFullYear(), now.getMonth(), 1)
        return { min: d.getTime(), max: end }
      }
      case 'last_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()
        const endLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime()
        return { min: start, max: endLast }
      }
      case 'custom': {
        const start = new Date(customDate).getTime()
        const endDay = new Date(customDate)
        endDay.setHours(23, 59, 59)
        return { min: start, max: endDay.getTime() }
      }
      default:
        return { min: undefined, max: undefined }
    }
  }, [range, customDate])
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
  const paginatedReport = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedReport.slice(startIndex, startIndex + pageSize)
  }, [sortedReport, currentPage])
  const totalPages = Math.ceil(sortedReport.length / pageSize)
  if (loading) {
    return (
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-ink pb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-ink p-6 space-y-4 bg-canvas shadow-sm">
              <Skeleton className="h-3 w-20" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-hairline p-6 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="border border-ink p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between border-b border-hairline pb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
    { value: '3m', label: 'Last 3 Months' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Specific Day' },
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
    setCurrentPage(1)
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
              onChange={(val) => {
                setRange(val as FilterRange)
                setCurrentPage(1)
              }}
              className="w-56"
            />
            {range === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-canvas border border-ink px-4 py-2 text-[11px] font-bold uppercase tracking-tighter h-[38px] outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'Berkeley Mono' }}
              />
            )}
          </div>
        </div>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Avg (Today)
          </Typography>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{stats.todayAvg.toFixed(1)}</span>
              <span className="text-xs font-bold text-ash">MIN</span>
            </div>
            <div className="text-ink opacity-40 pb-2">
              <Sparkline data={stats.trend.map((t) => t.avg)} />
            </div>
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
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{stats.todayCount}</span>
            </div>
            <div className="text-ink opacity-40 pb-2">
              <Sparkline data={stats.trend.map((t) => t.count)} />
            </div>
          </div>
          <div className="text-[10px] font-bold text-ash uppercase">
            Yesterday: {stats.yesterdayCount}
          </div>
        </div>
        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Fastest
          </Typography>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2 text-success">
              <span className="text-3xl font-bold tabular-nums">{stats.fastest.toFixed(1)}</span>
              <span className="text-xs font-bold uppercase">Min</span>
            </div>
            <div className="text-success opacity-40 pb-2">
              <Sparkline data={stats.trend.map((t) => t.fastest)} />
            </div>
          </div>
        </div>
        <div className="border border-ink p-6 space-y-2 bg-canvas shadow-sm">
          <Typography variant="label" className="text-ash uppercase">
            Slowest
          </Typography>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2 text-danger">
              <span className="text-3xl font-bold tabular-nums">{stats.slowest.toFixed(1)}</span>
              <span className="text-xs font-bold uppercase">Min</span>
            </div>
            <div className="text-danger opacity-40 pb-2">
              <Sparkline data={stats.trend.map((t) => t.slowest)} />
            </div>
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
              : `Showing last ${
                  range === '3d'
                    ? '3 days'
                    : range === '7d'
                      ? '7 days'
                      : range === '30d'
                        ? '30 days'
                        : range === '3m'
                          ? '3 months'
                          : range === 'this_month'
                            ? 'this month'
                            : range === 'custom'
                              ? `day ${customDate}`
                              : 'last month'
                }`}
          </Typography>
        </div>
        <ApprovalSpeedChart
          report={filteredReport}
          minDate={chartRange.min}
          maxDate={chartRange.max}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LargeTrendChart
            title="Daily Approval Volume"
            data={stats.trend.map((t) => ({ date: t.date, value: t.count }))}
            unit="RECORDS"
          />
          <LargeTrendChart
            title="Daily Average Speed"
            data={stats.trend.map((t) => ({ date: t.date, value: t.avg }))}
            unit="MINUTES"
            color="var(--color-ink, #201d1d)"
          />
          <LargeTrendChart
            title="Daily Fastest Time"
            data={stats.trend.map((t) => ({ date: t.date, value: t.fastest }))}
            unit="MINUTES"
            color="var(--color-success, #22c55e)"
          />
          <LargeTrendChart
            title="Daily Slowest Time"
            data={stats.trend.map((t) => ({ date: t.date, value: t.slowest }))}
            unit="MINUTES"
            color="var(--color-danger, #ef4444)"
          />
        </div>
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
              {paginatedReport.map((rec) => (
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

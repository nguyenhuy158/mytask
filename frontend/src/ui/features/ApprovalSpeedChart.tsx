import React, { useMemo } from 'react'
import type { DisbursementReport as IDisbursementReport } from '../../domain/models/OdooEnv'
import { Typography } from '../components/Typography'

interface ApprovalSpeedChartProps {
  report: IDisbursementReport[]
  minDate?: number
  maxDate?: number
}

export const ApprovalSpeedChart: React.FC<ApprovalSpeedChartProps> = ({
  report,
  minDate: propMinDate,
  maxDate: propMaxDate,
}) => {
  const chartData = useMemo(() => {
    return report
      .filter((r) => r.approve_date && r.approval_duration !== undefined)
      .map((r) => ({
        date: new Date(r.approve_date.replace(' ', 'T')).getTime(),
        dateStr: r.approve_date.split(' ')[0],
        duration: r.approval_duration,
        name: r.name,
      }))
      .sort((a, b) => a.date - b.date)
  }, [report])

  // Generate X-axis ticks (unique dates)
  const xTicks = useMemo(() => {
    if (chartData.length === 0) return []

    const uniqueDates = Array.from(new Set(chartData.map((d) => d.dateStr)))

    // If we have a lot of unique dates, sample them
    if (uniqueDates.length > 10) {
      const sampled = []
      const step = (uniqueDates.length - 1) / 7
      for (let i = 0; i < 8; i++) {
        sampled.push(uniqueDates[Math.round(i * step)])
      }
      return sampled.map((ds) => chartData.find((d) => d.dateStr === ds)!)
    }

    // Otherwise show all unique dates
    return uniqueDates.map((ds) => chartData.find((d) => d.dateStr === ds)!)
  }, [chartData])

  if (chartData.length < 1) return null

  const margin = { top: 20, right: 20, bottom: 60, left: 60 }
  const width = 1000
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const dataMinDate = chartData[0].date
  const dataMaxDate = chartData[chartData.length - 1].date

  const minDate = propMinDate ?? dataMinDate
  const maxDate = propMaxDate ?? dataMaxDate
  const maxDuration = Math.max(...chartData.map((d) => d.duration)) * 1.1 || 1

  const getX = (date: number) => {
    if (maxDate === minDate) return innerWidth / 2 + margin.left
    const pos = ((date - minDate) / (maxDate - minDate)) * innerWidth + margin.left
    return Math.max(margin.left, Math.min(width - margin.right, pos))
  }
  const getY = (duration: number) =>
    innerHeight - (duration / maxDuration) * innerHeight + margin.top

  const points = chartData.map((d) => ({
    x: getX(d.date),
    y: getY(d.duration),
    ...d,
  }))

  const linePath = points.reduce(
    (path, p, i) => path + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    '',
  )

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${innerHeight + margin.top} L ${points[0].x} ${innerHeight + margin.top} Z`

  // Generate Y-axis ticks
  const yTicks = [0, maxDuration / 4, maxDuration / 2, (maxDuration * 3) / 4, maxDuration]

  return (
    <div className="border border-ink bg-canvas p-6 space-y-4">
      <div className="flex items-center justify-between px-2">
        <Typography variant="h3" className="uppercase tracking-widest text-ink">
          Approval Speed Analysis
        </Typography>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent opacity-50" />
            <Typography variant="caption" className="not-italic uppercase font-bold text-ink">
              Duration (Minutes)
            </Typography>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[800px]"
          style={{ fontFamily: 'Berkeley Mono' }}
        >
          {/* Y-axis grid lines */}
          {yTicks.map((tick, i) => (
            <React.Fragment key={i}>
              <line
                x1={margin.left}
                y1={getY(tick)}
                x2={width - margin.right}
                y2={getY(tick)}
                stroke="rgba(15,0,0,0.08)"
                strokeWidth="1"
              />
              <text
                x={margin.left - 10}
                y={getY(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-ash text-[10px] font-bold"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : Math.round(tick)}
              </text>
            </React.Fragment>
          ))}

          {/* X-axis ticks */}
          {xTicks.map((tick, i) => (
            <React.Fragment key={i}>
              <line
                x1={getX(tick.date)}
                y1={innerHeight + margin.top}
                x2={getX(tick.date)}
                y2={innerHeight + margin.top + 5}
                stroke="rgba(15,0,0,0.2)"
                strokeWidth="1"
              />
              <text
                x={getX(tick.date)}
                y={innerHeight + margin.top + 15}
                textAnchor="end"
                transform={`rotate(-45, ${getX(tick.date)}, ${innerHeight + margin.top + 15})`}
                className="fill-ash text-[10px] font-bold"
              >
                {tick.dateStr}
              </text>
            </React.Fragment>
          ))}

          {/* Area */}
          <path d={areaPath} fill="var(--color-accent, #007aff)" fillOpacity="0.1" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--color-accent, #007aff)" strokeWidth="2" />

          {/* Points */}
          {points.length < 100 &&
            points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="var(--color-canvas, #fdfcfc)"
                stroke="var(--color-accent, #007aff)"
                strokeWidth="1.5"
              />
            ))}

          {/* Axes */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={innerHeight + margin.top}
            stroke="var(--color-ink, #201d1d)"
            strokeWidth="1"
          />
          <line
            x1={margin.left}
            y1={innerHeight + margin.top}
            x2={width - margin.right}
            y2={innerHeight + margin.top}
            stroke="var(--color-ink, #201d1d)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  )
}

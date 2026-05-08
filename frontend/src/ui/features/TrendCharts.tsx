import React from 'react'
import { Typography } from '../components/Typography'
interface TrendData {
  date: string
  value: number
}
interface TrendChartProps {
  data: TrendData[]
  title: string
  color?: string
  unit?: string
}
export const LargeTrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  color = 'var(--color-accent, #007aff)',
  unit = '',
}) => {
  if (data.length < 1) return null
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const width = 500
  const height = 250
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const values = data.map((d) => d.value)
  const maxVal = Math.max(...values, 1) * 1.2
  const getX = (index: number) => {
    if (data.length <= 1) return innerWidth / 2 + margin.left
    return (index / (data.length - 1)) * innerWidth + margin.left
  }
  const getY = (val: number) => innerHeight - (val / maxVal) * innerHeight + margin.top
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
  }))
  const linePath = points.reduce(
    (path, p, i) => path + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    '',
  )
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${innerHeight + margin.top} L ${points[0].x} ${innerHeight + margin.top} Z`
  const yTicks = [0, maxVal / 2, maxVal]
  const xTicks =
    data.length > 7
      ? [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]
      : data.length > 0
        ? data
        : []
  return (
    <div className="border border-ink bg-canvas p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between px-2">
        <Typography variant="label" className="uppercase tracking-widest font-bold text-ink">
          {title}
        </Typography>
        {unit && (
          <Typography
            variant="caption"
            className="not-italic uppercase font-bold text-ash text-[9px]"
          >
            Unit: {unit}
          </Typography>
        )}
      </div>
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ fontFamily: 'Berkeley Mono' }}
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <React.Fragment key={i}>
              <line
                x1={margin.left}
                y1={getY(tick)}
                x2={width - margin.right}
                y2={getY(tick)}
                stroke="rgba(15,0,0,0.05)"
                strokeWidth="1"
              />
              <text
                x={margin.left - 8}
                y={getY(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-ash text-[9px] font-bold"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : Math.round(tick)}
              </text>
            </React.Fragment>
          ))}
          {/* Area & Line */}
          <path d={areaPath} fill={color} fillOpacity="0.05" />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
          {/* Points */}
          {data.length < 32 &&
            points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="var(--color-canvas, #fdfcfc)"
                stroke={color}
                strokeWidth="1.5"
              />
            ))}
          {/* X Axis labels */}
          {xTicks.map((tick, i) => {
            const idx = data.indexOf(tick)
            return (
              <text
                key={i}
                x={getX(idx)}
                y={innerHeight + margin.top + 15}
                textAnchor="middle"
                className="fill-ash text-[9px] font-bold"
              >
                {tick.date.split('-').slice(1).join('/')}
              </text>
            )
          })}
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

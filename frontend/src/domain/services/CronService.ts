import type { Cron } from '../models/Cron'

const TYPE_WEIGHTS: Record<string, number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 604800,
  months: 2592000,
}

export const getIntervalWeight = (intervalNumber: number, intervalType: string): number => {
  return intervalNumber * (TYPE_WEIGHTS[intervalType] || 1)
}

export const sortCrons = (
  crons: Cron[],
  key: keyof Cron | 'interval',
  direction: 'asc' | 'desc',
): Cron[] => {
  return [...crons].sort((a, b) => {
    let aValue: number | string | boolean | undefined
    let bValue: number | string | boolean | undefined

    if (key === 'interval') {
      aValue = getIntervalWeight(a.interval_number, a.interval_type)
      bValue = getIntervalWeight(b.interval_number, b.interval_type)
    } else {
      aValue = a[key as keyof Cron]
      bValue = b[key as keyof Cron]
    }

    if (aValue === undefined || bValue === undefined) return 0

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1
    }
    return 0
  })
}

export const filterCrons = (crons: Cron[], searchTerm: string): Cron[] => {
  const term = searchTerm.toLowerCase()
  return crons.filter((c) => c.name.toLowerCase().includes(term))
}

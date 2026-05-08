import { describe, it, expect } from 'vitest'
import { getIntervalWeight, sortCrons, filterCrons } from './CronService'
import type { Cron } from '../models/Cron'

describe('CronService', () => {
  it('calculates interval weight correctly', () => {
    expect(getIntervalWeight(1, 'minutes')).toBe(60)
    expect(getIntervalWeight(2, 'hours')).toBe(7200)
    expect(getIntervalWeight(1, 'days')).toBe(86400)
    expect(getIntervalWeight(1, 'unknown')).toBe(1)
  })

  it('sorts crons by name', () => {
    const crons = [
      { name: 'B', interval_number: 1, interval_type: 'hours' },
      { name: 'A', interval_number: 1, interval_type: 'hours' },
    ] as Cron[]
    
    const sorted = sortCrons(crons, 'name', 'asc')
    expect(sorted[0].name).toBe('A')
    
    const sortedDesc = sortCrons(crons, 'name', 'desc')
    expect(sortedDesc[0].name).toBe('B')
  })

  it('sorts crons by interval weight', () => {
    const crons = [
      { name: 'Long', interval_number: 2, interval_type: 'hours' }, // 7200
      { name: 'Short', interval_number: 30, interval_type: 'minutes' }, // 1800
    ] as Cron[]
    
    const sorted = sortCrons(crons, 'interval', 'asc')
    expect(sorted[0].name).toBe('Short')
  })

  it('filters crons by search term', () => {
    const crons = [
      { name: 'Backup DB' },
      { name: 'Sync Odoo' },
    ] as Cron[]
    
    expect(filterCrons(crons, 'sync')).toHaveLength(1)
    expect(filterCrons(crons, 'sync')[0].name).toBe('Sync Odoo')
  })
})

export interface Cron {
  id: number
  name: string
  active: boolean
  nextcall: string
  interval_number: number
  interval_type: string
}

export type IntervalType = 'minutes' | 'hours' | 'days' | 'weeks' | 'months'

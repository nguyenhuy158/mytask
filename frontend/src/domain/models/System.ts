export interface AuditLog {
  id: number
  action: string
  details: string
  timestamp: string
}

export interface HistoryItem {
  id: number
  task_id: number
  task_name: string
  result: string
  timestamp: string
}

export type TaskHistory = HistoryItem

export interface SystemConfig {
  content: string
  path: string
}

export interface SchedulerJob {
  id: number
  name: string
  next_run: string | null
}

export interface SchedulerHealth {
  status: string
  job_count: number
  jobs: SchedulerJob[]
}

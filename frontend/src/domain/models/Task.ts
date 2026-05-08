export interface Task {
  id: number
  name: string
  description: string
  task_type: string
  status: string
  cron_expression?: string
  timer_started_at?: string | null
  total_seconds: number
  priority: number
  deadline?: string | null
  estimated_time?: number | null
  parent_id?: number | null
  dependencies?: string | null
  project_id?: number | null
  odoo_env_id?: number | null
  odoo_project_id?: number | null
  odoo_task_id?: number | null
}

export type TaskStatus = 'todo' | 'doing' | 'done'

export const TASK_TYPES = ['generic', 'weather', 'ip', 'code_todo']

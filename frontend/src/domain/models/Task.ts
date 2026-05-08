export interface FileAttachment {
  id: number
  name: string
  key: string
  bucket: string
  mimetype: string
  version_id?: string
  task_id: number
  timestamp: string
}

export interface Task {
  id: number
  name: string
  description: string
  task_type: string
  status: 'todo' | 'in_progress' | 'done' | 'failed'
  cron_expression?: string
  total_seconds: number
  timer_started_at?: string
  priority: number
  deadline?: string
  estimated_time?: number
  parent_id?: number
  dependencies?: string
  project_id?: number
  odoo_env_id?: number
  odoo_project_id?: number
  odoo_task_id?: number
  attachments?: FileAttachment[]
}

export type TaskStatus = 'todo' | 'doing' | 'done'
export const TASK_TYPES = ['generic', 'weather', 'ip', 'code_todo']

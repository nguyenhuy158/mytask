export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  BACKLOG: 'backlog',
} as const
export const TASK_PRIORITY = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
} as const
export const APP_CONFIG = {
  DEFAULT_LANG: 'en',
  FALLBACK_LANG: 'en',
} as const

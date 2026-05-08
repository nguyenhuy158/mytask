import type { Task } from '../domain/models/Task'
import type { HistoryItem } from '../domain/models/System'

export interface WsMessage {
  type: 'TASK_COMPLETED' | 'TASK_CREATED' | 'TASK_DELETED' | 'TASK_STATUS_UPDATED'
  task_id?: number
  task?: Task
  status?: string
  result?: string
  history?: HistoryItem
}

export interface IWsAdapter {
  connect(onMessage: (data: WsMessage) => void, onStatus?: (connected: boolean) => void): void
  disconnect(): void
}

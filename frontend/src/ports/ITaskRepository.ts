import type { Task } from '../domain/models/Task'
import type { HistoryItem } from '../domain/models/System'
export interface ITaskRepository {
  getTasks(): Promise<Task[]>
  addTask(task: Partial<Task>): Promise<Task>
  deleteTask(id: number): Promise<void>
  updateStatus(id: number, status: string): Promise<void>
  runTask(id: number): Promise<{ result: string }>
  getHistory(): Promise<HistoryItem[]>
  exportTasks(): Promise<Task[]>
}

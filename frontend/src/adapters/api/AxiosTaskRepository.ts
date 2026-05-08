import axios from 'axios'
import type { ITaskRepository } from '../../ports/ITaskRepository'
import type { Task } from '../../domain/models/Task'
import type { HistoryItem } from '../../domain/models/System'
const API_BASE = '/api'
export class AxiosTaskRepository implements ITaskRepository {
  async getTasks(): Promise<Task[]> {
    const res = await axios.get(`${API_BASE}/tasks`)
    return res.data
  }
  async addTask(task: Partial<Task>): Promise<Task> {
    const res = await axios.post(`${API_BASE}/tasks`, task)
    return res.data
  }
  async deleteTask(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/tasks/${id}`)
  }
  async updateStatus(id: number, status: string): Promise<void> {
    await axios.patch(`${API_BASE}/tasks/${id}/status?status=${status}`)
  }
  async runTask(id: number): Promise<{ result: string }> {
    const res = await axios.post(`${API_BASE}/tasks/${id}/run`)
    return res.data
  }
  async getHistory(): Promise<HistoryItem[]> {
    const res = await axios.get(`${API_BASE}/history`)
    return res.data
  }
  async exportTasks(): Promise<Task[]> {
    const res = await axios.get(`${API_BASE}/tasks/export`)
    return res.data
  }
}
export const taskRepository = new AxiosTaskRepository()

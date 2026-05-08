import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosTaskRepository } from './AxiosTaskRepository'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('AxiosTaskRepository', () => {
  let repo: AxiosTaskRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new AxiosTaskRepository()
    // Mock create to return the mocked axios instance
    mockedAxios.create.mockReturnValue(mockedAxios as any)
  })

  it('getTasks should return tasks from API', async () => {
    const mockData = [{ id: 1, name: 'Task 1' }]
    mockedAxios.get.mockResolvedValue({ data: mockData })

    const result = await repo.getTasks()
    expect(result).toEqual(mockData)
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks')
  })

  it('addTask should call POST with task data', async () => {
    const newTask = { name: 'New Task' }
    mockedAxios.post.mockResolvedValue({ data: { id: 2, ...newTask } })

    await repo.addTask(newTask)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', newTask)
  })

  it('deleteTask should call DELETE with id', async () => {
    mockedAxios.delete.mockResolvedValue({})
    await repo.deleteTask(1)
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/1')
  })

  it('updateStatus should call PATCH', async () => {
    mockedAxios.patch.mockResolvedValue({})
    await repo.updateStatus(1, 'active')
    expect(mockedAxios.patch).toHaveBeenCalledWith('/api/tasks/1/status?status=active')
  })
})

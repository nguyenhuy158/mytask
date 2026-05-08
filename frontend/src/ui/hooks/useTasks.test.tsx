import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTasks } from './useTasks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { taskRepository } from '../../adapters/api/AxiosTaskRepository'

// Mock repository
vi.mock('../../adapters/api/AxiosTaskRepository', () => ({
  taskRepository: {
    getTasks: vi.fn(),
    addTask: vi.fn(),
    deleteTask: vi.fn(),
    updateStatus: vi.fn(),
    runTask: vi.fn(),
  }
}))

// Mock confirmAction
vi.mock('@/lib/toast-confirm', () => ({
  confirmAction: vi.fn(() => Promise.resolve(true))
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches tasks correctly', async () => {
    const mockTasks = [{ id: 1, name: 'Task 1', description: 'Desc' }]
    vi.mocked(taskRepository.getTasks).mockResolvedValue(mockTasks)

    const { result } = renderHook(() => useTasks(''), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks).toEqual(mockTasks)
  })

  it('filters tasks based on search term', async () => {
    const mockTasks = [
      { id: 1, name: 'Apple', description: 'Fruit' },
      { id: 2, name: 'Banana', description: 'Fruit' },
    ]
    vi.mocked(taskRepository.getTasks).mockResolvedValue(mockTasks)

    const { result } = renderHook(() => useTasks('apple'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].name).toBe('Apple')
  })

  it('calls addTask correctly', async () => {
    const newTask = { name: 'New Task' }
    vi.mocked(taskRepository.addTask).mockResolvedValue({ id: 3, ...newTask })

    const { result } = renderHook(() => useTasks(''), { wrapper: createWrapper() })
    
    await result.current.addTask(newTask)
    expect(taskRepository.addTask).toHaveBeenCalledWith(newTask)
  })
})

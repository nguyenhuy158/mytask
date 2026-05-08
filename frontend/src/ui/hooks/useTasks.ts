import { useState, useEffect, useCallback } from 'react'
import type { Task } from '../../domain/models/Task'
import { taskRepository } from '../../adapters/api/AxiosTaskRepository'
import { filterTasks } from '../../domain/services/TaskService'
import toast from 'react-hot-toast'

export const useTasks = (searchTerm: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskRepository.getTasks()
      setTasks(data)
    } catch {
      toast.error('Failed to fetch tasks')
    }
  }, [])

  const fetchRankedTasks = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/tasks/ranked`,
      )
      const data = await res.json()
      setTasks(data)
      toast.success('Tasks auto-ranked by AI')
    } catch {
      toast.error('Failed to rank tasks')
    }
  }, [])

  const addTask = useCallback(async (newTask: Partial<Task>) => {
    try {
      const task = await taskRepository.addTask(newTask)
      setTasks((prev) => [...prev, task])
      toast.success('Task created')
      return task
    } catch (err) {
      toast.error('Failed to add task')
      throw err
    }
  }, [])

  const axiosDeleteTask = useCallback(async (id: number) => {
    await taskRepository.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast.success('Task deleted')
  }, [])

  const deleteTask = useCallback(
    async (id: number) => {
      if (!confirm('Delete this task?')) return
      try {
        await axiosDeleteTask(id)
      } catch {
        toast.error('Failed to delete task')
      }
    },
    [axiosDeleteTask],
  )

  const updateTaskStatus = useCallback(async (id: number, status: string) => {
    try {
      await taskRepository.updateStatus(id, status)
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
      toast.success(`Moved to ${status.toUpperCase()}`)
    } catch {
      toast.error('Failed to update status')
    }
  }, [])

  const runTask = useCallback(async (id: number) => {
    setLoading(true)
    try {
      const res = await taskRepository.runTask(id)
      toast.success('Task executed')
      return res.result
    } catch (err) {
      toast.error('Task execution failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await fetchTasks()
    }
    init()
  }, [fetchTasks])

  const filteredTasks = filterTasks(tasks, searchTerm)

  return {
    tasks,
    setTasks,
    filteredTasks,
    fetchTasks,
    fetchRankedTasks,
    addTask,
    deleteTask,
    updateTaskStatus,
    runTask,
    loading,
  }
}

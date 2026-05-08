import { useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task } from '../../domain/models/Task'
import { taskRepository } from '../../adapters/api/AxiosTaskRepository'
import { filterTasks } from '../../domain/services/TaskService'
import toast from 'react-hot-toast'
import { confirmAction } from '@/lib/toast-confirm'

export const useTasks = (searchTerm: string) => {
  const queryClient = useQueryClient()

  const {
    data: tasks = [],
    isLoading: loading,
    refetch: fetchTasks,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskRepository.getTasks(),
  })

  const createTaskMutation = useMutation({
    mutationFn: (newTask: Partial<Task>) => taskRepository.addTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created')
    },
    onError: () => toast.error('Failed to add task'),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => taskRepository.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old) => old?.filter((t) => t.id !== id))
      return { previousTasks }
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      toast.error('Failed to delete task')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onSuccess: () => {
      toast.success('Task deleted')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      taskRepository.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)),
      )
      return { previousTasks }
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      toast.error('Failed to update status')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onSuccess: (_, variables) => {
      toast.success(`Moved to ${variables.status.toUpperCase()}`)
    },
  })

  const runTaskMutation = useMutation({
    mutationFn: (id: number) => taskRepository.runTask(id),
    onSuccess: () => toast.success('Task executed'),
    onError: () => toast.error('Task execution failed'),
  })

  const filteredTasks = useMemo(() => filterTasks(tasks, searchTerm), [tasks, searchTerm])

  const addTask = useCallback(
    async (newTask: Partial<Task>) => {
      return createTaskMutation.mutateAsync(newTask)
    },
    [createTaskMutation],
  )

  const deleteTask = useCallback(
    async (id: number) => {
      if (!(await confirmAction('Delete this task?'))) return
      return deleteTaskMutation.mutateAsync(id)
    },
    [deleteTaskMutation],
  )

  const updateTaskStatus = useCallback(
    async (id: number, status: string) => {
      return updateStatusMutation.mutateAsync({ id, status })
    },
    [updateStatusMutation],
  )

  const runTask = useCallback(
    async (id: number) => {
      const res = await runTaskMutation.mutateAsync(id)
      return res.result
    },
    [runTaskMutation],
  )

  const fetchRankedTasks = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/tasks/ranked`,
      )
      const data = await res.json()
      queryClient.setQueryData(['tasks'], data)
      toast.success('Tasks auto-ranked by AI')
    } catch {
      toast.error('Failed to rank tasks')
    }
  }, [queryClient])

  const uploadAttachment = useCallback(
    async (taskId: number, s3ConfigId: number, file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/tasks/${taskId}/attachments?s3_config_id=${s3ConfigId}`,
          {
            method: 'POST',
            body: formData,
          },
        )
        if (!res.ok) throw new Error('Upload failed')
        const attachment = await res.json()
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        toast.success('File uploaded')
        return attachment
      } catch {
        toast.error('Failed to upload file')
      }
    },
    [queryClient],
  )

  return {
    tasks,
    setTasks: (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
      if (typeof newTasks === 'function') {
        const prev = queryClient.getQueryData<Task[]>(['tasks']) || []
        queryClient.setQueryData(['tasks'], newTasks(prev))
      } else {
        queryClient.setQueryData(['tasks'], newTasks)
      }
    },
    filteredTasks,
    fetchTasks,
    fetchRankedTasks,
    addTask,
    deleteTask,
    updateTaskStatus,
    runTask,
    uploadAttachment,
    loading,
  }
}

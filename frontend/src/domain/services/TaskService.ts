import type { Task } from '../models/Task'
export const filterTasks = (tasks: Task[], searchTerm: string): Task[] => {
  const term = searchTerm.toLowerCase()
  return tasks.filter(
    (t) => t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term),
  )
}

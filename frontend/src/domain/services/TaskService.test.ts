import { describe, it, expect } from 'vitest'
import { filterTasks } from './TaskService'
import type { Task } from '../models/Task'

describe('TaskService', () => {
  it('filters tasks by name or description', () => {
    const tasks = [
      { name: 'Fix bug', description: 'Important issue' },
      { name: 'Feature A', description: 'New development' },
    ] as Task[]
    
    expect(filterTasks(tasks, 'bug')).toHaveLength(1)
    expect(filterTasks(tasks, 'important')).toHaveLength(1)
    expect(filterTasks(tasks, 'development')).toHaveLength(1)
    expect(filterTasks(tasks, 'absent')).toHaveLength(0)
  })
})

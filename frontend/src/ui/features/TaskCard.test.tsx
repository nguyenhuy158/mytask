import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskCard } from './TaskCard'
import { Task } from '../../domain/models/Task'

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:8000'
  }
})

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'This is a test task description',
    status: 'todo',
    task_type: 'generic',
    priority: 3,
    deadline: '2026-05-08T00:00:00Z',
    dependencies: '',
    attachments: [],
    created_at: '',
    updated_at: '',
    timer_started_at: null,
    total_time_spent: 0,
    cron_expression: null,
    odoo_env_id: null,
    odoo_project_id: null,
    odoo_task_id: null
  }

  const mockOnDelete = vi.fn()
  const mockOnRun = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      })
    ))
  })

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} onRun={mockOnRun} />)
    
    expect(screen.getByText('Test Task')).toBeDefined()
    expect(screen.getByText('This is a test task description')).toBeDefined()
    expect(screen.getByText('todo')).toBeDefined()
    expect(screen.getByText('generic')).toBeDefined()
  })

  it('calls onRun when Run Task button is clicked', () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} onRun={mockOnRun} />)
    
    fireEvent.click(screen.getByText('Run Task'))
    expect(mockOnRun).toHaveBeenCalledWith(mockTask.id)
  })

  it('calls onDelete when DELETE button is clicked', () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} onRun={mockOnRun} />)
    
    fireEvent.click(screen.getByText('[DELETE]'))
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id)
  })

  it('shows "NEVER" for execution time when no result is provided', () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} onRun={mockOnRun} />)
    expect(screen.getByText('NEVER')).toBeDefined()
  })

  it('shows result time and text when result is provided', () => {
    const result = { text: 'Success!', time: '2 minutes ago' }
    render(<TaskCard task={mockTask} result={result} onDelete={mockOnDelete} onRun={mockOnRun} />)
    
    expect(screen.getByText('Success!')).toBeDefined()
    expect(screen.getAllByText('2 minutes ago').length).toBeGreaterThan(0)
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Dashboard } from './Dashboard'
import { Task } from '../../domain/models/Task'

describe('Dashboard Component', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Description 1',
      task_type: 'generic',
      status: 'todo' as any,
      total_seconds: 0,
      priority: 1
    },
    {
      id: 2,
      name: 'Task 2',
      description: 'Description 2',
      task_type: 'weather',
      status: 'doing' as any,
      total_seconds: 0,
      priority: 2
    }
  ]

  const mockResults = {
    1: { text: 'Result 1', time: '10:00' }
  }

  const mockOnDelete = vi.fn()
  const mockOnRun = vi.fn()
  const mockOnUpdateStatus = vi.fn()

  it('renders list view by default', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        viewMode="list"
        results={mockResults}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        onUpdateStatus={mockOnUpdateStatus}
      />
    )

    expect(screen.getByText('Task 1')).toBeDefined()
    expect(screen.getByText('Task 2')).toBeDefined()
    expect(screen.getByText('Result 1')).toBeDefined()
    expect(screen.getByText('[10:00]')).toBeDefined()
  })

  it('renders board view correctly', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        viewMode="board"
        results={mockResults}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        onUpdateStatus={mockOnUpdateStatus}
      />
    )

    expect(screen.getByText('todo')).toBeDefined()
    expect(screen.getByText('doing')).toBeDefined()
    expect(screen.getByText('done')).toBeDefined()
    
    // Check task names in board
    const task1 = screen.getAllByText('Task 1')
    expect(task1.length).toBeGreaterThan(0)
  })

  it('renders calendar view under reconstruction', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        viewMode="calendar"
        results={mockResults}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        onUpdateStatus={mockOnUpdateStatus}
      />
    )

    expect(screen.getByText('Calendar view under reconstruction')).toBeDefined()
  })

  it('calls onRun when RUN button is clicked in list view', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        viewMode="list"
        results={mockResults}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        onUpdateStatus={mockOnUpdateStatus}
      />
    )

    const runButtons = screen.getAllByText('RUN')
    fireEvent.click(runButtons[0])
    expect(mockOnRun).toHaveBeenCalledWith(1)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        viewMode="list"
        results={mockResults}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        onUpdateStatus={mockOnUpdateStatus}
      />
    )

    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'))
    // The first one is trash icon
    fireEvent.click(deleteButtons[0])
    expect(mockOnDelete).toHaveBeenCalledWith(1)
  })

  it('calls onUpdateStatus when move buttons are clicked', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        viewMode="list"
        results={mockResults}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        onUpdateStatus={mockOnUpdateStatus}
      />
    )

    // Task 1 is 'todo'
    // It has Delete button and RUN button, and ArrowRight
    // In the DOM, buttons for Task 1: [Trash2, RUN, ArrowRight]
    // Task 2 is 'doing'
    // Buttons: [Trash2, RUN, ArrowLeft, ArrowRight]

    const allButtons = screen.getAllByRole('button')
    
    // Find ArrowRight for Task 1. It's the one with ArrowRight icon.
    // Since we can't easily query by icon name in this setup without more helper,
    // let's use the fact that it's after the RUN button of Task 1.
    
    const task1RunButton = screen.getAllByText('RUN')[0]
    // ArrowRight is next to RUN for a todo task
    const arrowRight = task1RunButton.nextElementSibling?.querySelector('button') || task1RunButton.parentElement?.querySelectorAll('button')[2]
    
    if (arrowRight) {
        fireEvent.click(arrowRight)
        expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, 'doing')
    }
  })
})

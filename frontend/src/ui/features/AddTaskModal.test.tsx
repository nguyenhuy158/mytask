import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AddTaskModal } from './AddTaskModal'

describe('AddTaskModal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnAdd = vi.fn()
  const mockTasks = []
  const mockEnvs = [{ id: 1, name: 'Default Env', is_default: true }]

  it('renders correctly', () => {
    render(
      <AddTaskModal
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        tasks={mockTasks}
        envs={mockEnvs}
      />
    )
    
    expect(screen.getByText('Initialize_Task')).toBeDefined()
    expect(screen.getByPlaceholderText('E.g. REFACTOR_AUTH_LAYER')).toBeDefined()
  })

  it('calls onAdd and onClose when form is submitted', () => {
    render(
      <AddTaskModal
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        tasks={mockTasks}
        envs={mockEnvs}
      />
    )
    
    fireEvent.change(screen.getByPlaceholderText('E.g. REFACTOR_AUTH_LAYER'), {
      target: { value: 'New Task' }
    })
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'New Desc' }
    })
    
    fireEvent.click(screen.getByText('[CREATE_TASK]'))
    
    expect(mockOnAdd).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when CANCEL button is clicked', () => {
    render(
      <AddTaskModal
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        tasks={mockTasks}
        envs={mockEnvs}
      />
    )
    
    fireEvent.click(screen.getByText('[CANCEL]'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})

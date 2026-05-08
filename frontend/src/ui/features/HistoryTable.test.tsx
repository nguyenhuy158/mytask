import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HistoryTable } from './HistoryTable'

describe('HistoryTable Component', () => {
  const mockHistory = [
    {
      id: 1,
      task_name: 'Task A',
      status: 'success',
      execution_time: '2026-05-08 10:00:00',
      duration: 10,
      result: 'Success'
    }
  ]

  it('renders history records correctly', () => {
    render(<HistoryTable history={mockHistory} />)
    expect(screen.getByText('Task A')).toBeDefined()
    expect(screen.getByText('Success')).toBeDefined()
  })

  it('renders empty state', () => {
    render(<HistoryTable history={[]} />)
    expect(screen.getByText(/No activity found in logs/i)).toBeDefined()
  })
})

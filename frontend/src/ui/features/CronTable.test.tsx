import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CronTable } from './CronTable'
import { Cron } from '../../domain/models/Cron'
import { TooltipProvider } from '@/ui/components/ui/tooltip'

describe('CronTable Component', () => {
  const mockCrons: Cron[] = [
    {
      id: 1,
      name: 'Test Cron 1',
      model: 'res.partner',
      interval_number: 1,
      interval_type: 'hours',
      nextcall: '2026-05-08 10:00:00',
      active: true,
      user_id: [1, 'Admin'],
      numbercall: -1
    },
    {
      id: 2,
      name: 'Test Cron 2',
      model: 'sale.order',
      interval_number: 1,
      interval_type: 'days',
      nextcall: '2026-05-09 10:00:00',
      active: false,
      user_id: [1, 'Admin'],
      numbercall: -1
    }
  ]

  const mockOnRequestSort = vi.fn()
  const mockOnToggle = vi.fn()
  const mockOnRun = vi.fn()

  it('renders crons correctly', () => {
    render(
      <TooltipProvider>
        <CronTable
          crons={mockCrons}
          loading={false}
          sortConfig={{ key: null, direction: 'asc' }}
          onRequestSort={mockOnRequestSort}
          onToggle={mockOnToggle}
          onRun={mockOnRun}
        />
      </TooltipProvider>
    )
    
    expect(screen.getByText('Test Cron 1')).toBeDefined()
    expect(screen.getByText('Test Cron 2')).toBeDefined()
    expect(screen.getByText('[ACTIVE]')).toBeDefined()
    expect(screen.getByText('[INACTIVE]')).toBeDefined()
  })

  it('calls onToggle when DISABLE/ENABLE is clicked', () => {
    render(
      <TooltipProvider>
        <CronTable
          crons={mockCrons}
          loading={false}
          sortConfig={{ key: null, direction: 'asc' }}
          onRequestSort={mockOnRequestSort}
          onToggle={mockOnToggle}
          onRun={mockOnRun}
        />
      </TooltipProvider>
    )
    
    fireEvent.click(screen.getByText('DISABLE'))
    expect(mockOnToggle).toHaveBeenCalledWith(1, false)
    
    fireEvent.click(screen.getByText('ENABLE'))
    expect(mockOnToggle).toHaveBeenCalledWith(2, true)
  })

  it('calls onRun when TRIGGER is clicked', () => {
    render(
      <TooltipProvider>
        <CronTable
          crons={mockCrons}
          loading={false}
          sortConfig={{ key: null, direction: 'asc' }}
          onRequestSort={mockOnRequestSort}
          onToggle={mockOnToggle}
          onRun={mockOnRun}
        />
      </TooltipProvider>
    )
    
    const triggerButtons = screen.getAllByText('TRIGGER')
    fireEvent.click(triggerButtons[0])
    expect(mockOnRun).toHaveBeenCalledWith(1)
  })
})

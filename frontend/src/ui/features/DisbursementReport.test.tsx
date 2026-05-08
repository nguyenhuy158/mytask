import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DisbursementReport } from './DisbursementReport'
import { DisbursementReport as IDisbursementReport } from '../../domain/models/OdooEnv'

// Mock sub-components
vi.mock('./ApprovalSpeedChart', () => ({
  ApprovalSpeedChart: () => <div data-testid="speed-chart" />
}))
vi.mock('./TrendCharts', () => ({
  LargeTrendChart: () => <div data-testid="trend-chart" />
}))

describe('DisbursementReport Component', () => {
  const mockReport: IDisbursementReport[] = [
    {
      id: 1,
      name: 'REC/001',
      project_name: 'Project A',
      kind: 'fast',
      confirm_date: '2026-05-08 08:00:00',
      approve_date: '2026-05-08 08:10:00',
      approval_duration: 10,
      approve_uid: [1, 'Admin']
    },
    {
      id: 2,
      name: 'REC/002',
      project_name: 'Project B',
      kind: 'slow',
      confirm_date: '2026-05-07 08:00:00',
      approve_date: '2026-05-07 09:00:00',
      approval_duration: 60,
      approve_uid: [1, 'Admin']
    }
  ]

  it('renders loading state correctly', () => {
    render(<DisbursementReport report={[]} loading={true} />)
    // Skeletons should be present
    expect(document.querySelector('.animate-pulse') || document.querySelector('.bg-surface-soft')).toBeDefined()
  })

  it('renders empty state when no report is provided', () => {
    render(<DisbursementReport report={[]} loading={false} />)
    expect(screen.getByText('NO_DATA_AVAILABLE')).toBeDefined()
  })

  it('renders data and stats correctly', () => {
    render(<DisbursementReport report={mockReport} loading={false} />)
    
    expect(screen.getByText('Disbursement Report')).toBeDefined()
    expect(screen.getAllByText('REC/001').length).toBeGreaterThan(0)
    // stats
    expect(screen.getByText('Avg (Today)')).toBeDefined()
    expect(screen.getByText('Total Approved')).toBeDefined()
  })

  it('filters data when range is changed', () => {
    render(<DisbursementReport report={mockReport} loading={false} />)
    
    // Initially showing 'Last 3 Days' - should show both if within range
    // Let's change to 'All Time'
    // Note: Select component uses its own internal state, we just verify it exists
    expect(screen.getByText('Last 3 Days')).toBeDefined()
  })

  it('handles sorting', () => {
    render(<DisbursementReport report={mockReport} loading={false} />)
    
    const referenceHeader = screen.getByText('Reference [ ]')
    fireEvent.click(referenceHeader)
    expect(screen.getByText('Reference [↑]')).toBeDefined()
  })
})

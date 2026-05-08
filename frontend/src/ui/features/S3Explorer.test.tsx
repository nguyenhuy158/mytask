import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { S3Explorer } from './S3Explorer'
import toast from 'react-hot-toast'
import { confirmAction } from '@/lib/toast-confirm'

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/toast-confirm', () => ({
  confirmAction: vi.fn(),
}))

// Mock AddS3Modal to avoid rendering its complex logic
vi.mock('./AddS3Modal', () => ({
  AddS3Modal: ({ onClose, onAdd }: any) => (
    <div data-testid="add-s3-modal">
      <button onClick={() => onAdd({ name: 'New Config' })}>MOCK_ADD</button>
      <button onClick={onClose}>MOCK_CLOSE</button>
    </div>
  )
}))

describe('S3Explorer Component', () => {
  const mockConfigs = [
    { id: 1, name: 'S3 One' },
    { id: 2, name: 'S3 Two' }
  ]

  const mockFiles = [
    { key: 'backup1.zip', size: 1024, last_modified: '2026-05-08T10:00:00Z' },
    { key: 'backup2.zip', size: 2048, last_modified: '2026-05-08T11:00:00Z' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn((url) => {
      if (url.toString().endsWith('/s3-configs')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockConfigs),
          ok: true
        })
      }
      if (url.toString().includes('/backups')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockFiles),
          ok: true
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }) as any
  })

  it('renders and fetches configs on mount', async () => {
    render(<S3Explorer />)
    
    await waitFor(() => {
      expect(screen.getByText('S3 One')).toBeDefined()
      expect(screen.getByText('S3 Two')).toBeDefined()
    })
  })

  it('shows files when a config is selected', async () => {
    render(<S3Explorer />)
    
    await waitFor(() => {
      const configItem = screen.getByText('S3 One')
      fireEvent.click(configItem)
    })
    
    await waitFor(() => {
      expect(screen.getByText('backup1.zip')).toBeDefined()
      expect(screen.getByText('backup2.zip')).toBeDefined()
    })
  })

  it('opens add modal when [ADD] is clicked', async () => {
    render(<S3Explorer />)
    
    fireEvent.click(screen.getByText('[ADD]'))
    expect(screen.getByTestId('add-s3-modal')).toBeDefined()
  })

  it('calls delete API when [X] is clicked and confirmed', async () => {
    ;(confirmAction as any).mockResolvedValue(true)
    
    render(<S3Explorer />)
    
    await waitFor(() => {
        const deleteButtons = screen.getAllByText('[X]')
        fireEvent.click(deleteButtons[0])
    })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/s3-configs/1'),
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(toast.success).toHaveBeenCalledWith('Deleted')
    })
  })

  it('does not call delete API when [X] is clicked but cancelled', async () => {
    ;(confirmAction as any).mockResolvedValue(false)
    
    render(<S3Explorer />)
    
    await waitFor(() => {
        const deleteButtons = screen.getAllByText('[X]')
        fireEvent.click(deleteButtons[0])
    })
    
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/s3-configs/1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

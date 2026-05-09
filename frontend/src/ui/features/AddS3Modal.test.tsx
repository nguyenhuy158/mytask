import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddS3Modal } from './AddS3Modal'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AddS3Modal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnAdd = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders correctly', () => {
    render(<AddS3Modal onClose={mockOnClose} onAdd={mockOnAdd} />)
    
    expect(screen.getByText('Add S3 Storage')).toBeDefined()
    expect(screen.getByPlaceholderText('https://s3.amazonaws.com')).toBeDefined()
  })

  it('calls onAdd when form is submitted', async () => {
    render(<AddS3Modal onClose={mockOnClose} onAdd={mockOnAdd} />)
    
    fireEvent.change(screen.getByLabelText(/Display Name/i), { target: { value: 'My S3' } })
    fireEvent.change(screen.getByLabelText(/Endpoint URL/i), { target: { value: 'http://test.com' } })
    fireEvent.change(screen.getByLabelText(/Bucket Name/i), { target: { value: 'my-bucket' } })
    fireEvent.change(screen.getByLabelText(/Access Key/i), { target: { value: 'key' } })
    fireEvent.change(screen.getByLabelText(/Secret Key/i), { target: { value: 'secret' } })
    
    fireEvent.click(screen.getByText('Add_Config'))
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My S3',
        endpoint: 'http://test.com',
        bucket: 'my-bucket'
      }))
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('calls onClose when [ESC] is clicked', () => {
    render(<AddS3Modal onClose={mockOnClose} onAdd={mockOnAdd} />)
    
    // DialogClose component from Shadcn/Radix has "sr-only" text "Close"
    fireEvent.click(screen.getByText('Close'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles test connection success', async () => {
    ;(global.fetch as any).mockResolvedValue({
      json: vi.fn().mockResolvedValue({ status: 'success' })
    })

    render(<AddS3Modal onClose={mockOnClose} onAdd={mockOnAdd} />)
    
    fireEvent.click(screen.getByText('Test_Connection'))
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Connection successful!')
    })
  })

  it('handles test connection failure', async () => {
    ;(global.fetch as any).mockResolvedValue({
      json: vi.fn().mockResolvedValue({ status: 'error', message: 'Wrong credentials' })
    })

    render(<AddS3Modal onClose={mockOnClose} onAdd={mockOnAdd} />)
    
    fireEvent.click(screen.getByText('Test_Connection'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Connection failed: Wrong credentials')
    })
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CronBuilder } from './CronBuilder'

// Mock react-js-cron as it might have issues in test environment
vi.mock('react-js-cron', () => ({
  Cron: ({ value, setValue }: any) => (
    <input 
      data-testid="mock-cron-input" 
      value={value} 
      onChange={(e) => setValue(e.target.value)} 
    />
  )
}))

describe('CronBuilder', () => {
  it('renders with initial value', () => {
    render(<CronBuilder value="0 10 * * *" onChange={() => {}} onClose={() => {}} />)
    expect(screen.getByText('0 10 * * *')).toBeDefined()
  })

  it('calls onClose when X button is clicked', () => {
    const handleClose = vi.fn()
    render(<CronBuilder value="" onChange={() => {}} onClose={handleClose} />)
    
    // The X icon button
    const closeBtn = screen.getByRole('button', { name: '' }) // lucide-react X doesn't have text
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onChange and onClose when Apply is clicked', () => {
    const handleChange = vi.fn()
    const handleClose = vi.fn()
    render(<CronBuilder value="* * * * *" onChange={handleChange} onClose={handleClose} />)
    
    fireEvent.click(screen.getByText('Apply Expression'))
    expect(handleChange).toHaveBeenCalledWith('* * * * *')
    expect(handleClose).toHaveBeenCalled()
  })

  it('updates internal state when cron changes', () => {
    render(<CronBuilder value="old" onChange={() => {}} onClose={() => {}} />)
    const input = screen.getByTestId('mock-cron-input')
    
    fireEvent.change(input, { target: { value: 'new' } })
    expect(screen.getByText('new')).toBeDefined()
  })
})

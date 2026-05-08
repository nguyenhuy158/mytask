import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { confirmAction, promptAction } from './toast-confirm'
import toast from 'react-hot-toast'
import React from 'react'

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
}))

describe('toast-confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(toast).dismiss = vi.fn()
  })

  describe('confirmAction', () => {
    it('resolves true when Confirm is clicked', async () => {
      let renderFn: any
      vi.mocked(toast).mockImplementation((fn: any) => {
        renderFn = fn
        return 'toast-id'
      })

      const promise = confirmAction('Are you sure?')
      
      // Render the toast content
      render(renderFn({ id: 'toast-id' }))
      
      expect(screen.getByText('Are you sure?')).toBeDefined()
      
      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)
      
      const result = await promise
      expect(result).toBe(true)
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id')
    })

    it('resolves false when Cancel is clicked', async () => {
      let renderFn: any
      vi.mocked(toast).mockImplementation((fn: any) => {
        renderFn = fn
        return 'toast-id'
      })

      const promise = confirmAction('Are you sure?')
      
      render(renderFn({ id: 'toast-id' }))
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      const result = await promise
      expect(result).toBe(false)
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id')
    })
  })

  describe('promptAction', () => {
    it('resolves with input value when OK is clicked', async () => {
      let renderFn: any
      vi.mocked(toast).mockImplementation((fn: any) => {
        renderFn = fn
        return 'toast-id'
      })

      const promise = promptAction('Enter value', 'initial')
      
      render(renderFn({ id: 'toast-id' }))
      
      const input = screen.getByDisplayValue('initial')
      fireEvent.change(input, { target: { value: 'new value' } })
      
      const okButton = screen.getByText('OK')
      fireEvent.click(okButton)
      
      const result = await promise
      expect(result).toBe('new value')
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id')
    })

    it('resolves with value when Enter is pressed', async () => {
      let renderFn: any
      vi.mocked(toast).mockImplementation((fn: any) => {
        renderFn = fn
        return 'toast-id'
      })

      const promise = promptAction('Enter value')
      
      render(renderFn({ id: 'toast-id' }))
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'entered' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      const result = await promise
      expect(result).toBe('entered')
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id')
    })

    it('resolves null when Cancel is clicked', async () => {
      let renderFn: any
      vi.mocked(toast).mockImplementation((fn: any) => {
        renderFn = fn
        return 'toast-id'
      })

      const promise = promptAction('Enter value')
      
      render(renderFn({ id: 'toast-id' }))
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      const result = await promise
      expect(result).toBeNull()
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id')
    })
  })
})

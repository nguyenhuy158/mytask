import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders correctly', () => {
    render(<Spinner label="Loading..." />)
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Spinner size="sm" />)
    expect(document.querySelector('.w-4')).toBeDefined()

    rerender(<Spinner size="lg" />)
    expect(document.querySelector('.w-12')).toBeDefined()
  })
})

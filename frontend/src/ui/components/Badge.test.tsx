import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByText('Status')).toBeDefined()
  })

  it('renders with correct variant styles', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success').className).toContain('text-success')

    rerender(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger').className).toContain('text-danger')
  })
})

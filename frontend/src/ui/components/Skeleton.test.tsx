import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton className="w-[100px]" />)
    expect(container.firstChild).toHaveClass('bg-surface-soft')
    expect(container.firstChild).toHaveClass('w-[100px]')
  })
})

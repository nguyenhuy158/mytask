import { render, screen } from '@testing-library/react'
import { Typography } from './Typography'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('Typography Component', () => {
  it('renders children correctly', () => {
    render(<Typography>Hello World</Typography>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies correct variant styles', () => {
    const { container } = render(<Typography variant="h1">Heading</Typography>)
    expect(container.firstChild).toHaveClass('text-2xl')
    expect(container.firstChild).toHaveClass('font-bold')
  })

  it('renders as different HTML tags based on variant', () => {
    const { container: h1Container } = render(<Typography variant="h1">H1</Typography>)
    expect(h1Container.querySelector('h1')).toBeInTheDocument()

    const { container: bodyContainer } = render(<Typography variant="body">Body</Typography>)
    expect(bodyContainer.querySelector('span')).toBeInTheDocument()
  })
})

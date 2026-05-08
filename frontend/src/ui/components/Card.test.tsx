import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardBody } from './Card'

describe('Card Component', () => {
  it('renders card structure correctly', () => {
    render(
      <Card>
        <CardHeader>
          <div>Header</div>
        </CardHeader>
        <CardBody>Content</CardBody>
      </Card>
    )
    expect(screen.getByText('Header')).toBeDefined()
    expect(screen.getByText('Content')).toBeDefined()
  })
})

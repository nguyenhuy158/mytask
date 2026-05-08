import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Table, TableHeader, TableBody, TableHeaderCell, TableCell, TableRow, Pagination } from './Table'

describe('Table', () => {
  it('renders table structure correctly', () => {
    render(
      <Table>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Item 1')).toBeDefined()
  })

  it('calls onPageChange in Pagination', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    )
    
    const nextButton = screen.getByText('[NEXT]')
    fireEvent.click(nextButton)
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    )
    const prevButton = screen.getByText('[PREV]') as HTMLButtonElement
    expect(prevButton.disabled).toBe(true)
  })
})

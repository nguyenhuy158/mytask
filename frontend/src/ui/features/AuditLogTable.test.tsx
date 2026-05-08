import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuditLogTable } from './AuditLogTable'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import * as useSystemHook from '../hooks/useSystem'

// Mock useSystem hook
vi.mock('../hooks/useSystem', () => ({
  useSystem: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('AuditLogTable Component', () => {
  const mockLogs = [
    {
      id: 1,
      action: 'CREATE_TASK',
      user: 'Admin',
      details: 'Task #1 created',
      created_at: '2026-05-08 10:00:00'
    }
  ]

  it('renders audit logs correctly', () => {
    vi.mocked(useSystemHook.useSystem).mockReturnValue({
      auditLogs: mockLogs,
      totalLogs: 1,
      fetchAll: vi.fn()
    } as any)

    render(<AuditLogTable logs={mockLogs} total={1} skip={0} take={20} onPageChange={() => {}} />, {
      wrapper: createWrapper()
    })
    
    expect(screen.getByText('CREATE_TASK')).toBeDefined()
    expect(screen.getByText('Task #1 created')).toBeDefined()
  })
})

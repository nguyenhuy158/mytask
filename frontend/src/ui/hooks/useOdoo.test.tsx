import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOdoo } from './useOdoo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { odooRepository } from '../../adapters/api/AxiosOdooRepository'

vi.mock('../../adapters/api/AxiosOdooRepository', () => ({
  odooRepository: {
    getEnvs: vi.fn(),
    getCrons: vi.fn(),
    getDisbursementReport: vi.fn(),
    toggleCron: vi.fn(),
    runCron: vi.fn(),
    addEnv: vi.fn(),
    updateEnv: vi.fn(),
    deleteEnv: vi.fn(),
    duplicateEnv: vi.fn(),
    setDefaultEnv: vi.fn(),
    testEnv: vi.fn(),
    exportEnvs: vi.fn(),
    importEnvs: vi.fn(),
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useOdoo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(odooRepository.getEnvs).mockResolvedValue([])
    vi.mocked(odooRepository.getCrons).mockResolvedValue([])
    vi.mocked(odooRepository.getDisbursementReport).mockResolvedValue([])
  })

  it('fetches environments on mount', async () => {
    const mockEnvs = [{ id: 1, name: 'Prod', is_default: true }]
    vi.mocked(odooRepository.getEnvs).mockResolvedValue(mockEnvs)

    const { result } = renderHook(() => useOdoo(''), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.envs).toEqual(mockEnvs))
  })

  it('selects default environment automatically', async () => {
    const mockEnvs = [{ id: 1, name: 'Prod', is_default: true }]
    vi.mocked(odooRepository.getEnvs).mockResolvedValue(mockEnvs)

    const { result } = renderHook(() => useOdoo(''), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.selectedEnvId).toBe(1))
  })

  it('filters crons based on search term', async () => {
    vi.mocked(odooRepository.getEnvs).mockResolvedValue([{ id: 1, name: 'P', is_default: true }])
    const mockCrons = [
      { id: 1, name: 'Apple Cron' },
      { id: 2, name: 'Banana Cron' },
    ]
    vi.mocked(odooRepository.getCrons).mockResolvedValue(mockCrons as any)

    const { result } = renderHook(() => useOdoo('apple'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.filteredCrons).toHaveLength(1))
    expect(result.current.filteredCrons[0].name).toBe('Apple Cron')
  })
})

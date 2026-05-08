import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOdoo, useOdooHealth } from './useOdoo'
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
    testConnection: vi.fn(),
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

  it('fetches environments and selects default', async () => {
    const mockEnvs = [{ id: 1, name: 'Prod', is_default: true }]
    vi.mocked(odooRepository.getEnvs).mockResolvedValue(mockEnvs as any)

    const { result } = renderHook(() => useOdoo(''), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.envs).toEqual(mockEnvs)
      expect(result.current.selectedEnvId).toBe(1)
    })
  })

  it('calls toggleCron mutation', async () => {
    vi.mocked(odooRepository.getEnvs).mockResolvedValue([{ id: 1, name: 'P', is_default: true }] as any)
    vi.mocked(odooRepository.toggleCron).mockResolvedValue({} as any)

    const { result } = renderHook(() => useOdoo(''), { wrapper: createWrapper() })
    
    await waitFor(() => expect(result.current.selectedEnvId).toBe(1))
    
    act(() => {
      result.current.toggleCron(101, true)
    })
    
    await waitFor(() => {
      expect(odooRepository.toggleCron).toHaveBeenCalledWith(1, 101, true)
    })
  })

  it('exports environments', async () => {
    vi.mocked(odooRepository.exportEnvs).mockResolvedValue([{ id: 1 }] as any)
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const { result } = renderHook(() => useOdoo(''), { wrapper: createWrapper() })
    await result.current.exportEnvs()
    
    expect(odooRepository.exportEnvs).toHaveBeenCalled()
    expect(global.URL.createObjectURL).toHaveBeenCalled()
    clickSpy.mockRestore()
  })
})

describe('useOdooHealth', () => {
  it('calls testConnection for each environment', async () => {
    const envs = [{ id: 1, name: 'E1' } as any, { id: 2, name: 'E2' } as any]
    vi.mocked(odooRepository.testConnection).mockResolvedValue({ status: 'up' } as any)

    renderHook(() => useOdooHealth(envs), { wrapper: createWrapper() })

    expect(odooRepository.testConnection).toHaveBeenCalledWith(1)
    expect(odooRepository.testConnection).toHaveBeenCalledWith(2)
  })
})

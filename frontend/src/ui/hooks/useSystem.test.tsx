import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSystem } from './useSystem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { systemRepository } from '../../adapters/api/AxiosSystemRepository'

vi.mock('../../adapters/api/AxiosSystemRepository', () => ({
  systemRepository: {
    getWebhooks: vi.fn(),
    getS3Configs: vi.fn(),
    getAuditLogs: vi.fn(),
    getConfig: vi.fn(),
    getBackupCron: vi.fn(),
    getDefaultBackupTarget: vi.fn(),
    getBackups: vi.fn(),
    getSchedulerHealth: vi.fn(),
    addWebhook: vi.fn(),
    deleteWebhook: vi.fn(),
    triggerBackup: vi.fn(),
    addS3Config: vi.fn(),
    downloadBackup: vi.fn(),
    restoreBackup: vi.fn(),
    deleteBackup: vi.fn(),
    updateBackupCron: vi.fn(),
    updateDefaultBackupTarget: vi.fn(),
    testWebhook: vi.fn(),
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

describe('useSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(systemRepository.getWebhooks).mockResolvedValue([])
    vi.mocked(systemRepository.getS3Configs).mockResolvedValue([])
    vi.mocked(systemRepository.getAuditLogs).mockResolvedValue({ logs: [], total: 0 })
    vi.mocked(systemRepository.getConfig).mockResolvedValue({} as any)
    vi.mocked(systemRepository.getBackupCron).mockResolvedValue('0 * * * *')
    vi.mocked(systemRepository.getDefaultBackupTarget).mockResolvedValue('local')
    vi.mocked(systemRepository.getBackups).mockResolvedValue([])
    vi.mocked(systemRepository.getSchedulerHealth).mockResolvedValue({} as any)
  })

  it('fetches system data on mount', async () => {
    const mockWebhooks = [{ id: 1, name: 'Hook' }]
    vi.mocked(systemRepository.getWebhooks).mockResolvedValue(mockWebhooks as any)

    const { result } = renderHook(() => useSystem(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.webhooks).toEqual(mockWebhooks))
  })

  it('triggers backup correctly', async () => {
    vi.mocked(systemRepository.triggerBackup).mockResolvedValue({ status: 'success' } as any)
    
    const { result } = renderHook(() => useSystem(), { wrapper: createWrapper() })
    
    await waitFor(() => {
        result.current.triggerBackup()
        return expect(systemRepository.triggerBackup).toHaveBeenCalled()
    })
  })
})

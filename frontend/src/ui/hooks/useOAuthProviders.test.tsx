import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useOAuthProviders } from './useOAuthProviders'
import { odooRepository } from '../../adapters/api/AxiosOdooRepository'

vi.mock('../../adapters/api/AxiosOdooRepository', () => ({
  odooRepository: {
    getOAuthProviders: vi.fn(),
    updateOAuthProvider: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useOAuthProviders', () => {
  beforeAll(() => {
    const store: Record<string, string> = {}
    const stub: Storage = {
      get length() {
        return Object.keys(store).length
      },
      clear() {
        for (const key of Object.keys(store)) delete store[key]
      },
      getItem(key: string) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
      },
      setItem(key: string, value: string) {
        store[key] = String(value)
      },
      removeItem(key: string) {
        delete store[key]
      },
      key(index: number) {
        return Object.keys(store)[index] ?? null
      },
    }
    Object.defineProperty(window, 'localStorage', { value: stub, configurable: true })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    vi.mocked(odooRepository.getOAuthProviders).mockResolvedValue([])
    vi.mocked(odooRepository.updateOAuthProvider).mockResolvedValue(undefined)
  })

  it('returns empty providers when envId is null', () => {
    const { result } = renderHook(() => useOAuthProviders(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.providers).toEqual([])
    expect(result.current.presets).toEqual([])
  })

  it('fetches providers and updates one', async () => {
    vi.mocked(odooRepository.getOAuthProviders).mockResolvedValue([
      { id: 1, name: 'G' } as any,
    ])
    const { result } = renderHook(() => useOAuthProviders(2), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.providers.length).toBe(1))

    act(() => {
      result.current.updateProvider(1, { client_id: 'x' })
    })

    await waitFor(() =>
      expect(odooRepository.updateOAuthProvider).toHaveBeenCalledWith(2, 1, {
        client_id: 'x',
      }),
    )
  })

  it('persists presets to localStorage and applies them', async () => {
    vi.mocked(odooRepository.getOAuthProviders).mockResolvedValue([])
    const { result } = renderHook(() => useOAuthProviders(7), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.addPreset('PROD', { client_id: 'p-id', enabled: true })
    })
    expect(result.current.presets[0].label).toBe('PROD')
    expect(localStorage.getItem('oauthProviderPresets:7')).toContain('PROD')

    const presetId = result.current.presets[0].id
    act(() => {
      result.current.applyPreset(9, presetId)
    })
    await waitFor(() =>
      expect(odooRepository.updateOAuthProvider).toHaveBeenCalledWith(7, 9, {
        client_id: 'p-id',
        enabled: true,
      }),
    )

    act(() => {
      result.current.deletePreset(presetId)
    })
    expect(result.current.presets).toEqual([])
  })

  it('ignores empty preset labels and missing presets', () => {
    const { result } = renderHook(() => useOAuthProviders(4), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.addPreset('   ', { client_id: 'x' })
    })
    expect(result.current.presets).toEqual([])

    act(() => {
      result.current.applyPreset(1, 'missing-id')
    })
    expect(odooRepository.updateOAuthProvider).not.toHaveBeenCalled()
  })

  it('loads previously stored presets on env change', () => {
    localStorage.setItem(
      'oauthProviderPresets:11',
      JSON.stringify([{ id: 'a', label: 'OLD', values: { client_id: 'y' } }]),
    )
    const { result } = renderHook(() => useOAuthProviders(11), {
      wrapper: createWrapper(),
    })
    expect(result.current.presets[0].label).toBe('OLD')
  })

  it('tolerates corrupt localStorage', () => {
    localStorage.setItem('oauthProviderPresets:12', '{not-json')
    const { result } = renderHook(() => useOAuthProviders(12), {
      wrapper: createWrapper(),
    })
    expect(result.current.presets).toEqual([])
  })
})

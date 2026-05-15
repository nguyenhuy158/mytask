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
    expect(localStorage.getItem('oauthProviderPresets:global')).toContain('PROD')

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

  it('loads previously stored presets from global storage', () => {
    localStorage.setItem(
      'oauthProviderPresets:global',
      JSON.stringify([{ id: 'a', label: 'OLD', values: { client_id: 'y' } }]),
    )
    const { result } = renderHook(() => useOAuthProviders(11), {
      wrapper: createWrapper(),
    })
    expect(result.current.presets[0].label).toBe('OLD')
  })

  it('migrates legacy per-env presets into the global store', () => {
    localStorage.setItem(
      'oauthProviderPresets:5',
      JSON.stringify([{ id: 'legacy-a', label: 'LEG_A', values: { client_id: 'a' } }]),
    )
    localStorage.setItem(
      'oauthProviderPresets:6',
      JSON.stringify([
        { id: 'legacy-a', label: 'DUP', values: { client_id: 'a' } },
        { id: 'legacy-b', label: 'LEG_B', values: { client_id: 'b' } },
      ]),
    )
    localStorage.setItem('oauthProviderPresets:7', '{not-json')
    localStorage.setItem('oauthProviderPresets:8', JSON.stringify({ not: 'array' }))
    const { result } = renderHook(() => useOAuthProviders(99), {
      wrapper: createWrapper(),
    })
    const labels = result.current.presets.map((preset) => preset.label).sort()
    expect(labels).toEqual(['LEG_A', 'LEG_B'])
  })

  it('tolerates corrupt localStorage', () => {
    localStorage.setItem('oauthProviderPresets:global', '{not-json')
    localStorage.setItem('oauthProviderDefaults:12', '{not-json')
    const { result } = renderHook(() => useOAuthProviders(12), {
      wrapper: createWrapper(),
    })
    expect(result.current.presets).toEqual([])
    expect(result.current.defaultPresets).toEqual({})
  })

  it('sets, clears, and persists default preset per provider', () => {
    const { result } = renderHook(() => useOAuthProviders(20), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.addPreset('PROD', { client_id: 'p-id' })
    })
    const presetId = result.current.presets[0].id

    act(() => {
      result.current.setDefaultPreset(5, presetId)
    })
    expect(result.current.defaultPresets).toEqual({ 5: presetId })
    expect(localStorage.getItem('oauthProviderDefaults:20')).toContain(presetId)
    expect(localStorage.getItem('oauthProviderPresets:global')).toContain('PROD')

    act(() => {
      result.current.setDefaultPreset(5, '')
    })
    expect(result.current.defaultPresets).toEqual({})
  })

  it('clears default when its preset is deleted', () => {
    const { result } = renderHook(() => useOAuthProviders(21), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.addPreset('PROD', { client_id: 'p-id' })
    })
    const presetId = result.current.presets[0].id

    act(() => {
      result.current.setDefaultPreset(7, presetId)
    })
    expect(result.current.defaultPresets[7]).toBe(presetId)

    act(() => {
      result.current.deletePreset(presetId)
    })
    expect(result.current.defaultPresets).toEqual({})
  })

  it('loads stored defaults on env change and ignores non-object payloads', () => {
    localStorage.setItem(
      'oauthProviderDefaults:30',
      JSON.stringify({ 9: 'abc' }),
    )
    const { result, rerender } = renderHook(
      ({ envId }: { envId: number | null }) => useOAuthProviders(envId),
      {
        wrapper: createWrapper(),
        initialProps: { envId: 30 as number | null },
      },
    )
    expect(result.current.defaultPresets).toEqual({ 9: 'abc' })

    localStorage.setItem('oauthProviderDefaults:31', JSON.stringify(['oops']))
    rerender({ envId: 31 })
    expect(result.current.defaultPresets).toEqual({})

    rerender({ envId: null })
    expect(result.current.defaultPresets).toEqual({})
  })

  it('updates an existing preset by id', () => {
    const { result } = renderHook(() => useOAuthProviders(40), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.addPreset('PROD', { client_id: 'old' })
    })
    const presetId = result.current.presets[0].id

    act(() => {
      result.current.updatePreset(presetId, 'PROD_V2', { client_id: 'new' })
    })
    expect(result.current.presets[0]).toEqual({
      id: presetId,
      label: 'PROD_V2',
      values: { client_id: 'new' },
    })
    expect(localStorage.getItem('oauthProviderPresets:global')).toContain(
      'PROD_V2',
    )
  })

  it('ignores updatePreset with empty label or no env', () => {
    const { result: noEnv } = renderHook(() => useOAuthProviders(null), {
      wrapper: createWrapper(),
    })
    act(() => {
      noEnv.current.updatePreset('x', 'A', { client_id: 'y' })
    })
    expect(noEnv.current.presets).toEqual([])

    const { result } = renderHook(() => useOAuthProviders(41), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.addPreset('PROD', { client_id: 'a' })
    })
    const presetId = result.current.presets[0].id
    act(() => {
      result.current.updatePreset(presetId, '   ', { client_id: 'b' })
    })
    expect(result.current.presets[0].label).toBe('PROD')
  })

  it('ignores setDefaultPreset without an env', () => {
    const { result } = renderHook(() => useOAuthProviders(null), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.setDefaultPreset(1, 'p1')
    })
    expect(result.current.defaultPresets).toEqual({})
  })
})

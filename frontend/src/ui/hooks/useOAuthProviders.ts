import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { odooRepository } from '../../adapters/api/AxiosOdooRepository'
import type {
  OAuthProvider,
  OAuthProviderUpdate,
  OAuthProviderPreset,
} from '../../domain/models/OAuthProvider'

const PRESET_STORAGE_KEY = 'oauthProviderPresets:global'
const LEGACY_PRESET_KEY_PREFIX = 'oauthProviderPresets:'
const defaultStorageKey = (envId: number) => `oauthProviderDefaults:${envId}`

const loadPresets = (): OAuthProviderPreset[] => {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
    const merged: OAuthProviderPreset[] = []
    const seen = new Set<string>()
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (
        !key ||
        !key.startsWith(LEGACY_PRESET_KEY_PREFIX) ||
        key === PRESET_STORAGE_KEY
      )
        continue
      try {
        const legacy = JSON.parse(localStorage.getItem(key) || '[]')
        if (!Array.isArray(legacy)) continue
        legacy.forEach((preset: OAuthProviderPreset) => {
          if (preset?.id && !seen.has(preset.id)) {
            seen.add(preset.id)
            merged.push(preset)
          }
        })
      } catch {
        // ignore corrupt legacy entry
      }
    }
    return merged
  } catch {
    return []
  }
}

const savePresets = (presets: OAuthProviderPreset[]) => {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets))
}

const loadDefaults = (envId: number): Record<number, string> => {
  try {
    const raw = localStorage.getItem(defaultStorageKey(envId))
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {}
  } catch {
    return {}
  }
}

const saveDefaults = (envId: number, defaults: Record<number, string>) => {
  localStorage.setItem(defaultStorageKey(envId), JSON.stringify(defaults))
}

export const useOAuthProviders = (envId: number | null) => {
  const queryClient = useQueryClient()
  const [presets, setPresets] = useState<OAuthProviderPreset[]>(() =>
    loadPresets(),
  )
  const [defaultPresets, setDefaultPresets] = useState<Record<number, string>>({})

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (envId) {
      setDefaultPresets(loadDefaults(envId))
    } else {
      setDefaultPresets({})
    }
  }, [envId])
  /* eslint-enable react-hooks/set-state-in-effect */

  const { data: providers = [], isLoading } = useQuery<OAuthProvider[]>({
    queryKey: ['oauthProviders', envId],
    queryFn: () =>
      envId ? odooRepository.getOAuthProviders(envId) : Promise.resolve([]),
    enabled: !!envId,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      providerId,
      values,
    }: {
      providerId: number
      values: OAuthProviderUpdate
    }) =>
      envId
        ? odooRepository.updateOAuthProvider(envId, providerId, values)
        : Promise.reject(new Error('No environment selected')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauthProviders', envId] })
      toast.success('Provider updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Update failed')
    },
  })

  const persist = useCallback((next: OAuthProviderPreset[]) => {
    savePresets(next)
    setPresets(next)
  }, [])

  const persistDefaults = useCallback(
    (next: Record<number, string>) => {
      if (!envId) return
      saveDefaults(envId, next)
      setDefaultPresets(next)
    },
    [envId],
  )

  const addPreset = useCallback(
    (label: string, values: OAuthProviderUpdate) => {
      if (!label.trim()) return
      const generatedId =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      const preset: OAuthProviderPreset = {
        id: generatedId,
        label: label.trim(),
        values,
      }
      persist([...presets, preset])
      toast.success(`Preset "${preset.label}" saved`)
    },
    [presets, persist],
  )

  const updatePreset = useCallback(
    (presetId: string, label: string, values: OAuthProviderUpdate) => {
      if (!label.trim()) return
      const next = presets.map((preset) =>
        preset.id === presetId
          ? { ...preset, label: label.trim(), values }
          : preset,
      )
      persist(next)
      toast.success(`Preset "${label.trim()}" updated`)
    },
    [presets, persist],
  )

  const deletePreset = useCallback(
    (presetId: string) => {
      persist(presets.filter((preset) => preset.id !== presetId))
      const nextDefaults = Object.fromEntries(
        Object.entries(defaultPresets).filter(([, value]) => value !== presetId),
      )
      if (Object.keys(nextDefaults).length !== Object.keys(defaultPresets).length) {
        persistDefaults(nextDefaults)
      }
    },
    [presets, persist, defaultPresets, persistDefaults],
  )

  const applyPreset = useCallback(
    (providerId: number, presetId: string) => {
      const preset = presets.find((p) => p.id === presetId)
      if (!preset) {
        toast.error('Preset not found')
        return
      }
      updateMutation.mutate({ providerId, values: preset.values })
    },
    [presets, updateMutation],
  )

  const setDefaultPreset = useCallback(
    (providerId: number, presetId: string) => {
      const next = { ...defaultPresets }
      if (!presetId) {
        delete next[providerId]
      } else {
        next[providerId] = presetId
      }
      persistDefaults(next)
      toast.success(presetId ? 'Default preset set' : 'Default preset cleared')
    },
    [defaultPresets, persistDefaults],
  )

  return {
    providers,
    loading: isLoading,
    presets,
    defaultPresets,
    addPreset,
    updatePreset,
    deletePreset,
    applyPreset,
    setDefaultPreset,
    updateProvider: (providerId: number, values: OAuthProviderUpdate) =>
      updateMutation.mutate({ providerId, values }),
    updating: updateMutation.isPending,
  }
}

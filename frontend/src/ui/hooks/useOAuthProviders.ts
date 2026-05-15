import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { odooRepository } from '../../adapters/api/AxiosOdooRepository'
import type {
  OAuthProvider,
  OAuthProviderUpdate,
  OAuthProviderPreset,
} from '../../domain/models/OAuthProvider'

const presetStorageKey = (envId: number) => `oauthProviderPresets:${envId}`

const loadPresets = (envId: number): OAuthProviderPreset[] => {
  try {
    const raw = localStorage.getItem(presetStorageKey(envId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const savePresets = (envId: number, presets: OAuthProviderPreset[]) => {
  localStorage.setItem(presetStorageKey(envId), JSON.stringify(presets))
}

export const useOAuthProviders = (envId: number | null) => {
  const queryClient = useQueryClient()
  const [presets, setPresets] = useState<OAuthProviderPreset[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (envId) setPresets(loadPresets(envId))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setPresets([])
  }, [envId])

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

  const persist = useCallback(
    (next: OAuthProviderPreset[]) => {
      if (!envId) return
      savePresets(envId, next)
      setPresets(next)
    },
    [envId],
  )

  const addPreset = useCallback(
    (label: string, values: OAuthProviderUpdate) => {
      if (!envId || !label.trim()) return
      const preset: OAuthProviderPreset = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: label.trim(),
        values,
      }
      persist([...presets, preset])
      toast.success(`Preset "${preset.label}" saved`)
    },
    [envId, presets, persist],
  )

  const deletePreset = useCallback(
    (presetId: string) => {
      persist(presets.filter((preset) => preset.id !== presetId))
    },
    [presets, persist],
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

  return {
    providers,
    loading: isLoading,
    presets,
    addPreset,
    deletePreset,
    applyPreset,
    updateProvider: (providerId: number, values: OAuthProviderUpdate) =>
      updateMutation.mutate({ providerId, values }),
    updating: updateMutation.isPending,
  }
}

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import type { Cron } from '../../domain/models/Cron'
import type { OdooEnv } from '../../domain/models/OdooEnv'
import { odooRepository } from '../../adapters/api/AxiosOdooRepository'
import { sortCrons, filterCrons } from '../../domain/services/CronService'
import toast from 'react-hot-toast'

export const useOdooHealth = (envs: OdooEnv[]) => {
  return useQueries({
    queries: envs.map((env) => ({
      queryKey: ['odooHealth', env.id],
      queryFn: () => odooRepository.testConnection(env.id),
      refetchInterval: 30000, // Every 30s
    })),
  })
}

export const useOdoo = (searchTerm: string) => {
  const queryClient = useQueryClient()
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Cron | 'interval' | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc',
  })

  const { data: envs = [] } = useQuery({
    queryKey: ['odooEnvs'],
    queryFn: () => odooRepository.getEnvs(),
  })

  useEffect(() => {
    if (envs.length > 0 && !selectedEnvId) {
      const defaultEnv = envs.find((e: OdooEnv) => e.is_default)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (defaultEnv) setSelectedEnvId(defaultEnv.id)
    }
  }, [envs, selectedEnvId])

  const { data: crons = [], isLoading: cronsLoading } = useQuery({
    queryKey: ['odooCrons', selectedEnvId],
    queryFn: () => (selectedEnvId ? odooRepository.getCrons(selectedEnvId) : Promise.resolve([])),
    enabled: !!selectedEnvId,
  })

  const { data: report = [], isLoading: reportLoading } = useQuery({
    queryKey: ['odooReport', selectedEnvId],
    queryFn: () =>
      selectedEnvId ? odooRepository.getDisbursementReport(selectedEnvId) : Promise.resolve([]),
    enabled: !!selectedEnvId,
  })

  const toggleCronMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      selectedEnvId ? odooRepository.toggleCron(selectedEnvId, id, active) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odooCrons', selectedEnvId] })
      toast.success('Cron updated')
    },
  })

  const runCronMutation = useMutation({
    mutationFn: (id: number) =>
      selectedEnvId ? odooRepository.runCron(selectedEnvId, id) : Promise.reject(),
    onSuccess: () => toast.success('Cron triggered'),
  })

  const addEnvMutation = useMutation({
    mutationFn: (env: Partial<OdooEnv>) => odooRepository.addEnv(env),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odooEnvs'] })
      toast.success('Environment added')
    },
  })

  const updateEnvMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OdooEnv> }) =>
      odooRepository.updateEnv(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odooEnvs'] })
      toast.success('Environment updated')
    },
  })

  const deleteEnvMutation = useMutation({
    mutationFn: (id: number) => odooRepository.deleteEnv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odooEnvs'] })
      toast.success('Environment deleted')
    },
  })

  const sortedCrons = useMemo(() => {
    if (!sortConfig.key) return crons
    return sortCrons(crons, sortConfig.key, sortConfig.direction)
  }, [crons, sortConfig])

  const filteredCrons = useMemo(() => {
    return filterCrons(sortedCrons, searchTerm)
  }, [sortedCrons, searchTerm])

  const requestSort = (key: keyof Cron | 'interval') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return {
    envs,
    crons,
    report,
    selectedEnvId,
    setSelectedEnvId,
    filteredCrons,
    loading: cronsLoading || reportLoading ? 'loading' : null,
    sortConfig,
    requestSort,
    toggleCron: (id: number, active: boolean) => toggleCronMutation.mutate({ id, active }),
    runCron: (id: number) => runCronMutation.mutate(id),
    fetchEnvs: () => queryClient.invalidateQueries({ queryKey: ['odooEnvs'] }),
    addEnv: (env: Partial<OdooEnv>) => addEnvMutation.mutate(env),
    updateEnv: (id: number, data: Partial<OdooEnv>) => updateEnvMutation.mutate({ id, data }),
    deleteEnv: (id: number) => deleteEnvMutation.mutate(id),
    duplicateEnv: async (id: number) => {
      await odooRepository.duplicateEnv(id)
      queryClient.invalidateQueries({ queryKey: ['odooEnvs'] })
    },
    setDefaultEnv: async (id: number) => {
      await odooRepository.setDefaultEnv(id)
      queryClient.invalidateQueries({ queryKey: ['odooEnvs'] })
    },
    testEnv: async (id: number) => {
      const res = await odooRepository.testEnv(id)
      return res.status === 'success'
    },
    exportEnvs: async () => {
      const data = await odooRepository.exportEnvs()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `odoo-envs.json`
      a.click()
    },
    importEnvs: async (data: Partial<OdooEnv>[]) => {
      await odooRepository.importEnvs(data)
      queryClient.invalidateQueries({ queryKey: ['odooEnvs'] })
    },
  }
}

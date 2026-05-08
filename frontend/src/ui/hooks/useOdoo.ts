import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Cron } from '../../domain/models/Cron'
import type { OdooEnv, DisbursementReport } from '../../domain/models/OdooEnv'
import { odooRepository } from '../../adapters/api/AxiosOdooRepository'
import { sortCrons, filterCrons } from '../../domain/services/CronService'
import toast from 'react-hot-toast'

export const useOdoo = (searchTerm: string) => {
  const [envs, setEnvs] = useState<OdooEnv[]>([])
  const [crons, setCrons] = useState<Cron[]>([])
  const [report, setReport] = useState<DisbursementReport[]>([])
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Cron | 'interval' | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc',
  })

  const fetchEnvs = useCallback(async () => {
    try {
      const data = await odooRepository.getEnvs()
      setEnvs(data)
      if (data.length > 0 && !selectedEnvId) {
        setSelectedEnvId(data[0].id)
      }
    } catch {
      toast.error('Failed to fetch environments')
    }
  }, [selectedEnvId])

  const fetchCrons = useCallback(async (envId: number, silent = false) => {
    if (!silent) setLoading('crons')
    try {
      const data = await odooRepository.getCrons(envId)
      setCrons(data)
    } catch (err) {
      console.error(`Failed to fetch crons for env ${envId}:`, err)
      toast.error('Failed to fetch crons')
      throw err
    } finally {
      if (!silent) setLoading(null)
    }
  }, [])

  const fetchReport = useCallback(async (envId: number, silent = false) => {
    if (!silent) setLoading('report')
    try {
      const data = await odooRepository.getDisbursementReport(envId)
      setReport(data)
    } catch (err) {
      console.error(`Failed to fetch report for env ${envId}:`, err)
      toast.error('Failed to fetch report')
      throw err
    } finally {
      if (!silent) setLoading(null)
    }
  }, [])

  const toggleCron = useCallback(
    async (cronId: number, active: boolean) => {
      if (!selectedEnvId) return
      try {
        await odooRepository.toggleCron(selectedEnvId, cronId, active)
        setCrons((prev) => prev.map((c) => (c.id === cronId ? { ...c, active } : c)))
        toast.success(active ? 'Cron activated' : 'Cron deactivated')
      } catch {
        toast.error('Failed to toggle cron')
      }
    },
    [selectedEnvId],
  )

  const runCron = useCallback(
    async (cronId: number) => {
      if (!selectedEnvId) return
      try {
        await odooRepository.runCron(selectedEnvId, cronId)
        toast.success('Cron triggered successfully')
      } catch {
        toast.error('Failed to run cron')
      }
    },
    [selectedEnvId],
  )

  useEffect(() => {
    const init = async () => {
      await fetchEnvs()
    }
    init()
  }, [fetchEnvs])

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      if (selectedEnvId) {
        console.log(`Switching to environment: ${selectedEnvId}`)
        setCrons([])
        setReport([])
        setLoading('fetching')
        try {
          await Promise.all([fetchCrons(selectedEnvId, true), fetchReport(selectedEnvId, true)])
          console.log('Successfully fetched environment data')
        } catch (err) {
          console.error('Environment init failed:', err)
        } finally {
          if (isMounted) setLoading(null)
        }
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [selectedEnvId, fetchCrons, fetchReport])

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

  const addEnv = useCallback(async (env: Partial<OdooEnv>) => {
    try {
      const newEnv = await odooRepository.addEnv(env)
      setEnvs((prev) => [...prev, newEnv])
      toast.success('Environment added')
    } catch {
      toast.error('Failed to add environment')
    }
  }, [])

  const updateEnv = useCallback(async (id: number, data: Partial<OdooEnv>) => {
    try {
      const updated = await odooRepository.updateEnv(id, data)
      setEnvs((prev) => prev.map((e) => (e.id === id ? updated : e)))
      toast.success('Environment updated')
    } catch {
      toast.error('Failed to update environment')
    }
  }, [])

  const deleteEnv = useCallback(async (id: number) => {
    if (!confirm('Delete this environment?')) return
    try {
      await odooRepository.deleteEnv(id)
      setEnvs((prev) => prev.filter((e) => e.id !== id))
      toast.success('Environment deleted')
    } catch {
      toast.error('Failed to delete environment')
    }
  }, [])

  const testEnv = useCallback(async (id: number) => {
    try {
      const res = await odooRepository.testEnv(id)
      if (res.status === 'success') {
        toast.success(`Connection successful!`)
        return true
      } else {
        toast.error(`Connection failed: ${res.message}`)
        return false
      }
    } catch {
      toast.error('Failed to test connection')
      return false
    }
  }, [])

  const exportEnvs = useCallback(async () => {
    try {
      const data = await odooRepository.exportEnvs()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `odoo-envs-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Environments exported')
    } catch {
      toast.error('Failed to export environments')
    }
  }, [])

  const importEnvs = useCallback(async (envsData: Partial<OdooEnv>[]) => {
    try {
      const imported = await odooRepository.importEnvs(envsData)
      setEnvs((prev) => [...prev, ...imported])
      toast.success(`Imported ${imported.length} environments`)
    } catch {
      toast.error('Failed to import environments')
    }
  }, [])

  return {
    envs,
    setEnvs,
    crons,
    report,
    selectedEnvId,
    setSelectedEnvId,
    filteredCrons,
    loading,
    sortConfig,
    requestSort,
    toggleCron,
    runCron,
    fetchEnvs,
    addEnv,
    updateEnv,
    deleteEnv,
    testEnv,
    fetchReport,
    exportEnvs,
    importEnvs,
  }
}

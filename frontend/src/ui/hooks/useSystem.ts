import { useState, useEffect, useCallback } from 'react'
import { systemRepository } from '../../adapters/api/AxiosSystemRepository'
import type { Webhook } from '../../domain/models/Webhook'
import type { S3Config, S3Backup } from '../../domain/models/S3'
import type {
  AuditLog,
  LocalBackup,
  SystemConfig,
  SchedulerHealth,
} from '../../domain/models/System'
import toast from 'react-hot-toast'

export const useSystem = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [s3Configs, setS3Configs] = useState<S3Config[]>([])
  const [s3Backups, setS3Backups] = useState<Record<number, S3Backup[]>>({})
  const [backups, setBackups] = useState<LocalBackup[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [backupCron, setBackupCron] = useState('0 * * * *')
  const [defaultBackupTarget, setDefaultBackupTarget] = useState('local')
  const [schedulerHealth, setSchedulerHealth] = useState<SchedulerHealth | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    try {
      const data = await systemRepository.getWebhooks()
      setWebhooks(data)
    } catch (err) {
      console.error('Failed to fetch webhooks', err)
    }
  }, [])

  const fetchS3Configs = useCallback(async () => {
    try {
      const data = await systemRepository.getS3Configs()
      setS3Configs(data)
    } catch {
      toast.error('Failed to fetch S3 configurations')
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    try {
      const data = await systemRepository.getAuditLogs()
      setAuditLogs(data)
    } catch (err) {
      console.error('Failed to fetch audit logs', err)
    }
  }, [])

  const fetchConfig = useCallback(async () => {
    try {
      const data = await systemRepository.getConfig()
      setConfig(data)
    } catch (err) {
      console.error('Failed to fetch config', err)
    }
  }, [])

  const fetchBackupCron = useCallback(async () => {
    try {
      const cron = await systemRepository.getBackupCron()
      setBackupCron(cron)
    } catch (err) {
      console.error('Failed to fetch backup cron', err)
    }
  }, [])

  const fetchDefaultBackupTarget = useCallback(async () => {
    try {
      const target = await systemRepository.getDefaultBackupTarget()
      setDefaultBackupTarget(target)
    } catch (err) {
      console.error('Failed to fetch default backup target', err)
    }
  }, [])

  const fetchBackups = useCallback(async () => {
    try {
      const data = await systemRepository.getBackups()
      setBackups(data)
    } catch (err) {
      console.error('Failed to fetch backups', err)
    }
  }, [])

  const downloadBackup = useCallback(async (filename: string) => {
    await systemRepository.downloadBackup(filename)
  }, [])

  const restoreBackup = useCallback(async (filename: string) => {
    if (!confirm(`Restore from ${filename}? Current database will be overwritten.`)) return
    try {
      setLoading('restoring')
      await systemRepository.restoreBackup(filename)
      toast.success('System restored')
      window.location.reload()
    } catch {
      toast.error('Restore failed')
    } finally {
      setLoading(null)
    }
  }, [])

  const deleteBackup = useCallback(
    async (filename: string) => {
      if (!confirm('Delete this backup?')) return
      try {
        await systemRepository.deleteBackup(filename)
        setBackups((prev) => prev.filter((b) => b.filename !== filename))
        toast.success('Backup deleted')
      } catch {
        toast.error('Delete failed')
      }
    },
    [setBackups],
  )

  const fetchSchedulerHealth = useCallback(async () => {
    try {
      const data = await systemRepository.getSchedulerHealth()
      setSchedulerHealth(data)
    } catch (err) {
      console.error('Failed to fetch scheduler health', err)
    }
  }, [])

  const fetchAll = useCallback(() => {
    fetchWebhooks()
    fetchS3Configs()
    fetchAuditLogs()
    fetchConfig()
    fetchBackupCron()
    fetchDefaultBackupTarget()
    fetchBackups()
    fetchSchedulerHealth()
  }, [
    fetchWebhooks,
    fetchS3Configs,
    fetchAuditLogs,
    fetchConfig,
    fetchBackupCron,
    fetchDefaultBackupTarget,
    fetchBackups,
    fetchSchedulerHealth,
  ])

  useEffect(() => {
    const init = async () => {
      await fetchAll()
    }
    init()
  }, [fetchAll])

  const fetchS3Backups = useCallback(async (id: number) => {
    setLoading(`s3-list-${id}`)
    try {
      const data = await systemRepository.getS3Backups(id)
      setS3Backups((prev) => ({ ...prev, [id]: data }))
    } finally {
      setLoading(null)
    }
  }, [])

  const triggerBackup = useCallback(async () => {
    try {
      await systemRepository.triggerBackup()
      toast.success('Backup triggered')
      fetchBackups()
    } catch {
      toast.error('Failed to trigger backup')
    }
  }, [fetchBackups])

  const updateBackupCron = useCallback(async (cron: string) => {
    try {
      await systemRepository.updateBackupCron(cron)
      setBackupCron(cron)
      toast.success('Backup schedule updated')
    } catch {
      toast.error('Failed to update schedule')
    }
  }, [])

  const updateDefaultBackupTarget = useCallback(async (target: string) => {
    try {
      await systemRepository.updateDefaultBackupTarget(target)
      setDefaultBackupTarget(target)
      toast.success('Backup target updated')
    } catch {
      toast.error('Failed to update target')
    }
  }, [])

  const addWebhook = useCallback(async (webhook: Partial<Webhook>) => {
    try {
      const newWebhook = await systemRepository.addWebhook(webhook)
      setWebhooks((prev) => [...prev, newWebhook])
      toast.success('Webhook added')
    } catch {
      toast.error('Failed to add webhook')
    }
  }, [])

  const deleteWebhook = useCallback(async (id: number) => {
    if (!confirm('Delete this webhook?')) return
    try {
      await systemRepository.deleteWebhook(id)
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
      toast.success('Webhook deleted')
    } catch {
      toast.error('Failed to delete webhook')
    }
  }, [])

  const testWebhook = useCallback(async (id: number) => {
    try {
      const res = await systemRepository.testWebhook(id)
      if (res.status === 'success') {
        toast.success('Test notification sent!')
      } else {
        toast.error(`Test failed: ${res.message}`)
      }
    } catch {
      toast.error('Failed to send test notification')
    }
  }, [])

  const addS3Config = useCallback(async (config: Partial<S3Config>) => {
    try {
      const newConfig = await systemRepository.addS3Config(config)
      setS3Configs((prev) => [...prev, newConfig])
      toast.success('S3 configuration added')
    } catch {
      toast.error('Failed to add S3 configuration')
    }
  }, [])

  return {
    webhooks,
    s3Configs,
    s3Backups,
    backups,
    auditLogs,
    config,
    backupCron,
    defaultBackupTarget,
    schedulerHealth,
    loading,
    fetchAll,
    fetchS3Backups,
    triggerBackup,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    updateBackupCron,
    updateDefaultBackupTarget,
    addWebhook,
    deleteWebhook,
    testWebhook,
    addS3Config,
  }
}

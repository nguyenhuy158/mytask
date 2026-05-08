import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { systemRepository } from '../../adapters/api/AxiosSystemRepository'
import type { Webhook } from '../../domain/models/Webhook'
import type { S3Config } from '../../domain/models/S3'
import toast from 'react-hot-toast'
import { confirmAction } from '@/lib/toast-confirm'

export const useSystem = (skip: number = 0, take: number = 20) => {
  const queryClient = useQueryClient()

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => systemRepository.getWebhooks(),
  })

  const { data: s3Configs = [] } = useQuery({
    queryKey: ['s3Configs'],
    queryFn: () => systemRepository.getS3Configs(),
  })

  const { data: auditLogsData = { logs: [], total: 0 } } = useQuery({
    queryKey: ['auditLogs', skip, take],
    queryFn: () => systemRepository.getAuditLogs(skip, take),
    refetchInterval: 10000,
  })

  const auditLogs = auditLogsData.logs
  const totalLogs = auditLogsData.total

  const { data: config = null } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: () => systemRepository.getConfig(),
  })

  const { data: backupCron = '0 * * * *' } = useQuery({
    queryKey: ['backupCron'],
    queryFn: () => systemRepository.getBackupCron(),
  })

  const { data: defaultBackupTarget = 'local' } = useQuery({
    queryKey: ['defaultBackupTarget'],
    queryFn: () => systemRepository.getDefaultBackupTarget(),
  })

  const { data: backups = [] } = useQuery({
    queryKey: ['backups'],
    queryFn: () => systemRepository.getBackups(),
  })

  const { data: schedulerHealth = null } = useQuery({
    queryKey: ['schedulerHealth'],
    queryFn: () => systemRepository.getSchedulerHealth(),
  })

  const addWebhookMutation = useMutation({
    mutationFn: (webhook: Partial<Webhook>) => systemRepository.addWebhook(webhook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook added')
    },
  })

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => systemRepository.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook deleted')
    },
  })

  const triggerBackupMutation = useMutation({
    mutationFn: () => systemRepository.triggerBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      toast.success('Backup triggered')
    },
  })

  const addS3ConfigMutation = useMutation({
    mutationFn: (config: Partial<S3Config>) => systemRepository.addS3Config(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['s3Configs'] })
      toast.success('S3 configuration added')
    },
  })

  const fetchAll = useCallback(() => {
    queryClient.invalidateQueries()
  }, [queryClient])

  return {
    webhooks,
    s3Configs,
    auditLogs,
    totalLogs,
    config,
    backupCron,
    defaultBackupTarget,
    backups,
    schedulerHealth,
    loading: null,
    fetchAll,
    triggerBackup: () => triggerBackupMutation.mutate(),
    addWebhook: (webhook: Partial<Webhook>) => addWebhookMutation.mutate(webhook),
    deleteWebhook: (id: number) => deleteWebhookMutation.mutate(id),
    addS3Config: (config: Partial<S3Config>) => addS3ConfigMutation.mutate(config),
    downloadBackup: (filename: string) => systemRepository.downloadBackup(filename),
    restoreBackup: async (filename: string) => {
      if (!(await confirmAction(`Restore from ${filename}?`))) return
      await systemRepository.restoreBackup(filename)
      window.location.reload()
    },
    deleteBackup: async (filename: string) => {
      if (!(await confirmAction('Delete this backup?'))) return
      await systemRepository.deleteBackup(filename)
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
    updateBackupCron: async (cron: string) => {
      await systemRepository.updateBackupCron(cron)
      queryClient.invalidateQueries({ queryKey: ['backupCron'] })
    },
    updateDefaultBackupTarget: async (target: string) => {
      await systemRepository.updateDefaultBackupTarget(target)
      queryClient.invalidateQueries({ queryKey: ['defaultBackupTarget'] })
    },
    testWebhook: async (id: number) => {
      const res = await systemRepository.testWebhook(id)
      if (res.status === 'success') toast.success('Test notification sent!')
      else toast.error(`Test failed: ${res.message}`)
    },
  }
}

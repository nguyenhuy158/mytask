import axios from 'axios'
import type { ISystemRepository } from '../../ports/ISystemRepository'
import type { Webhook } from '../../domain/models/Webhook'
import type { S3Config, S3Backup } from '../../domain/models/S3'
import type {
  AuditLog,
  SystemConfig,
  SchedulerHealth,
  LocalBackup,
} from '../../domain/models/System'

const API_BASE = '/api'

export class AxiosSystemRepository implements ISystemRepository {
  async getWebhooks(): Promise<Webhook[]> {
    const res = await axios.get(`${API_BASE}/webhooks`)
    return res.data
  }

  async addWebhook(webhook: Partial<Webhook>): Promise<Webhook> {
    const res = await axios.post(`${API_BASE}/webhooks`, webhook)
    return res.data
  }

  async deleteWebhook(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/webhooks/${id}`)
  }

  async testWebhook(id: number): Promise<{ status: string; message?: string }> {
    const res = await axios.post(`${API_BASE}/webhooks/${id}/test`)
    return res.data
  }

  async getS3Configs(): Promise<S3Config[]> {
    const res = await axios.get(`${API_BASE}/s3-configs`)
    return res.data
  }

  async addS3Config(config: Partial<S3Config>): Promise<S3Config> {
    const res = await axios.post(`${API_BASE}/s3-configs`, config)
    return res.data
  }

  async deleteS3Config(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/s3-configs/${id}`)
  }

  async testS3Connection(config: Partial<S3Config>): Promise<{ status: string; message?: string }> {
    const res = await axios.post(`${API_BASE}/s3-configs/test`, config)
    return res.data
  }

  async getS3Backups(configId: number): Promise<S3Backup[]> {
    const res = await axios.get(`${API_BASE}/s3/${configId}/backups`)
    return res.data
  }

  async backupToS3(
    configId: number,
  ): Promise<{ status: string; result: string; message?: string }> {
    const res = await axios.post(`${API_BASE}/s3/${configId}/backup`)
    return res.data
  }

  async restoreFromS3(
    configId: number,
    key: string,
  ): Promise<{ status: string; result: string; message?: string }> {
    const res = await axios.post(`${API_BASE}/s3/${configId}/restore/${key}`)
    return res.data
  }

  async deleteS3Backup(configId: number, key: string): Promise<void> {
    await axios.delete(`${API_BASE}/s3/${configId}/backups/${key}`)
  }

  async getConfig(): Promise<SystemConfig> {
    const res = await axios.get(`${API_BASE}/config`)
    return res.data
  }

  async getBackups(): Promise<LocalBackup[]> {
    const res = await axios.get(`${API_BASE}/backups`)
    return res.data
  }

  async downloadBackup(filename: string): Promise<void> {
    window.open(`${API_BASE}/backups/download/${filename}`, '_blank')
  }

  async restoreBackup(filename: string): Promise<void> {
    await axios.post(`${API_BASE}/backups/restore/${filename}`)
  }

  async deleteBackup(filename: string): Promise<void> {
    await axios.delete(`${API_BASE}/backups/${filename}`)
  }

  async getBackupCron(): Promise<string> {
    const res = await axios.get(`${API_BASE}/config/backup-cron`)
    return res.data.cron
  }

  async updateBackupCron(cron: string): Promise<void> {
    await axios.post(`${API_BASE}/config/backup-cron`, { cron })
  }

  async getDefaultBackupTarget(): Promise<string> {
    const res = await axios.get(`${API_BASE}/config/default-backup-target`)
    return res.data.target
  }

  async updateDefaultBackupTarget(target: string): Promise<void> {
    await axios.post(`${API_BASE}/config/default-backup-target`, { target })
  }

  async triggerBackup(): Promise<{ status: string; result: string }> {
    const res = await axios.post(`${API_BASE}/tasks/backup`)
    return res.data
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await axios.get(`${API_BASE}/audit-logs`)
    return res.data
  }

  async getSchedulerHealth(): Promise<SchedulerHealth> {
    const res = await axios.get(`${API_BASE}/health/scheduler`)
    return res.data
  }
}

export const systemRepository = new AxiosSystemRepository()

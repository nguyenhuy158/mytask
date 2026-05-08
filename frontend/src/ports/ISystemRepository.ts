import type { Webhook } from '../domain/models/Webhook'
import type { S3Config, S3Backup } from '../domain/models/S3'
import type { AuditLog, SystemConfig, SchedulerHealth, LocalBackup } from '../domain/models/System'
export interface ISystemRepository {
  getWebhooks(): Promise<Webhook[]>
  addWebhook(webhook: Partial<Webhook>): Promise<Webhook>
  deleteWebhook(id: number): Promise<void>
  testWebhook(id: number): Promise<{ status: string; message?: string }>
  getS3Configs(): Promise<S3Config[]>
  addS3Config(config: Partial<S3Config>): Promise<S3Config>
  deleteS3Config(id: number): Promise<void>
  testS3Connection(config: Partial<S3Config>): Promise<{ status: string; message?: string }>
  getS3Backups(configId: number): Promise<S3Backup[]>
  backupToS3(configId: number): Promise<{ status: string; result: string; message?: string }>
  restoreFromS3(
    configId: number,
    key: string,
  ): Promise<{ status: string; result: string; message?: string }>
  deleteS3Backup(configId: number, key: string): Promise<void>
  getConfig(): Promise<SystemConfig>
  getBackups(): Promise<LocalBackup[]>
  downloadBackup(filename: string): Promise<void>
  restoreBackup(filename: string): Promise<void>
  deleteBackup(filename: string): Promise<void>
  getBackupCron(): Promise<string>
  updateBackupCron(cron: string): Promise<void>
  getDefaultBackupTarget(): Promise<string>
  updateDefaultBackupTarget(target: string): Promise<void>
  triggerBackup(): Promise<{ status: string; result: string }>
  getAuditLogs(): Promise<AuditLog[]>
  getSchedulerHealth(): Promise<SchedulerHealth>
}

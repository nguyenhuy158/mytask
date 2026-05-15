import type { OdooEnv, DisbursementReport } from '../domain/models/OdooEnv'
import type { Cron } from '../domain/models/Cron'
import type { OAuthProvider, OAuthProviderUpdate } from '../domain/models/OAuthProvider'
export interface IOdooRepository {
  getEnvs(): Promise<OdooEnv[]>
  addEnv(env: Partial<OdooEnv>): Promise<OdooEnv>
  updateEnv(id: number, data: Partial<OdooEnv>): Promise<OdooEnv>
  deleteEnv(id: number): Promise<void>
  duplicateEnv(id: number): Promise<OdooEnv>
  setDefaultEnv(id: number): Promise<void>
  testEnv(id: number): Promise<{ status: string; message?: string }>
  testConnection(env: Partial<OdooEnv>): Promise<{ status: string; message?: string }>
  getCrons(envId: number): Promise<Cron[]>
  toggleCron(envId: number, cronId: number, active: boolean): Promise<void>
  runCron(envId: number, cronId: number): Promise<void>
  getDisbursementReport(envId: number): Promise<DisbursementReport[]>
  getOAuthProviders(envId: number): Promise<OAuthProvider[]>
  updateOAuthProvider(envId: number, providerId: number, values: OAuthProviderUpdate): Promise<void>
  exportEnvs(): Promise<OdooEnv[]>
  importEnvs(envs: Partial<OdooEnv>[]): Promise<OdooEnv[]>
}

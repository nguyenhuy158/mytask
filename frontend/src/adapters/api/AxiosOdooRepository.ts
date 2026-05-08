import axios from 'axios'
import type { IOdooRepository } from '../../ports/IOdooRepository'
import type { OdooEnv, DisbursementReport } from '../../domain/models/OdooEnv'
import type { Cron } from '../../domain/models/Cron'
const API_BASE = '/api'
export class AxiosOdooRepository implements IOdooRepository {
  async getEnvs(): Promise<OdooEnv[]> {
    const res = await axios.get(`${API_BASE}/envs`)
    return res.data
  }
  async addEnv(env: Partial<OdooEnv>): Promise<OdooEnv> {
    const res = await axios.post(`${API_BASE}/envs`, env)
    return res.data
  }
  async updateEnv(id: number, data: Partial<OdooEnv>): Promise<OdooEnv> {
    const res = await axios.patch(`${API_BASE}/envs/${id}`, data)
    return res.data
  }
  async deleteEnv(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/envs/${id}`)
  }
  async duplicateEnv(id: number): Promise<OdooEnv> {
    const res = await axios.post(`${API_BASE}/envs/${id}/duplicate`)
    return res.data
  }
  async setDefaultEnv(id: number): Promise<void> {
    await axios.post(`${API_BASE}/envs/${id}/set-default`)
  }
  async testEnv(id: number): Promise<{ status: string; message?: string }> {
    const res = await axios.get(`${API_BASE}/odoo/${id}/test`)
    return res.data
  }
  async testConnection(env: Partial<OdooEnv>): Promise<{ status: string; message?: string }> {
    const res = await axios.post(`${API_BASE}/odoo/test-connection`, env)
    return res.data
  }
  async getCrons(envId: number): Promise<Cron[]> {
    const res = await axios.get(`${API_BASE}/odoo/${envId}/crons`)
    return res.data
  }
  async toggleCron(envId: number, cronId: number, active: boolean): Promise<void> {
    await axios.post(`${API_BASE}/odoo/${envId}/crons/${cronId}/toggle?active=${active}`)
  }
  async runCron(envId: number, cronId: number): Promise<void> {
    await axios.post(`${API_BASE}/odoo/${envId}/crons/${cronId}/run`)
  }
  async getDisbursementReport(envId: number): Promise<DisbursementReport[]> {
    const res = await axios.get(`${API_BASE}/odoo/${envId}/disbursement-report`)
    return res.data
  }
  async exportEnvs(): Promise<OdooEnv[]> {
    const res = await axios.get(`${API_BASE}/envs/export`)
    return res.data
  }
  async importEnvs(envs: Partial<OdooEnv>[]): Promise<OdooEnv[]> {
    const res = await axios.post(`${API_BASE}/envs/import`, envs)
    return res.data
  }
}
export const odooRepository = new AxiosOdooRepository()

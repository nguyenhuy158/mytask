import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosOdooRepository } from './AxiosOdooRepository'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('AxiosOdooRepository', () => {
  let repo: AxiosOdooRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new AxiosOdooRepository()
    mockedAxios.create.mockReturnValue(mockedAxios as any)
  })

  it('getEnvs should return environments', async () => {
    const mockData = [{ id: 1, name: 'Prod' }]
    mockedAxios.get.mockResolvedValue({ data: mockData })

    const result = await repo.getEnvs()
    expect(result).toEqual(mockData)
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/envs')
  })

  it('testConnection should return boolean', async () => {
    const mockRes = { status: 'success' }
    mockedAxios.post.mockResolvedValue({ data: mockRes })
    const result = await repo.testConnection({} as any)
    expect(result).toEqual(mockRes)
  })

  it('getOAuthProviders fetches list', async () => {
    const mockData = [{ id: 1, name: 'Google OAuth2' }]
    mockedAxios.get.mockResolvedValue({ data: mockData })
    const result = await repo.getOAuthProviders(2)
    expect(result).toEqual(mockData)
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/odoo/2/oauth-providers')
  })

  it('updateOAuthProvider sends PATCH with values', async () => {
    mockedAxios.patch.mockResolvedValue({ data: { status: 'success' } })
    await repo.updateOAuthProvider(2, 5, { client_id: 'abc', enabled: false })
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      '/api/odoo/2/oauth-providers/5',
      { client_id: 'abc', enabled: false },
    )
  })
})

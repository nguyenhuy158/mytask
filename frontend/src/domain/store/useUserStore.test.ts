import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserStore } from './useUserStore'

// Mock zustand persist middleware to avoid localStorage issues
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware') as any
  return {
    ...actual,
    persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  }
})

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null, isAuthenticated: false })
  })

  it('should have initial state', () => {
    const state = useUserStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should login correctly', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test' }
    useUserStore.getState().login(user)
    
    const state = useUserStore.getState()
    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should logout correctly', () => {
    useUserStore.getState().logout()
    const state = useUserStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})

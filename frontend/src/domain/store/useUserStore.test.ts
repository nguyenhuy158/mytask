import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from './useUserStore'

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.getState().logout()
  })

  it('should have initial state', () => {
    expect(useUserStore.getState().user).toBeNull()
    expect(useUserStore.getState().isAuthenticated).toBe(false)
  })

  it('should login correctly', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com', role: 'admin' as const }
    useUserStore.getState().login(user)
    expect(useUserStore.getState().user).toEqual(user)
    expect(useUserStore.getState().isAuthenticated).toBe(true)
  })

  it('should logout correctly', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com', role: 'admin' as const }
    useUserStore.getState().login(user)
    useUserStore.getState().logout()
    expect(useUserStore.getState().user).toBeNull()
    expect(useUserStore.getState().isAuthenticated).toBe(false)
  })
})

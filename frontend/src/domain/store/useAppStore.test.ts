import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ isSidebarOpen: true })
  })

  it('should have initial state', () => {
    expect(useAppStore.getState().isSidebarOpen).toBe(true)
  })

  it('should toggle sidebar', () => {
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().isSidebarOpen).toBe(false)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().isSidebarOpen).toBe(true)
  })
})

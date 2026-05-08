import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer } from './use-toast'

describe('use-toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: 'Test Toast' })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Test Toast')
  })

  it('limits toasts to TOAST_LIMIT (1)', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: 'Toast 1' })
      toast({ title: 'Toast 2' })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Toast 2')
  })

  it('updates a toast', () => {
    const { result } = renderHook(() => useToast())
    let t: any

    act(() => {
      t = toast({ title: 'Initial' })
    })

    act(() => {
      t.update({ id: t.id, title: 'Updated' })
    })

    expect(result.current.toasts[0].title).toBe('Updated')
  })

  it('dismisses a toast', () => {
    const { result } = renderHook(() => useToast())
    let t: any

    act(() => {
      t = toast({ title: 'To Dismiss' })
    })

    expect(result.current.toasts[0].open).toBe(true)

    act(() => {
      t.dismiss()
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it('removes toast after delay when dismissed', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      const t = toast({ title: 'Auto Remove' })
      t.dismiss()
    })

    expect(result.current.toasts[0].open).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1000000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('dismisses all toasts when calling dismiss without ID', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: 'T1' })
    })

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.toasts[0].open).toBe(false)
  })
})

describe('toast reducer', () => {
  const initialState = { toasts: [] }

  it('handles ADD_TOAST', () => {
    const action = { type: 'ADD_TOAST', toast: { id: '1', title: 'Test' } } as any
    const state = reducer(initialState, action)
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0].id).toBe('1')
  })

  it('handles UPDATE_TOAST', () => {
    const stateWithToast = { toasts: [{ id: '1', title: 'Old' }] }
    const action = { type: 'UPDATE_TOAST', toast: { id: '1', title: 'New' } } as any
    const state = reducer(stateWithToast, action)
    expect(state.toasts[0].title).toBe('New')
  })

  it('handles DISMISS_TOAST for specific id', () => {
    const stateWithToast = { toasts: [{ id: '1', open: true }] }
    const action = { type: 'DISMISS_TOAST', toastId: '1' } as any
    const state = reducer(stateWithToast, action)
    expect(state.toasts[0].open).toBe(false)
  })

  it('handles REMOVE_TOAST for specific id', () => {
    const stateWithToast = { toasts: [{ id: '1' }] }
    const action = { type: 'REMOVE_TOAST', toastId: '1' } as any
    const state = reducer(stateWithToast, action)
    expect(state.toasts).toHaveLength(0)
  })

  it('handles REMOVE_TOAST without id (removes all)', () => {
    const stateWithToast = { toasts: [{ id: '1' }, { id: '2' }] }
    const action = { type: 'REMOVE_TOAST' } as any
    const state = reducer(stateWithToast, action)
    expect(state.toasts).toHaveLength(0)
  })
})

import { useEffect } from 'react'
export const useKeyboardNavigation = (
  activeTab: string,
  setActiveTab: (tab: string) => void,
  onNew: () => void,
  onSearch: () => void,
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  itemCount: number,
  onExecute: () => void,
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') {
          ;(document.activeElement as HTMLElement).blur()
        }
        return
      }
      if (e.key === '1') setActiveTab('tasks')
      if (e.key === '2') setActiveTab('crons')
      if (e.key === '3') setActiveTab('envs')
      if (e.key === '4') setActiveTab('wiki')
      if (e.key === '5') setActiveTab('s3')
      if (e.key === '6') setActiveTab('analytics')
      if (e.key === 'l' && e.ctrlKey) {
        const tabs = [
          'tasks',
          'crons',
          'envs',
          'wiki',
          's3',
          'analytics',
          'config',
          'backups',
          'webhooks',
        ]
        const idx = tabs.indexOf(activeTab)
        setActiveTab(tabs[(idx + 1) % tabs.length])
      }
      if (e.key === 'h' && e.ctrlKey) {
        const tabs = [
          'tasks',
          'crons',
          'envs',
          'wiki',
          's3',
          'analytics',
          'config',
          'backups',
          'webhooks',
        ]
        const idx = tabs.indexOf(activeTab)
        setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length])
      }
      if (e.key === 'j') {
        if (itemCount > 0) {
          setSelectedIndex(Math.min(selectedIndex + 1, itemCount - 1))
          e.preventDefault()
        } else {
          window.scrollBy(0, 100)
        }
      }
      if (e.key === 'k') {
        if (itemCount > 0) {
          setSelectedIndex(Math.max(selectedIndex - 1, 0))
          e.preventDefault()
        } else {
          window.scrollBy(0, -100)
        }
      }
      if (e.key === 'Enter' && itemCount > 0) {
        onExecute()
      }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onNew()
      }
      if (e.key === '/') {
        e.preventDefault()
        onSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeTab,
    setActiveTab,
    onNew,
    onSearch,
    selectedIndex,
    setSelectedIndex,
    itemCount,
    onExecute,
  ])
}

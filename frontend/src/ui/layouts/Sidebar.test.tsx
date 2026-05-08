import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './Sidebar'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  })
}))

describe('Sidebar Layout', () => {
  const mockSetActiveTab = vi.fn()
  const mockSetDarkMode = vi.fn()
  const mockSetPosition = vi.fn()

  it('renders navigation tabs correctly', () => {
    render(
      <Sidebar
        activeTab="tasks"
        setActiveTab={mockSetActiveTab}
        wsConnected={true}
        darkMode={false}
        setDarkMode={mockSetDarkMode}
        position="left"
        setPosition={mockSetPosition}
      />
    )
    
    expect(screen.getAllByText('sidebar.app_name').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.task_manager').length).toBeGreaterThan(0)
    expect(screen.getByText('Cron Jobs')).toBeDefined()
  })

  it('calls setActiveTab when a tab is clicked', () => {
    render(
      <Sidebar
        activeTab="tasks"
        setActiveTab={mockSetActiveTab}
        wsConnected={true}
        darkMode={false}
        setDarkMode={mockSetDarkMode}
        position="left"
        setPosition={mockSetPosition}
      />
    )
    
    fireEvent.click(screen.getByText('Cron Jobs'))
    expect(mockSetActiveTab).toHaveBeenCalledWith('crons')
  })

  it('toggles dark mode', () => {
    render(
      <Sidebar
        activeTab="tasks"
        setActiveTab={mockSetActiveTab}
        wsConnected={true}
        darkMode={false}
        setDarkMode={mockSetDarkMode}
        position="left"
        setPosition={mockSetPosition}
      />
    )
    
    fireEvent.click(screen.getByText('[OFF]'))
    expect(mockSetDarkMode).toHaveBeenCalledWith(true)
  })
})

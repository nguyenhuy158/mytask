import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Layout,
  Calendar,
  FileText,
  Globe,
  Book,
  Folder,
  BarChart2,
  Settings,
  Archive,
  Webhook,
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  wsConnected: boolean
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
  position: 'left' | 'right' | 'top' | 'bottom'
  setPosition: (pos: 'left' | 'right' | 'top' | 'bottom') => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  wsConnected,
  darkMode,
  setDarkMode,
  position,
  setPosition,
}) => {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(nextLang)
  }

  const tabs = [
    { id: 'tasks', label: t('sidebar.task_manager'), icon: Layout },
    { id: 'crons', label: 'Cron Jobs', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'envs', label: 'Environments', icon: Globe },
    { id: 'wiki', label: 'Wiki', icon: Book },
    { id: 's3', label: 'S3 Explorer', icon: Folder },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'backups', label: 'Backups', icon: Archive },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ]

  const isVertical = position === 'left' || position === 'right'

  const asideClasses = {
    left: 'w-64 border-r flex-col',
    right: 'w-64 border-l flex-col',
    top: 'w-full h-auto border-b flex-row items-center justify-between',
    bottom: 'w-full h-auto border-t flex-row items-center justify-between',
  }[position]

  return (
    <aside className={`${asideClasses} border-hairline bg-canvas z-20`}>
      <div className={`${isVertical ? 'p-6 border-b' : 'px-8 py-4 border-r'} border-hairline`}>
        <div className="text-xl font-bold tracking-tight">{t('sidebar.app_name')}</div>
        {isVertical && (
          <div className="text-[10px] mt-1 text-mute uppercase tracking-widest">
            {t('sidebar.task_manager')}
          </div>
        )}
      </div>

      <nav
        className={`flex-1 ${isVertical ? 'px-4 py-6 space-y-2' : 'px-6 flex flex-row gap-4 overflow-x-auto scrollbar-hide'}`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                isVertical ? 'w-full' : 'whitespace-nowrap'
              } flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary'
                  : 'hover:bg-surface-soft text-mute'
              }`}
            >
              <Icon size={16} className={activeTab === tab.id ? 'text-canvas' : 'text-ash'} />
              <span className="text-sm">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <div
        className={`${isVertical ? 'p-6 border-t' : 'px-8 py-4 border-l'} border-hairline text-xs flex ${isVertical ? 'flex-col' : 'flex-row items-center gap-8'}`}
      >
        {isVertical && (
          <div className="text-[10px] font-bold text-mute uppercase tracking-widest mb-2">
            {t('sidebar.status')}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              wsConnected ? 'bg-success animate-pulse' : 'bg-danger'
            }`}
          ></div>
          <span className="font-bold">
            {wsConnected ? t('sidebar.live_sync_active') : t('sidebar.offline')}
          </span>
        </div>

        <div className={`flex ${isVertical ? 'mt-4 flex-col gap-4' : 'flex-row gap-6'}`}>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ash font-bold uppercase tracking-widest text-[9px]">Pos</span>
            <div className="flex gap-2">
              {(['left', 'right', 'top', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => {
                    setPosition(pos)
                    localStorage.setItem('sidebarPosition', pos)
                  }}
                  className={`${
                    position === pos ? 'text-ink font-bold' : 'text-ash hover:text-ink'
                  } transition-colors uppercase text-[10px]`}
                >
                  {position === pos ? `[${pos[0]}]` : pos[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ash font-bold uppercase tracking-widest text-[9px]">Lang</span>
            <button
              onClick={toggleLanguage}
              className="text-mute hover:text-ink transition-colors font-bold uppercase"
            >
              [{i18n.language}]
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ash font-bold uppercase tracking-widest text-[9px]">Night</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-mute hover:text-ink transition-colors font-bold"
            >
              {darkMode ? '[ON]' : '[OFF]'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

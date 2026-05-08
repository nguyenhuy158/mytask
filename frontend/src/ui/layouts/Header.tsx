import React from 'react'
import { Plus, RefreshCcw } from 'lucide-react'
import { Button } from '../components/Button'

interface HeaderProps {
  activeTab: string
  searchTerm: string
  setSearchTerm: (term: string) => void
  onRefresh: () => void
  onNew: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  onRefresh,
  onNew,
}) => {
  return (
    <header className="h-14 border-b border-hairline flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-0 py-1 bg-transparent border-b border-hairline focus:border-ink transition-all outline-none text-sm placeholder:text-ash"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <Button
          variant="link"
          size="xs"
          onClick={onRefresh}
          icon={<RefreshCcw size={12} />}
          className="hidden sm:flex"
        >
          [REFRESH]
        </Button>
        <Button
          variant="link"
          size="xs"
          onClick={onRefresh}
          icon={<RefreshCcw size={12} />}
          className="sm:hidden"
        />
        {activeTab !== 'config' && (
          <Button variant="primary" size="sm" onClick={onNew} icon={<Plus size={14} />}>
            <span className="hidden sm:inline">NEW_</span>
            {activeTab === 'envs'
              ? 'ENV'
              : activeTab === 'webhooks'
                ? 'WEBHOOK'
                : activeTab === 'backups'
                  ? 'BACKUP'
                  : activeTab === 's3'
                    ? 'BUCKET'
                    : activeTab === 'wiki'
                      ? 'PAGE'
                      : 'TASK'}
          </Button>
        )}
      </div>
    </header>
  )
}

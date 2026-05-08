import React from 'react'

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
    <header className="h-14 border-b border-hairline flex items-center justify-between px-8 z-10">
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

      <div className="flex items-center gap-6">
        <button
          onClick={onRefresh}
          className="text-mute hover:text-ink transition-colors text-xs font-bold"
        >
          [REFRESH]
        </button>
        {activeTab !== 'config' && (
          <button
            onClick={onNew}
            className="bg-primary text-on-primary px-4 py-1.5 rounded-sm text-xs font-bold transition-all border border-ink hover:opacity-90"
          >
            [+] NEW_
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
          </button>
        )}
      </div>
    </header>
  )
}

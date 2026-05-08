import React, { useState, useEffect } from 'react'
type TabType =
  | 'tasks'
  | 'envs'
  | 'crons'
  | 'config'
  | 'backups'
  | 'webhooks'
  | 'wiki'
  | 's3'
  | 'analytics'
interface CommandPaletteProps {
  onNavigate: (tab: TabType) => void
  onAction: (action: string) => void
}
export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate, onAction }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const commands = [
    { id: 'tasks', label: 'Go to Dashboard', type: 'nav' },
    { id: 'crons', label: 'Go to Cron Jobs', type: 'nav' },
    { id: 'envs', label: 'Go to Environments', type: 'nav' },
    { id: 'wiki', label: 'Go to Wiki', type: 'nav' },
    { id: 's3', label: 'Go to S3 Explorer', type: 'nav' },
    { id: 'analytics', label: 'Go to Analytics', type: 'nav' },
    { id: 'shell', label: 'Odoo Remote Shell', type: 'nav' },
    { id: 'new-task', label: 'Create New Task', type: 'action' },
    { id: 'rank', label: 'AI Rank Tasks', type: 'action' },
    { id: 'zen', label: 'Enter Zen Mode', type: 'action' },
  ]
  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (!isOpen) return
      if (e.key === 'Escape') setIsOpen(false)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filtered.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filtered[selectedIndex]
        if (selected) {
          if (selected.type === 'nav') onNavigate(selected.id as TabType)
          else onAction(selected.id)
          setIsOpen(false)
          setQuery('')
          setSelectedIndex(0)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, onNavigate, onAction])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[300] bg-canvas/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-xl bg-canvas border border-ink shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center px-6 py-4 border-b border-ink">
          <span className="text-ink font-bold mr-4 opacity-30 tracking-tighter">CMD_</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search commands..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-mono"
          />
          <span className="text-[10px] font-bold opacity-30">[ESC to Close]</span>
        </div>
        <div className="max-h-[400px] overflow-auto py-2">
          {filtered.map((cmd, idx) => (
            <div
              key={cmd.id}
              onClick={() => {
                if (cmd.type === 'nav') onNavigate(cmd.id as TabType)
                else onAction(cmd.id)
                setIsOpen(false)
                setQuery('')
                setSelectedIndex(0)
              }}
              className={`px-6 py-3 cursor-pointer flex justify-between items-center group transition-colors ${
                idx === selectedIndex ? 'bg-ink text-on-primary' : 'hover:bg-surface-soft'
              }`}
            >
              <span className="text-xs font-bold uppercase">
                {idx === selectedIndex && <span className="mr-2">»</span>}
                {cmd.label}
              </span>
              <span
                className={`text-[10px] font-bold tracking-widest ${
                  idx === selectedIndex ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'
                }`}
              >
                {cmd.type === 'nav' ? 'NAVIGATION' : 'EXECUTE'}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-xs italic text-mute">No commands found</div>
          )}
        </div>
      </div>
    </div>
  )
}

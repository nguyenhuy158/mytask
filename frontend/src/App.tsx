import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Download, Upload } from 'lucide-react'
import { Sidebar } from './ui/layouts/Sidebar'
import { Header } from './ui/layouts/Header'
import { Dashboard } from './ui/features/Dashboard'
import { CronTable } from './ui/features/CronTable'
import { DisbursementReport } from './ui/features/DisbursementReport'
import { AuditLogTable } from './ui/features/AuditLogTable'
import { HistoryTable } from './ui/features/HistoryTable'
import { EnvCard } from './ui/features/EnvCard'
import type { OdooEnv } from './domain/models/OdooEnv'
import { WebhookCard } from './ui/features/WebhookCard'
import { Select } from './ui/components/Select'
import { PomodoroTimer } from './ui/features/PomodoroTimer'
import { FocusMode } from './ui/features/FocusMode'
import { Wiki } from './ui/features/Wiki'
import { S3Explorer } from './ui/features/S3Explorer'
import { AsciiDashboard } from './ui/features/AsciiDashboard'
import { OdooShell } from './ui/features/OdooShell'
import { LogStream } from './ui/features/LogStream'
import { CommandPalette } from './ui/components/CommandPalette'
import { Draggable } from './ui/components/Draggable'
import { CronBuilder } from './ui/components/CronBuilder'
import { AddS3Modal } from './ui/features/AddS3Modal'
import { AddWebhookModal } from './ui/features/AddWebhookModal'
import { AddEnvModal } from './ui/features/AddEnvModal'
import { EditEnvModal } from './ui/features/EditEnvModal'
import { AddTaskModal } from './ui/features/AddTaskModal'
import { useTasks } from './ui/hooks/useTasks'
import { useOdoo } from './ui/hooks/useOdoo'
import { useSystem } from './ui/hooks/useSystem'
import { useKeyboardNavigation } from './ui/hooks/useKeyboardNavigation'
import { wsAdapter } from './adapters/websocket/NativeWsAdapter'
import type { TaskHistory } from './domain/models/System'

type TabName =
  | 'tasks'
  | 'envs'
  | 'crons'
  | 'config'
  | 'backups'
  | 'webhooks'
  | 'wiki'
  | 's3'
  | 'analytics'
  | 'reports'

type SidebarPosition = 'left' | 'right' | 'top' | 'bottom'

function App() {
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    const saved = localStorage.getItem('activeTab')
    const validTabs: TabName[] = [
      'tasks',
      'envs',
      'crons',
      'config',
      'backups',
      'webhooks',
      'wiki',
      's3',
      'analytics',
      'reports',
    ]
    return saved && validTabs.includes(saved as TabName) ? (saved as TabName) : 'tasks'
  })
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>(() => {
    const saved = localStorage.getItem('sidebarPosition') as SidebarPosition
    return ['left', 'right', 'top', 'bottom'].includes(saved) ? saved : 'left'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list')
  const [wsConnected, setWsConnected] = useState(false)
  const [results, setResults] = useState<Record<number, { text: string; time: string }>>({})
  const [history, setHistory] = useState<TaskHistory[]>([])
  const [testingEnvId, setTestingEnvId] = useState<number | null>(null)
  const [testingWebhookId, setTestingWebhookId] = useState<number | null>(null)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(() => {
    const saved = localStorage.getItem('showPomodoro')
    return saved === 'true'
  })
  const [showLogStream, setShowLogStream] = useState(() => {
    const saved = localStorage.getItem('showLogStream')
    return saved === 'true' // Default to false
  })
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddWebhookModal, setShowAddWebhookModal] = useState(false)
  const [showAddEnvModal, setShowAddEnvModal] = useState(false)
  const [showAddS3Modal, setShowAddS3Modal] = useState(false)
  const [showCronBuilder, setShowCronBuilder] = useState(false)
  const [editingEnv, setEditingEnv] = useState<OdooEnv | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleSetActiveTab = (
    tab:
      | 'tasks'
      | 'envs'
      | 'crons'
      | 'config'
      | 'backups'
      | 'webhooks'
      | 'wiki'
      | 's3'
      | 'analytics'
      | 'reports',
  ) => {
    setActiveTab(tab)
    setSelectedIndex(0)
  }

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term)
    setSelectedIndex(0)
  }

  const {
    setTasks,
    filteredTasks,
    updateTaskStatus,
    deleteTask,
    runTask: runTaskApi,
    fetchTasks,
    fetchRankedTasks,
    addTask,
  } = useTasks(searchTerm)

  const runTask = async (id: number) => {
    try {
      const result = await runTaskApi(id)
      setResults((prev) => ({
        ...prev,
        [id]: { text: result, time: new Date().toLocaleTimeString() },
      }))
    } catch {
      // toast handled in hook
    }
  }

  const {
    envs,
    report: odooReportData,
    selectedEnvId,
    setSelectedEnvId,
    loading: odooLoading,
    fetchEnvs,
    addEnv,
    updateEnv,
    deleteEnv,
    duplicateEnv,
    setDefaultEnv,
    testEnv,
    exportEnvs,
    importEnvs,
    toggleCron,
    runCron,
    sortConfig,
    requestSort,
    filteredCrons,
  } = useOdoo(searchTerm)

  const handleImportEnvs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        await importEnvs(data)
      } catch {
        toast.error('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const {
    webhooks,
    s3Configs,
    auditLogs,
    config,
    backups,
    backupCron,
    defaultBackupTarget,
    fetchAll,
    triggerBackup,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    updateBackupCron,
    updateDefaultBackupTarget,
    addWebhook,
    deleteWebhook,
    testWebhook: testWebhookApi,
    addS3Config,
  } = useSystem()

  useKeyboardNavigation(
    activeTab,
    handleSetActiveTab,
    () => setShowAddModal(true),
    () => {
      const input = document.querySelector('header input') as HTMLInputElement
      if (input) input.focus()
    },
    selectedIndex,
    setSelectedIndex,
    activeTab === 'tasks' ? filteredTasks.length : activeTab === 'crons' ? filteredCrons.length : 0,
    () => {
      if (activeTab === 'tasks' && filteredTasks[selectedIndex]) {
        runTask(filteredTasks[selectedIndex].id)
      } else if (activeTab === 'crons' && filteredCrons[selectedIndex]) {
        runCron(filteredCrons[selectedIndex].id)
      }
    },
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab)
    if ((activeTab === 'crons' || activeTab === 'reports') && !selectedEnvId && envs.length > 0) {
      setSelectedEnvId(envs[0].id)
    }
  }, [activeTab, selectedEnvId, envs, setSelectedEnvId])

  useEffect(() => {
    localStorage.setItem('sidebarPosition', sidebarPosition)
  }, [sidebarPosition])

  useEffect(() => {
    localStorage.setItem('showPomodoro', String(showPomodoro))
  }, [showPomodoro])

  useEffect(() => {
    localStorage.setItem('showLogStream', String(showLogStream))
  }, [showLogStream])

  useEffect(() => {
    wsAdapter.connect(
      (data) => {
        if (data.type === 'TASK_COMPLETED') {
          setResults((prev) => ({
            ...prev,
            [data.task_id!]: {
              text: data.result!,
              time: new Date().toLocaleTimeString(),
            },
          }))
          if (data.history) {
            setHistory((prev) => [data.history!, ...prev].slice(0, 50))
            toast.success(`Task "${data.history.task_name}" completed!`)
          }
        } else if (data.type === 'TASK_CREATED') {
          setTasks((prev) =>
            prev.find((t) => t.id === data.task!.id) ? prev : [...prev, data.task!],
          )
        } else if (data.type === 'TASK_DELETED') {
          setTasks((prev) => prev.filter((t) => t.id !== data.task_id))
        } else if (data.type === 'TASK_STATUS_UPDATED') {
          setTasks((prev) =>
            prev.map((t) => (t.id === data.task_id ? { ...t, status: data.status! } : t)),
          )
        }
      },
      (connected) => {
        setWsConnected(connected)
      },
    )
    return () => wsAdapter.disconnect()
  }, [setTasks])

  const handleRefresh = () => {
    fetchTasks()
    if (selectedEnvId) fetchEnvs()
    fetchAll()
    toast.success('Refreshed')
  }

  const handleTestEnv = async (id: number) => {
    setTestingEnvId(id)
    try {
      await testEnv(id)
    } finally {
      setTestingEnvId(null)
    }
  }

  const handleSetDefaultEnv = async (id: number) => {
    await setDefaultEnv(id)
  }

  const handleDeleteEnv = async (id: number) => {
    await deleteEnv(id)
  }

  const testWebhook = async (id: number) => {
    setTestingWebhookId(id)
    try {
      await testWebhookApi(id)
    } finally {
      setTestingWebhookId(null)
    }
  }

  const containerClasses = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    top: 'flex-col',
    bottom: 'flex-col-reverse',
  }[sidebarPosition]

  const selectedEnv = envs.find((e) => e.id === selectedEnvId)

  return (
    <div
      className={`flex h-screen bg-canvas overflow-hidden font-mono text-ink ${containerClasses}`}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        wsConnected={wsConnected}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        position={sidebarPosition}
        setPosition={setSidebarPosition}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={handleSetSearchTerm}
          onRefresh={handleRefresh}
          onNew={() => {
            if (activeTab === 'webhooks') setShowAddWebhookModal(true)
            else if (activeTab === 'envs') setShowAddEnvModal(true)
            else if (activeTab === 's3') setShowAddS3Modal(true)
            else if (activeTab === 'backups') triggerBackup()
            else setShowAddModal(true)
          }}
        />

        <div className="flex-1 overflow-y-auto p-2 md:p-12">
          {activeTab === 'tasks' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="border-b border-ink pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase">
                    Dashboard
                  </h1>
                  <p className="text-mute text-[10px] md:text-xs mt-1 md:mt-2 italic">
                    Executing automated tasks...
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={fetchRankedTasks}
                    className="text-[10px] font-bold px-3 py-1 border border-ink hover:bg-ink hover:text-on-primary transition-colors"
                  >
                    [AI_RANK]
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`text-[10px] font-bold px-3 py-1 border ${viewMode === 'list' ? 'bg-ink text-on-primary border-ink' : 'border-hairline hover:border-ink'}`}
                  >
                    [LIST]
                  </button>
                  <button
                    onClick={() => setViewMode('board')}
                    className={`text-[10px] font-bold px-3 py-1 border ${viewMode === 'board' ? 'bg-ink text-on-primary border-ink' : 'border-hairline hover:border-ink'}`}
                  >
                    [BOARD]
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`text-[10px] font-bold px-3 py-1 border ${viewMode === 'calendar' ? 'bg-ink text-on-primary border-ink' : 'border-hairline hover:border-ink'}`}
                  >
                    [CALENDAR]
                  </button>
                </div>
              </div>

              <Dashboard
                tasks={filteredTasks}
                viewMode={viewMode}
                results={results}
                onDelete={deleteTask}
                onRun={runTask}
                onUpdateStatus={updateTaskStatus}
                selectedIndex={selectedIndex}
              />

              <AuditLogTable logs={auditLogs} onRefresh={fetchAll} />
              <HistoryTable history={history} />
            </div>
          )}

          {activeTab === 'crons' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-ink pb-4 gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold uppercase">Scheduled Jobs</h1>
                  <p className="text-mute text-[10px] md:text-xs mt-1 md:mt-2 italic">
                    Odoo XML-RPC Automation
                  </p>
                </div>
                <Select
                  value={selectedEnvId || ''}
                  options={envs.map((env) => ({ value: env.id, label: env.name }))}
                  onChange={(val) => setSelectedEnvId(Number(val))}
                  placeholder="Select Environment"
                  className="w-full md:w-48"
                />
              </div>

              <CronTable
                crons={filteredCrons}
                loading={!!odooLoading}
                sortConfig={sortConfig}
                onRequestSort={requestSort}
                onToggle={toggleCron}
                onRun={runCron}
                selectedIndex={selectedIndex}
              />

              {selectedEnvId && (
                <div className="mt-12 space-y-12">
                  <div>
                    <h2 className="text-xl font-bold uppercase mb-4">Remote Shell</h2>
                    <OdooShell envId={selectedEnvId} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-ink pb-4">
                <div>
                  <h1 className="text-2xl font-bold uppercase">Reports</h1>
                  <p className="text-mute text-xs mt-2 italic">Odoo Data Analysis</p>
                </div>
                <Select
                  value={selectedEnvId || ''}
                  options={envs.map((env) => ({ value: env.id, label: env.name }))}
                  onChange={(val) => setSelectedEnvId(Number(val))}
                  placeholder="Select Environment"
                  className="w-48"
                />
              </div>

              {selectedEnvId ? (
                <DisbursementReport
                  report={odooReportData}
                  loading={!!odooLoading}
                  envUrl={selectedEnv?.url}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-hairline">
                  <p className="text-ash font-bold uppercase tracking-widest text-sm">
                    PLEASE_SELECT_AN_ENVIRONMENT
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'envs' && (
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-ink pb-4">
                <h1 className="text-2xl font-bold uppercase">Environments</h1>
                <div className="flex gap-4">
                  <button
                    onClick={exportEnvs}
                    className="text-[10px] font-bold px-3 py-1 border border-ink hover:bg-ink hover:text-on-primary transition-colors flex items-center gap-2"
                  >
                    <Download size={10} />
                    [EXPORT]
                  </button>
                  <label className="text-[10px] font-bold px-3 py-1 border border-ink hover:bg-ink hover:text-on-primary transition-colors cursor-pointer flex items-center gap-2">
                    <Upload size={10} />
                    [IMPORT]
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportEnvs}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {envs.map((env) => (
                  <EnvCard
                    key={env.id}
                    env={env}
                    testingEnvId={testingEnvId}
                    onTest={handleTestEnv}
                    onUpdate={updateEnv}
                    onEdit={setEditingEnv}
                    onDelete={handleDeleteEnv}
                    onDuplicate={duplicateEnv}
                    onSetDefault={handleSetDefaultEnv}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold uppercase border-b border-ink pb-4">Webhooks</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {webhooks.map((webhook) => (
                  <WebhookCard
                    key={webhook.id}
                    webhook={webhook}
                    testingWebhookId={testingWebhookId}
                    onTest={testWebhook}
                    onDelete={() => deleteWebhook(webhook.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'config' && config && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold uppercase border-b border-ink pb-4">
                System Config
              </h1>
              <div className="max-w-2xl space-y-12">
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-mute uppercase tracking-widest">Layout</h2>
                  <div className="flex gap-2">
                    {(['left', 'right', 'top', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setSidebarPosition(pos)}
                        className={`text-[10px] font-bold px-2 md:px-3 py-1 border ${
                          sidebarPosition === pos
                            ? 'bg-ink text-on-primary border-ink'
                            : 'border-hairline hover:border-ink'
                        }`}
                      >
                        <span className="hidden md:inline">[{pos.toUpperCase()}]</span>
                        <span className="md:hidden">[{pos[0].toUpperCase()}]</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-mute uppercase tracking-widest">Widgets</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPomodoro(!showPomodoro)}
                      className={`text-[10px] font-bold px-3 py-1 border ${
                        showPomodoro
                          ? 'bg-ink text-on-primary border-ink'
                          : 'border-hairline hover:border-ink'
                      }`}
                    >
                      [POMODORO_TIMER: {showPomodoro ? 'ON' : 'OFF'}]
                    </button>
                    <button
                      onClick={() => setShowLogStream(!showLogStream)}
                      className={`text-[10px] font-bold px-3 py-1 border ${
                        showLogStream
                          ? 'bg-ink text-on-primary border-ink'
                          : 'border-hairline hover:border-ink'
                      }`}
                    >
                      [SYSTEM_LOG: {showLogStream ? 'ON' : 'OFF'}]
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-mute uppercase tracking-widest">
                    Backup Policy
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={backupCron}
                        onChange={(e) => updateBackupCron(e.target.value)}
                        className="flex-1 bg-surface-soft border border-hairline px-4 py-2 text-xs font-bold outline-none focus:border-ink"
                        placeholder="Cron Expression"
                      />
                      <button
                        onClick={() => setShowCronBuilder(true)}
                        className="px-3 py-2 text-[10px] font-bold border border-hairline hover:bg-ink hover:text-on-primary transition-colors uppercase"
                      >
                        [BUILD]
                      </button>
                    </div>
                    <Select
                      value={defaultBackupTarget}
                      options={[
                        { value: 'local', label: 'LOCAL_DB' },
                        ...s3Configs.map((c) => ({
                          value: `s3:${c.id}`,
                          label: `S3: ${c.name.toUpperCase()}`,
                        })),
                      ]}
                      onChange={updateDefaultBackupTarget}
                      className="w-48"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-mute uppercase tracking-widest">
                    External API Keys
                  </h2>
                  <div className="bg-surface-soft p-6 border border-hairline space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold">SYSTEM_UUID</span>
                      <span className="text-ash tabular-nums">{config.system_uuid}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-ink pb-4">
                <h1 className="text-2xl font-bold uppercase">Backups</h1>
                <button
                  onClick={triggerBackup}
                  className="text-[10px] font-bold px-3 py-1 border border-ink hover:bg-ink hover:text-on-primary transition-colors"
                >
                  [BACKUP_NOW]
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {backups.map((backup) => (
                  <div
                    key={backup.filename}
                    className="bg-surface-soft border border-hairline p-4 flex items-center justify-between group hover:border-ink transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tabular-nums">{backup.filename}</span>
                      <span className="text-[10px] text-ash uppercase font-bold mt-1">
                        {backup.size} • {backup.timestamp}
                      </span>
                    </div>
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => downloadBackup(backup.filename)}
                        className="text-[10px] font-bold hover:underline"
                      >
                        [DOWNLOAD]
                      </button>
                      <button
                        onClick={() => restoreBackup(backup.filename)}
                        className="text-[10px] font-bold text-accent hover:underline"
                      >
                        [RESTORE]
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.filename)}
                        className="text-[10px] font-bold text-danger hover:underline"
                      >
                        [DELETE]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wiki' && <Wiki />}

          {activeTab === 's3' && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold uppercase border-b border-ink pb-4">
                S3 File Explorer
              </h1>
              <S3Explorer />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold uppercase border-b border-ink pb-4">Analytics</h1>
              <AsciiDashboard tasks={filteredTasks} />
            </div>
          )}
        </div>
      </main>

      {showFocusMode && <FocusMode onClose={() => setShowFocusMode(false)} />}

      {showAddModal && (
        <AddTaskModal
          tasks={filteredTasks}
          envs={envs}
          onClose={() => setShowAddModal(false)}
          onAdd={async (task) => {
            await addTask(task)
            setShowAddModal(false)
          }}
        />
      )}

      {showAddWebhookModal && (
        <AddWebhookModal
          onClose={() => setShowAddWebhookModal(false)}
          onAdd={async (webhook) => {
            await addWebhook(webhook)
            setShowAddWebhookModal(false)
          }}
        />
      )}

      {showAddEnvModal && (
        <AddEnvModal
          onClose={() => setShowAddEnvModal(false)}
          onAdd={async (env) => {
            await addEnv(env)
            setShowAddEnvModal(false)
          }}
        />
      )}

      {editingEnv && (
        <EditEnvModal
          env={editingEnv}
          onClose={() => setEditingEnv(null)}
          onUpdate={async (id, data) => {
            await updateEnv(id, data)
            setEditingEnv(null)
          }}
        />
      )}

      {showAddS3Modal && (
        <AddS3Modal
          onClose={() => setShowAddS3Modal(false)}
          onAdd={async (config) => {
            await addS3Config(config)
            setShowAddS3Modal(false)
          }}
        />
      )}

      {showCronBuilder && (
        <CronBuilder
          value={backupCron}
          onChange={updateBackupCron}
          onClose={() => setShowCronBuilder(false)}
        />
      )}

      <CommandPalette
        onNavigate={(tab) => {
          if (tab === 'shell') {
            handleSetActiveTab('crons')
          } else {
            handleSetActiveTab(tab)
          }
        }}
        onAction={(action) => {
          if (action === 'new-task') setShowAddModal(true)
          if (action === 'rank') fetchRankedTasks()
          if (action === 'zen') setShowFocusMode(true)
        }}
      />

      <div className="fixed bottom-4 right-4 md:bottom-10 md:right-10 flex flex-col items-end gap-2 md:gap-4 z-[60] pointer-events-none">
        {showPomodoro && (
          <Draggable className="pointer-events-auto">
            <PomodoroTimer />
          </Draggable>
        )}
        {showLogStream && (
          <Draggable className="pointer-events-auto">
            <LogStream />
          </Draggable>
        )}
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}

export default App

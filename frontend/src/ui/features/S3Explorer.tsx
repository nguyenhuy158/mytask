import React, { useState, useEffect } from 'react'
import { AddS3Modal, type S3Config } from './AddS3Modal'
import toast from 'react-hot-toast'
import { Skeleton } from '../components/Skeleton'

export const S3Explorer = () => {
  const [configs, setConfigs] = useState<S3Config[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null)
  const [files, setFiles] = useState<{ Key: string; Size: number; LastModified: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchConfigs = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/s3-configs`)
      .then((res) => res.json())
      .then(setConfigs)
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  useEffect(() => {
    if (selectedConfigId) {
      const fetchFiles = async () => {
        setLoading(true)
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/s3/${selectedConfigId}/backups`,
          )
          const data = await res.json()
          setFiles(data)
        } catch {
          setFiles([])
        } finally {
          setLoading(false)
        }
      }
      fetchFiles()
    }
  }, [selectedConfigId])

  const handleAddS3 = async (config: S3Config) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/s3-configs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      },
    )
    if (!res.ok) throw new Error('Failed to create S3 config')
    fetchConfigs()
  }

  const deleteConfig = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this S3 configuration?')) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/s3-configs/${id}`, {
        method: 'DELETE',
      })
      toast.success('Deleted')
      if (selectedConfigId === id) setSelectedConfigId(null)
      fetchConfigs()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row h-[800px] sm:h-[600px] border border-ink bg-canvas font-mono overflow-hidden">
      {showAddModal && <AddS3Modal onClose={() => setShowAddModal(false)} onAdd={handleAddS3} />}

      {/* Ranger Column 1: Buckets/Configs */}
      <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-ink flex flex-col h-1/2 sm:h-auto">
        <div className="bg-ink text-on-primary px-4 py-2 text-[10px] font-bold uppercase flex justify-between items-center">
          <span>Buckets</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-[9px] border border-white/20 px-1 hover:bg-white hover:text-ink transition-colors"
          >
            [ADD]
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {configs.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedConfigId(c.id)}
              className={`p-4 cursor-pointer text-xs font-bold uppercase transition-colors flex justify-between items-center group ${selectedConfigId === c.id ? 'bg-ink text-on-primary' : 'hover:bg-surface-soft'}`}
            >
              <span>{c.name}</span>
              <button
                onClick={(e) => deleteConfig(c.id, e)}
                className={`opacity-0 group-hover:opacity-100 text-[9px] px-1 hover:underline ${selectedConfigId === c.id ? 'text-on-primary' : 'text-mute'}`}
              >
                [X]
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ranger Column 2: Files */}
      <div className="flex-1 flex flex-col relative">
        <div className="bg-ink text-on-primary px-4 py-2 text-[10px] font-bold uppercase flex justify-between">
          <span>Files</span>
          {loading && (
            <span className="text-accent text-[9px] font-bold tracking-widest animate-pulse">
              CONNECTING...
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto divide-y divide-hairline">
          {loading && (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          )}
          {files.length === 0 && !loading && (
            <div className="p-8 text-center text-mute text-xs italic">
              Select a bucket to view files
            </div>
          )}
          {!loading &&
            files.map((f) => (
              <div
                key={f.Key}
                className="p-4 flex items-center justify-between group hover:bg-surface-soft transition-colors cursor-default"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{f.Key}</span>
                  <span className="text-[10px] text-mute">
                    {(f.Size / 1024).toFixed(2)} KB | {new Date(f.LastModified).toLocaleString()}
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-[10px] font-bold border border-ink px-2 py-1 hover:bg-ink hover:text-canvas">
                  [RESTORE]
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

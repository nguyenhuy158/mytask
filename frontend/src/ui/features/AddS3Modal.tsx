import React, { useState } from 'react'
import toast from 'react-hot-toast'

export interface S3Config {
  id?: number
  name: string
  endpoint: string
  region: string
  bucket: string
  access_key: string
  secret_key: string
}

interface AddS3ModalProps {
  onClose: () => void
  onAdd: (config: S3Config) => Promise<void>
}

export const AddS3Modal = ({ onClose, onAdd }: AddS3ModalProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<S3Config>({
    name: '',
    endpoint: '',
    region: 'us-east-1',
    bucket: '',
    access_key: '',
    secret_key: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onAdd(formData)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add S3 configuration'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/s3-configs/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      )
      const data = await res.json()
      if (data.status === 'success') {
        toast.success('Connection successful!')
      } else {
        toast.error(`Connection failed: ${data.message}`)
      }
    } catch {
      toast.error('Failed to test connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md border border-ink bg-canvas p-8 font-mono shadow-2xl">
        <div className="mb-8 border-b border-ink pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Add S3 Storage</h2>
            <p className="text-xs text-mute mt-1">Connect your S3-compatible provider</p>
          </div>
          <button onClick={onClose} className="text-xs font-bold hover:underline opacity-50">
            [ESC]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-50">
                Display Name
              </label>
              <input
                autoFocus
                required
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="AWS Production / Cloudflare R2"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-50">
                Endpoint URL
              </label>
              <input
                required
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://s3.amazonaws.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-50">
                  Bucket Name
                </label>
                <input
                  required
                  className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                  value={formData.bucket}
                  onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-50">
                  Region
                </label>
                <input
                  required
                  className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-50">
                Access Key
              </label>
              <input
                required
                type="password"
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.access_key}
                onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-50">
                Secret Key
              </label>
              <input
                required
                type="password"
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.secret_key}
                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={testConnection}
              disabled={loading}
              className="flex-1 bg-canvas border border-ink text-ink font-bold py-3 text-xs uppercase hover:bg-ink hover:text-on-primary transition-all disabled:opacity-50"
            >
              Test_Connection
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-ink text-on-primary font-bold py-3 text-xs uppercase hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add_Config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

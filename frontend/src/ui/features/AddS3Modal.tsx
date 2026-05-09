import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog'
import { Label } from '@/ui/components/ui/label'
import { Button } from '@/ui/components/Button'

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-canvas border-ink p-8 shadow-2xl gap-8">
        <DialogHeader className="space-y-2 border-b border-ink pb-4">
          <DialogTitle className="text-xl font-bold uppercase tracking-tight">
            Add S3 Storage
          </DialogTitle>
          <DialogDescription className="text-xs text-mute italic">
            Connect your S3-compatible provider
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="s3-name"
                className="block text-[10px] font-bold uppercase mb-1.5 opacity-50"
              >
                Display Name
              </Label>
              <input
                id="s3-name"
                autoFocus
                required
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="AWS Production / Cloudflare R2"
              />
            </div>
            <div>
              <Label
                htmlFor="s3-endpoint"
                className="block text-[10px] font-bold uppercase mb-1.5 opacity-50"
              >
                Endpoint URL
              </Label>
              <input
                id="s3-endpoint"
                required
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://s3.amazonaws.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="s3-bucket"
                  className="block text-[10px] font-bold uppercase mb-1.5 opacity-50"
                >
                  Bucket Name
                </Label>
                <input
                  id="s3-bucket"
                  required
                  className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                  value={formData.bucket}
                  onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                />
              </div>
              <div>
                <Label
                  htmlFor="s3-region"
                  className="block text-[10px] font-bold uppercase mb-1.5 opacity-50"
                >
                  Region
                </Label>
                <input
                  id="s3-region"
                  required
                  className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="s3-access-key"
                className="block text-[10px] font-bold uppercase mb-1.5 opacity-50"
              >
                Access Key
              </Label>
              <input
                id="s3-access-key"
                required
                type="password"
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.access_key}
                onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
              />
            </div>
            <div>
              <Label
                htmlFor="s3-secret-key"
                className="block text-[10px] font-bold uppercase mb-1.5 opacity-50"
              >
                Secret Key
              </Label>
              <input
                id="s3-secret-key"
                required
                type="password"
                className="w-full bg-surface-soft border border-hairline px-4 py-2 text-xs outline-none focus:border-ink transition-all font-bold"
                value={formData.secret_key}
                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={loading}
              fullWidth
            >
              Test_Connection
            </Button>
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Adding...' : 'Add_Config'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

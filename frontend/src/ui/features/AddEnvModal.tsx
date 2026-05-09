import React, { useState } from 'react'
import type { OdooEnv } from '@/domain/models/OdooEnv'
import { Button } from '@/ui/components/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog'
import { Label } from '@/ui/components/ui/label'

interface AddEnvModalProps {
  onClose: () => void
  onAdd: (env: Partial<OdooEnv>) => void
}

export const AddEnvModal: React.FC<AddEnvModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<OdooEnv>>({
    name: '',
    url: '',
    db: '',
    username: '',
    password: '',
    color: '#000000',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-canvas border-ink p-12 shadow-2xl gap-10">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-3xl font-bold tracking-tighter uppercase">
            Initialize_Environment
          </DialogTitle>
          <DialogDescription className="text-xs italic text-mute">
            Define Odoo XML-RPC connection parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Environment_Name
            </Label>
            <input
              autoFocus
              required
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-lg font-bold"
              placeholder="E.g. STAGING_ERP"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">URL</Label>
            <input
              required
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
              placeholder="https://odoo.example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Database
              </Label>
              <input
                required
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                placeholder="odoo_db"
                value={formData.db}
                onChange={(e) => setFormData({ ...formData, db: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Username
              </Label>
              <input
                required
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                placeholder="admin"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Password / API_Key
            </Label>
            <input
              type="password"
              required
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
              placeholder="••••••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" fullWidth>
              [CREATE_ENVIRONMENT]
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              [CANCEL]
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

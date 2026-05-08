import React, { useState } from 'react'
import type { OdooEnv } from '../../domain/models/OdooEnv'
import { Button } from '../components/Button'
interface EditEnvModalProps {
  env: OdooEnv
  onClose: () => void
  onUpdate: (id: number, data: Partial<OdooEnv>) => void
}
export const EditEnvModal: React.FC<EditEnvModalProps> = ({ env, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<OdooEnv>>({
    name: env.name,
    url: env.url,
    db: env.db,
    username: env.username,
    password: env.password,
    color: env.color,
  })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(env.id, formData)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[400] bg-canvas/90 backdrop-blur-md flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-canvas border border-ink p-12 space-y-10 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Update_Environment</h2>
          <p className="text-xs italic text-mute">Modify Odoo XML-RPC connection parameters.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Environment_Name
            </label>
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
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              URL
            </label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Database
              </label>
              <input
                required
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                placeholder="odoo_db"
                value={formData.db}
                onChange={(e) => setFormData({ ...formData, db: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Username
              </label>
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
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Password / API_Key
            </label>
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
              [UPDATE_ENVIRONMENT]
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              [CANCEL]
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

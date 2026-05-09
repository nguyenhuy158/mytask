import React, { useState } from 'react'
import type { Webhook } from '@/domain/models/Webhook'
import { Button } from '@/ui/components/Button'
import { Select } from '@/ui/components/Select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog'
import { Label } from '@/ui/components/ui/label'

interface AddWebhookModalProps {
  onClose: () => void
  onAdd: (webhook: Partial<Webhook>) => void
}

export const AddWebhookModal: React.FC<AddWebhookModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<Webhook>>({
    name: '',
    type: 'webhook',
    url: '',
    secret: '',
    target: '',
    active: 1,
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
            Initialize_Webhook
          </DialogTitle>
          <DialogDescription className="text-xs italic text-mute">
            Configure a new outgoing notification endpoint.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Webhook_Name
            </Label>
            <input
              autoFocus
              required
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-lg font-bold"
              placeholder="E.g. DISCORD_ALERTS"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Type
            </Label>
            <Select
              value={formData.type || 'webhook'}
              options={[
                { value: 'webhook', label: 'Standard Webhook' },
                { value: 'telegram', label: 'Telegram Bot' },
                { value: 'slack', label: 'Slack Webhook' },
                { value: 'gmail', label: 'Gmail Service' },
                { value: 'resend', label: 'Resend API' },
              ]}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  type: val as 'webhook' | 'telegram' | 'slack' | 'gmail' | 'resend',
                })
              }
            />
          </div>

          {formData.type === 'telegram' ? (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Chat_ID
              </Label>
              <input
                required
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                placeholder="E.g. -100123456789"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                URL / Target
              </Label>
              <input
                required
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                placeholder="https://hooks.slack.com/..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Secret / API_Key
            </Label>
            <input
              type="password"
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
              placeholder="••••••••••••••••"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" fullWidth>
              [CREATE_WEBHOOK]
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

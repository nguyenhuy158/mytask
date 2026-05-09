import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Task } from '@/domain/models/Task'
import type { OdooEnv } from '@/domain/models/OdooEnv'
import { Button } from '@/ui/components/Button'
import { Select } from '@/ui/components/Select'
import { CronBuilder } from '@/ui/components/CronBuilder'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog'
import { Label } from '@/ui/components/ui/label'

interface AddTaskModalProps {
  onClose: () => void
  onAdd: (task: Partial<Task>) => void
  tasks: Task[]
  envs: OdooEnv[]
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAdd, tasks, envs }) => {
  const [showCronBuilder, setShowCronBuilder] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    task_type: 'generic',
    priority: 3,
    estimated_time: 60,
    deadline: '',
    dependencies: '',
    cron_expression: '',
    odoo_env_id: (envs.find((e) => e.is_default)?.id || null) as number | null,
    odoo_project_id: null as number | null,
    odoo_task_id: null as number | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-canvas border-ink p-12 shadow-2xl gap-10">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-3xl font-bold tracking-tighter uppercase">
            Initialize_Task
          </DialogTitle>
          <DialogDescription className="text-xs italic text-mute">
            Define the parameters of the new execution unit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Task_Identifier
            </Label>
            <input
              autoFocus
              required
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-lg font-bold"
              placeholder="E.g. REFACTOR_AUTH_LAYER"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Description
            </Label>
            <textarea
              required
              rows={3}
              className="w-full bg-surface-soft border border-hairline focus:border-ink outline-none p-4 text-xs font-mono"
              placeholder="What needs to be done?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Priority [1-5]
              </Label>
              <input
                type="number"
                min="1"
                max="5"
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Estimate [MIN]
              </Label>
              <input
                type="number"
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={formData.estimated_time}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_time: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Cron_Expression (Optional)
            </Label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold tabular-nums"
                placeholder="0 * * * *"
                value={formData.cron_expression}
                onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[10px] uppercase font-bold"
                onClick={() => setShowCronBuilder(true)}
              >
                [BUILD]
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Deadline
              </Label>
              <input
                type="datetime-local"
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Depends_On
              </Label>
              <Select
                value={formData.dependencies}
                options={[
                  { value: '', label: 'None' },
                  ...tasks.map((t) => ({ value: t.id.toString(), label: t.name })),
                ]}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    dependencies: val.toString(),
                  })
                }
              />
            </div>
          </div>

          <div className="pt-6 border-t border-hairline space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
              External_Integration: Odoo_Timesheets
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Odoo_Environment
                </Label>
                <Select
                  value={formData.odoo_env_id || ''}
                  options={[
                    { value: '', label: 'None' },
                    ...envs.map((env) => ({ value: env.id, label: env.name })),
                  ]}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      odoo_env_id: val ? Number(val) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Odoo_Project_ID
                </Label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                  placeholder="E.g. 42"
                  value={formData.odoo_project_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      odoo_project_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
            {formData.odoo_env_id && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Odoo_Task_ID (Optional)
                </Label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                  placeholder="E.g. 1234"
                  value={formData.odoo_task_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      odoo_task_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" fullWidth icon={<Plus size={16} />}>
              [CREATE_TASK]
            </Button>
            <Button type="button" variant="outline" onClick={onClose} icon={<X size={16} />}>
              [CANCEL]
            </Button>
          </div>
        </form>

        {showCronBuilder && (
          <CronBuilder
            value={formData.cron_expression}
            onChange={(val) => setFormData({ ...formData, cron_expression: val })}
            onClose={() => setShowCronBuilder(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

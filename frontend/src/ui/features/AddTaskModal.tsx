import React, { useState } from 'react'
import type { Task } from '../../domain/models/Task'
import type { OdooEnv } from '../../domain/models/OdooEnv'
import { Button } from '../components/Button'
import { Select } from '../components/Select'

interface AddTaskModalProps {
  onClose: () => void
  onAdd: (task: Partial<Task>) => void
  tasks: Task[]
  envs: OdooEnv[]
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAdd, tasks, envs }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    task_type: 'generic',
    priority: 3,
    estimated_time: 60,
    deadline: '',
    dependencies: '',
    odoo_env_id: null as number | null,
    odoo_project_id: null as number | null,
    odoo_task_id: null as number | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[400] bg-canvas/90 backdrop-blur-md flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-canvas border border-ink p-12 space-y-10 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Initialize_Task</h2>
          <p className="text-xs italic text-mute">
            Define the parameters of the new execution unit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Task_Identifier
            </label>
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
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Description
            </label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Priority [1-5]
              </label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Estimate [MIN]
              </label>
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

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Deadline
              </label>
              <input
                type="datetime-local"
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                Depends_On
              </label>
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
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Odoo_Environment
                </label>
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
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Odoo_Project_ID
                </label>
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
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Odoo_Task_ID (Optional)
                </label>
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
            <Button type="submit" fullWidth>
              [CREATE_TASK]
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

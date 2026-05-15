import React, { useState } from 'react'
import { Pencil, Plus, Save, Star, Trash2, Zap } from 'lucide-react'
import type {
  OAuthProvider,
  OAuthProviderUpdate,
  OAuthProviderPreset,
} from '@/domain/models/OAuthProvider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table'
import { Button } from '@/ui/components/Button'
import { Skeleton } from '@/ui/components/Skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog'
import { Label } from '@/ui/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select'

interface OAuthProviderTableProps {
  providers: OAuthProvider[]
  loading: boolean
  presets: OAuthProviderPreset[]
  defaultPresets: Record<number, string>
  updating: boolean
  onUpdate: (providerId: number, values: OAuthProviderUpdate) => void
  onApplyPreset: (providerId: number, presetId: string) => void
  onAddPreset: (label: string, values: OAuthProviderUpdate) => void
  onUpdatePreset: (
    presetId: string,
    label: string,
    values: OAuthProviderUpdate,
  ) => void
  onDeletePreset: (presetId: string) => void
  onSetDefaultPreset: (providerId: number, presetId: string) => void
}

const EDITABLE_FIELDS: (keyof OAuthProviderUpdate)[] = [
  'name',
  'client_id',
  'enabled',
  'body',
  'auth_endpoint',
  'validation_endpoint',
  'scope',
  'css_class',
  'sequence',
]

interface EditModalProps {
  provider: OAuthProvider
  presets: OAuthProviderPreset[]
  onClose: () => void
  onUpdate: (providerId: number, values: OAuthProviderUpdate) => void
  onSaveAsPreset: (label: string, values: OAuthProviderUpdate) => void
}

const EditProviderModal: React.FC<EditModalProps> = ({
  provider,
  onClose,
  onUpdate,
  onSaveAsPreset,
}) => {
  const [form, setForm] = useState<OAuthProviderUpdate>({
    name: provider.name,
    client_id: provider.client_id,
    enabled: provider.enabled,
    body: provider.body,
    auth_endpoint: provider.auth_endpoint,
    validation_endpoint: provider.validation_endpoint,
    scope: provider.scope,
    css_class: provider.css_class,
    sequence: provider.sequence,
  })
  const [presetLabel, setPresetLabel] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const dirty: OAuthProviderUpdate = {}
    EDITABLE_FIELDS.forEach((field) => {
      const next = form[field]
      const prev = provider[field as keyof OAuthProvider] as unknown
      if (next !== undefined && next !== prev) {
        ;(dirty as Record<string, unknown>)[field] = next
      }
    })
    if (Object.keys(dirty).length === 0) {
      onClose()
      return
    }
    onUpdate(provider.id, dirty)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-canvas border-ink p-10 shadow-2xl gap-8">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold tracking-tighter uppercase">
            Update_OAuth_Provider
          </DialogTitle>
          <DialogDescription className="text-xs italic text-mute">
            auth.oauth.provider · ID {provider.id}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Provider_Name
              </Label>
              <input
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Sequence
              </Label>
              <input
                type="number"
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={form.sequence ?? 0}
                onChange={(e) => setForm({ ...form, sequence: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Client_ID
            </Label>
            <input
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold break-all"
              value={form.client_id ?? ''}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Body
            </Label>
            <input
              className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
              value={form.body ?? ''}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Auth_Endpoint
              </Label>
              <input
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={form.auth_endpoint ?? ''}
                onChange={(e) => setForm({ ...form, auth_endpoint: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Validation_Endpoint
              </Label>
              <input
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={form.validation_endpoint ?? ''}
                onChange={(e) =>
                  setForm({ ...form, validation_endpoint: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Scope
              </Label>
              <input
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={form.scope ?? ''}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                CSS_Class
              </Label>
              <input
                className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-sm font-bold"
                value={form.css_class ?? ''}
                onChange={(e) => setForm({ ...form, css_class: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <input
              type="checkbox"
              checked={!!form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            Enabled (Allowed)
          </label>
          <div className="border-t border-hairline pt-4 space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Save_Current_As_Preset
            </Label>
            <div className="flex gap-2">
              <input
                placeholder="Preset label e.g. PROD_GOOGLE"
                className="flex-1 bg-transparent border-b border-hairline focus:border-ink outline-none py-2 text-xs font-bold"
                value={presetLabel}
                onChange={(e) => setPresetLabel(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!presetLabel.trim()) return
                  onSaveAsPreset(presetLabel, form)
                  setPresetLabel('')
                }}
                icon={<Save size={12} />}
              >
                Save_Preset
              </Button>
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <Button type="submit" fullWidth>
              [UPDATE_PROVIDER]
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

export const OAuthProviderTable: React.FC<OAuthProviderTableProps> = ({
  providers,
  loading,
  presets,
  defaultPresets,
  updating,
  onUpdate,
  onApplyPreset,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
  onSetDefaultPreset,
}) => {
  const [editing, setEditing] = useState<OAuthProvider | null>(null)
  const [selectedOverrides, setSelectedOverrides] = useState<
    Record<number, string>
  >({})
  const [showNewPreset, setShowNewPreset] = useState(false)
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null)
  const [newPresetLabel, setNewPresetLabel] = useState('')
  const [newPresetForm, setNewPresetForm] = useState<OAuthProviderUpdate>({})

  const resetNewPreset = () => {
    setNewPresetLabel('')
    setNewPresetForm({})
    setShowNewPreset(false)
    setEditingPresetId(null)
  }

  const startEditPreset = (preset: OAuthProviderPreset) => {
    setEditingPresetId(preset.id)
    setNewPresetLabel(preset.label)
    setNewPresetForm({ ...preset.values })
    setShowNewPreset(true)
  }

  const submitNewPreset = () => {
    if (!newPresetLabel.trim()) return
    if (editingPresetId) {
      onUpdatePreset(editingPresetId, newPresetLabel, newPresetForm)
    } else {
      onAddPreset(newPresetLabel, newPresetForm)
    }
    resetNewPreset()
  }

  const resolvePresetId = (providerId: number): string => {
    const override = selectedOverrides[providerId]
    if (override !== undefined) return override
    const defaultId = defaultPresets[providerId]
    if (defaultId && presets.some((preset) => preset.id === defaultId)) {
      return defaultId
    }
    return ''
  }

  if (loading) {
    return (
      <div className="border border-hairline">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft border-hairline">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Provider
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Client_ID
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Allowed
              </TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-mute">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, idx) => (
              <TableRow key={idx} className="border-hairline">
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-64" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-24 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <div className="border border-hairline">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft border-hairline hover:bg-surface-soft">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Provider
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Client_ID
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Allowed
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Quick_Preset
              </TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-mute">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => {
              const selectedPresetId = resolvePresetId(provider.id)
              const defaultPresetId = defaultPresets[provider.id] || ''
              const isDefault =
                !!selectedPresetId && selectedPresetId === defaultPresetId
              return (
                <TableRow
                  key={provider.id}
                  className="border-hairline hover:bg-surface-soft transition-colors text-xs"
                >
                  <TableCell className="font-bold uppercase min-w-[160px]">
                    {provider.name}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-ash break-all max-w-[320px]">
                    {provider.client_id || '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-bold ${
                        provider.enabled ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {provider.enabled ? '[ALLOWED]' : '[BLOCKED]'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={selectedPresetId || '__none__'}
                      onValueChange={(value) =>
                        setSelectedOverrides({
                          ...selectedOverrides,
                          [provider.id]: value === '__none__' ? '' : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 bg-transparent border border-hairline px-2 py-1 text-[10px] font-bold uppercase focus:border-ink rounded-none max-w-[260px]">
                        <SelectValue placeholder="— Pick preset —" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-ink">
                        <SelectItem
                          value="__none__"
                          className="text-[10px] font-bold uppercase"
                        >
                          — Pick preset —
                        </SelectItem>
                        {presets.map((preset) => (
                          <SelectItem
                            key={preset.id}
                            value={preset.id}
                            className="text-[10px] font-bold uppercase"
                          >
                            {preset.id === defaultPresetId
                              ? `★ ${preset.label}`
                              : preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      <Button
                        variant={isDefault ? 'primary' : 'outline'}
                        size="xs"
                        disabled={!selectedPresetId}
                        onClick={() =>
                          onSetDefaultPreset(
                            provider.id,
                            isDefault ? '' : selectedPresetId,
                          )
                        }
                        icon={<Star size={12} />}
                        aria-label={
                          isDefault
                            ? `Clear default preset for ${provider.name}`
                            : `Set default preset for ${provider.name}`
                        }
                      >
                        {isDefault ? 'Default' : 'Set_Default'}
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        disabled={!selectedPresetId || updating}
                        onClick={() =>
                          selectedPresetId &&
                          onApplyPreset(provider.id, selectedPresetId)
                        }
                        icon={<Zap size={12} />}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setEditing(provider)}
                        icon={<Pencil size={12} />}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {providers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mute">
                    NO_OAUTH_PROVIDERS_OR_CONNECTION_FAILED
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border border-hairline p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-mute">
            {editingPresetId ? 'Edit_Preset' : 'Quick_Create_Preset'}
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              showNewPreset ? resetNewPreset() : setShowNewPreset(true)
            }
            icon={<Plus size={12} />}
          >
            {showNewPreset ? 'Cancel' : 'New_Preset'}
          </Button>
        </div>
        {showNewPreset && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitNewPreset()
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Preset_Label
                </Label>
                <input
                  required
                  placeholder="e.g. PROD_GOOGLE"
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetLabel}
                  onChange={(e) => setNewPresetLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Provider_Name
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.name ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({ ...newPresetForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Client_ID
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold break-all"
                  value={newPresetForm.client_id ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({
                      ...newPresetForm,
                      client_id: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Auth_Endpoint
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.auth_endpoint ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({
                      ...newPresetForm,
                      auth_endpoint: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Validation_Endpoint
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.validation_endpoint ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({
                      ...newPresetForm,
                      validation_endpoint: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Scope
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.scope ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({ ...newPresetForm, scope: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  CSS_Class
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.css_class ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({
                      ...newPresetForm,
                      css_class: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Body
                </Label>
                <input
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.body ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({ ...newPresetForm, body: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Sequence
                </Label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-hairline focus:border-ink outline-none py-1 text-xs font-bold"
                  value={newPresetForm.sequence ?? ''}
                  onChange={(e) =>
                    setNewPresetForm({
                      ...newPresetForm,
                      sequence:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <input
                type="checkbox"
                checked={!!newPresetForm.enabled}
                onChange={(e) =>
                  setNewPresetForm({
                    ...newPresetForm,
                    enabled: e.target.checked,
                  })
                }
              />
              Enabled (Allowed)
            </label>
            <div className="flex gap-3">
              <Button
                type="submit"
                size="sm"
                disabled={!newPresetLabel.trim()}
                icon={<Save size={12} />}
              >
                {editingPresetId ? 'Update_Preset' : 'Save_Preset'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetNewPreset}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {presets.length > 0 && (
        <div className="border border-hairline p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-mute">
            Saved_Presets
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center gap-2 border px-2 py-1 text-[10px] font-bold uppercase ${
                  editingPresetId === preset.id
                    ? 'border-ink bg-surface-soft'
                    : 'border-hairline'
                }`}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hover:underline"
                      aria-label={`Preview preset ${preset.label}`}
                    >
                      {preset.label}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-96 max-w-[90vw] bg-canvas border-ink p-4 space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-bold uppercase tracking-tighter">
                        {preset.label}
                      </div>
                      <div className="text-[10px] font-mono break-all text-mute">
                        UUID · {preset.id}
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 gap-2 text-[10px]">
                      {EDITABLE_FIELDS.map((field) => {
                        const raw = preset.values[field]
                        const display =
                          raw === undefined || raw === null || raw === ''
                            ? '—'
                            : typeof raw === 'boolean'
                              ? raw
                                ? 'true'
                                : 'false'
                              : String(raw)
                        return (
                          <div
                            key={field}
                            className="flex flex-col gap-0.5 border-b border-hairline pb-1 last:border-b-0"
                          >
                            <dt className="font-bold uppercase tracking-widest opacity-60">
                              {field}
                            </dt>
                            <dd className="font-mono break-all">{display}</dd>
                          </div>
                        )
                      })}
                    </dl>
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={() => startEditPreset(preset)}
                  className="hover:underline"
                  aria-label={`Edit preset ${preset.label}`}
                >
                  <Pencil size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePreset(preset.id)}
                  className="text-danger hover:underline"
                  aria-label={`Delete preset ${preset.label}`}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <EditProviderModal
          provider={editing}
          presets={presets}
          onClose={() => setEditing(null)}
          onUpdate={onUpdate}
          onSaveAsPreset={onAddPreset}
        />
      )}
    </>
  )
}

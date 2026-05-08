import React from 'react'
import { Star } from 'lucide-react'
import type { OdooEnv } from '../../domain/models/OdooEnv'
import { Card, CardHeader, CardBody } from '../components/Card'
import { Button } from '../components/Button'
import { Typography } from '../components/Typography'

interface EnvCardProps {
  env: OdooEnv
  testingEnvId: number | null
  onTest: (id: number) => void
  onUpdate: (id: number, data: Partial<OdooEnv>) => void
  onEdit: (env: OdooEnv) => void
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
  onSetDefault: (id: number) => void
}

export const EnvCard: React.FC<EnvCardProps> = ({
  env,
  testingEnvId,
  onTest,
  onUpdate,
  onEdit,
  onDelete,
  onDuplicate,
  onSetDefault,
}) => {
  return (
    <Card className="relative group overflow-hidden">
      {env.is_default && (
        <div className="absolute top-0 left-0 bg-success text-canvas text-[8px] font-bold px-2 py-0.5 z-10 flex items-center gap-1">
          <Star size={8} fill="currentColor" />
          DEFAULT
        </div>
      )}

      <CardHeader className="pt-8">
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-3 h-3 cursor-pointer ring-1 ring-ink/20 hover:ring-ink transition-all"
                style={{ backgroundColor: env.color || 'gray' }}
                title="Click to change color"
                onClick={() => document.getElementById(`color-input-${env.id}`)?.click()}
              ></div>
              <input
                id={`color-input-${env.id}`}
                type="color"
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                value={env.color || '#808080'}
                onChange={(e) => onUpdate(env.id, { color: e.target.value })}
              />
            </div>
            <div>
              <Typography variant="h2" className="leading-none">
                {env.name}
              </Typography>
              <Typography variant="label" className="mt-1 lowercase block opacity-60">
                {env.url}
              </Typography>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-hairline/50">
            {!env.is_default && (
              <Button
                variant="link"
                size="xs"
                onClick={() => onSetDefault(env.id)}
                className="text-success p-0 h-auto flex items-center gap-1"
              >
                <Star size={10} />
                [SET_DEFAULT]
              </Button>
            )}
            <Button
              variant="link"
              size="xs"
              onClick={() => onTest(env.id)}
              disabled={testingEnvId === env.id}
              className="p-0 h-auto disabled:opacity-50"
            >
              {testingEnvId === env.id ? 'TESTING...' : '[TEST_CONNECTION]'}
            </Button>
            <Button variant="link" size="xs" onClick={() => onEdit(env)} className="p-0 h-auto">
              [EDIT]
            </Button>
            <Button
              variant="link"
              size="xs"
              onClick={() => onDuplicate(env.id)}
              className="p-0 h-auto"
            >
              [DUPLICATE]
            </Button>
            <Button variant="danger" size="xs" onClick={() => onDelete(env.id)} className="ml-auto">
              [DELETE]
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="border-t border-hairline/50">
        <div className="grid grid-cols-2 gap-8 py-2">
          <div>
            <Typography
              variant="label"
              className="mb-1 block opacity-50 text-[9px] uppercase tracking-tighter"
            >
              Database
            </Typography>
            <Typography variant="h3" className="text-sm font-bold tracking-tight">
              {env.db}
            </Typography>
          </div>
          <div>
            <Typography
              variant="label"
              className="mb-1 block opacity-50 text-[9px] uppercase tracking-tighter"
            >
              User
            </Typography>
            <Typography variant="body" className="text-sm font-bold truncate" title={env.username}>
              {env.username}
            </Typography>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

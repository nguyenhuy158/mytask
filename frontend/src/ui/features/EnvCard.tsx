import React from 'react'
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
}

export const EnvCard: React.FC<EnvCardProps> = ({
  env,
  testingEnvId,
  onTest,
  onUpdate,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative group">
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
            <Typography variant="h2">{env.name}</Typography>
            <Typography variant="label" className="mt-1 lowercase block">
              {env.url}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="link"
            size="xs"
            onClick={() => onTest(env.id)}
            disabled={testingEnvId === env.id}
            className="disabled:opacity-50"
          >
            {testingEnvId === env.id ? 'TESTING...' : '[TEST_CONNECTION]'}
          </Button>
          <Button variant="link" size="xs" onClick={() => onEdit(env)}>
            [EDIT]
          </Button>
          <Button variant="link" size="xs" onClick={() => onDuplicate(env.id)}>
            [DUPLICATE]
          </Button>
          <Button variant="danger" onClick={() => onDelete(env.id)}>
            [DELETE]
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-canvas p-4">
            <Typography variant="label" className="mb-1 block">
              Database
            </Typography>
            <Typography variant="h3">{env.db}</Typography>
          </div>
          <div className="bg-canvas p-4">
            <Typography variant="label" className="mb-1 block">
              User
            </Typography>
            <Typography variant="body" className="font-bold">
              {env.username}
            </Typography>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

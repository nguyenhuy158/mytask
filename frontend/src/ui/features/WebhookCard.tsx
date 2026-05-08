import React from 'react'
import type { Webhook } from '../../domain/models/Webhook'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Typography } from '../components/Typography'
interface WebhookCardProps {
  webhook: Webhook
  testingWebhookId: number | null
  onTest: (id: number) => void
  onDelete: (id: number) => void
}
export const WebhookCard: React.FC<WebhookCardProps> = ({
  webhook,
  testingWebhookId,
  onTest,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader className="mb-0">
        <div className="flex items-center gap-4">
          <div
            className={`w-3 h-3 ${
              webhook.type === 'webhook'
                ? 'bg-success'
                : webhook.type === 'telegram'
                  ? 'bg-accent'
                  : webhook.type === 'slack'
                    ? 'bg-purple-500'
                    : 'bg-orange-500'
            }`}
          ></div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h2">{webhook.name}</Typography>
              <Badge>{webhook.type}</Badge>
            </div>
            <Typography variant="label" className="mt-1 lowercase block truncate max-w-md">
              {webhook.type === 'telegram' ? `ID: ${webhook.target}` : webhook.url}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="link"
            size="xs"
            onClick={() => onTest(webhook.id)}
            disabled={testingWebhookId === webhook.id}
            className="disabled:opacity-50"
          >
            {testingWebhookId === webhook.id ? 'TESTING...' : '[TEST]'}
          </Button>
          <Button variant="danger" onClick={() => onDelete(webhook.id)}>
            [DELETE]
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

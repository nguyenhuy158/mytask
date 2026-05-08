import React from 'react'
import type { Task } from '../../domain/models/Task'
import { Card, CardHeader, CardBody, CardFooter } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Typography } from '../components/Typography'
interface TaskCardProps {
  task: Task
  result?: { text: string; time: string }
  onDelete: (id: number) => void
  onRun: (id: number) => void
  selected?: boolean
}
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  result,
  onDelete,
  onRun,
  selected = false,
}) => {
  return (
    <Card hoverable className={selected ? 'border-primary ring-1 ring-primary' : ''}>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge>{task.task_type}</Badge>
          <Badge
            variant={
              task.status === 'done' ? 'success' : task.status === 'doing' ? 'warning' : 'ash'
            }
          >
            {task.status}
          </Badge>
          <Badge variant="ash">P{task.priority || 3}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/tasks/${task.id}/decompose`,
                { method: 'POST' },
              )
              if (res.ok) window.location.reload()
            }}
          >
            [AI_SPLIT]
          </Button>
          <Button variant="danger" onClick={() => onDelete(task.id)}>
            [DELETE]
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <Typography variant="h1" className="mb-2 group-hover:text-primary transition-colors">
          {task.name}
        </Typography>
        <Typography variant="caption" className="mb-8 block line-clamp-2">
          {task.description}
        </Typography>
        {task.deadline && (
          <div className="mb-4 flex items-center justify-between border-t border-hairline pt-4">
            <Typography variant="label">Deadline</Typography>
            <Typography variant="code" className="text-danger font-bold uppercase">
              {new Date(task.deadline).toLocaleDateString()}
            </Typography>
          </div>
        )}
        {task.dependencies && (
          <div className="mb-4 flex items-center justify-between border-t border-hairline pt-4">
            <Typography variant="label">Depends On</Typography>
            <Typography variant="code" className="text-ash">
              TASK_{task.dependencies}
            </Typography>
          </div>
        )}
      </CardBody>
      <CardFooter>
        <div className="flex items-center justify-between">
          <Typography variant="label">Last Execution</Typography>
          <Typography variant="code" className="text-ash">
            {result ? result.time : 'NEVER'}
          </Typography>
        </div>
        {result && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="label">Last Result</Typography>
              <Typography variant="code" className="text-ash">
                {result.time}
              </Typography>
            </div>
            <div className="bg-surface-soft p-3 rounded-sm text-[11px] leading-tight break-all font-bold">
              {result.text}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRun(task.id)}
            className="hover:bg-ink hover:text-on-primary"
          >
            Run Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/tasks/${task.id}/branch`,
                { method: 'POST' },
              )
              const data = await res.json()
              if (data.status === 'success') alert(`Branch created: ${data.branch}`)
            }}
            className="hover:bg-ink hover:text-on-primary"
          >
            [GIT_BRANCH]
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

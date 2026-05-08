import React from 'react'
import type { Task } from '../../domain/models/Task'
import { TaskCard } from './TaskCard'
import { CalendarView } from './CalendarView'
import { Typography } from '../components/Typography'
import { Button } from '../components/Button'

interface DashboardProps {
  tasks: Task[]
  viewMode: 'list' | 'board' | 'calendar'
  results: Record<number, { text: string; time: string }>
  onDelete: (id: number) => void
  onRun: (id: number) => void
  onUpdateStatus: (id: number, status: string) => void
  selectedIndex?: number
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  viewMode,
  results,
  onDelete,
  onRun,
  onUpdateStatus,
  selectedIndex = -1,
}) => {
  if (viewMode === 'calendar') {
    return <CalendarView tasks={tasks} />
  }

  if (viewMode === 'list') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            result={results[task.id]}
            onDelete={onDelete}
            onRun={onRun}
            selected={idx === selectedIndex}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[600px]">
      {['todo', 'doing', 'done'].map((status) => (
        <div
          key={status}
          className="flex flex-col bg-surface-soft border border-hairline p-4 rounded-sm"
        >
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-hairline">
            <Typography variant="h3">{status}</Typography>
            <Typography variant="code" className="text-ash">
              {tasks.filter((t) => t.status === status).length}
            </Typography>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-canvas border border-hairline p-4 shadow-sm hover:border-ink transition-all group"
                >
                  <Typography variant="label" className="mb-2 block">
                    {task.task_type}
                  </Typography>
                  <Typography variant="h3" className="mb-2 block lowercase first-letter:uppercase">
                    {task.name}
                  </Typography>
                  <div className="flex gap-2 mt-4">
                    {status !== 'todo' && (
                      <Button
                        variant="underline"
                        size="xs"
                        onClick={() =>
                          onUpdateStatus(task.id, status === 'done' ? 'doing' : 'todo')
                        }
                      >
                        [BACK]
                      </Button>
                    )}
                    {status !== 'done' && (
                      <Button
                        variant="underline"
                        size="xs"
                        onClick={() =>
                          onUpdateStatus(task.id, status === 'todo' ? 'doing' : 'done')
                        }
                      >
                        [NEXT]
                      </Button>
                    )}
                    <Button
                      variant="underline"
                      size="xs"
                      onClick={() => onRun(task.id)}
                      className="ml-auto text-accent hover:text-accent/80"
                    >
                      RUN
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

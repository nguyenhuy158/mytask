import React from 'react'
import { ArrowLeft, ArrowRight, Play, Trash2 } from 'lucide-react'
import type { Task } from '../../domain/models/Task'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/ui/components/ui/card'
import { Button } from '@/ui/components/ui/button'
import { Badge } from '@/ui/components/ui/badge'
import { Tabs, TabsContent } from '@/ui/components/ui/tabs'

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
  const renderTaskCard = (task: Task, idx: number) => (
    <Card key={task.id} className={idx === selectedIndex ? 'border-ink ring-1 ring-ink' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            {task.task_type}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-mute hover:text-danger"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
        <CardTitle className="text-lg lowercase first-letter:uppercase">{task.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {results[task.id] && (
          <div className="bg-surface-soft p-2 border border-hairline text-[10px] font-mono mt-2">
            <p className="text-mute mb-1">[{results[task.id].time}]</p>
            <p className="truncate">{results[task.id].text}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[10px] uppercase border-ink hover:bg-ink hover:text-on-primary"
          onClick={() => onRun(task.id)}
        >
          <Play size={10} className="mr-1" /> RUN
        </Button>
        <div className="ml-auto flex gap-1">
          {task.status !== 'todo' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateStatus(task.id, task.status === 'done' ? 'doing' : 'todo')}
            >
              <ArrowLeft size={14} />
            </Button>
          )}
          {task.status !== 'done' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateStatus(task.id, task.status === 'todo' ? 'doing' : 'done')}
            >
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )

  if (viewMode === 'calendar') {
    return (
      <div className="p-8 border border-dashed border-hairline text-center text-ash uppercase font-mono">
        Calendar view under reconstruction
      </div>
    )
  }

  return (
    <Tabs value={viewMode} className="w-full">
      <TabsContent value="list">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => renderTaskCard(task, idx))}
        </div>
      </TabsContent>
      <TabsContent value="board">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {['todo', 'doing', 'done'].map((status) => (
            <div
              key={status}
              className="flex flex-col bg-surface-soft border border-hairline p-4 rounded-sm"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-hairline">
                <h3 className="text-sm font-bold uppercase tracking-widest">{status}</h3>
                <Badge variant="secondary" className="font-mono bg-ink text-on-primary">
                  {tasks.filter((t) => t.status === status).length}
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <Card
                      key={task.id}
                      className="bg-canvas shadow-none hover:border-ink transition-all border-hairline"
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm lowercase first-letter:uppercase">
                          {task.name}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        {status !== 'todo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onUpdateStatus(task.id, status === 'done' ? 'doing' : 'todo')
                            }
                          >
                            <ArrowLeft size={12} />
                          </Button>
                        )}
                        {status !== 'done' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onUpdateStatus(task.id, status === 'todo' ? 'doing' : 'done')
                            }
                          >
                            <ArrowRight size={12} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => onRun(task.id)}
                        >
                          <Play size={12} className="text-accent" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

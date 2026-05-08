import React from 'react'
import type { Task } from '../../domain/models/Task'

interface AsciiDashboardProps {
  tasks: Task[]
}

export const AsciiDashboard: React.FC<AsciiDashboardProps> = ({ tasks }) => {
  // Simple Productivity Chart based on Task statuses
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const doingCount = tasks.filter((t) => t.status === 'doing').length
  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const total = tasks.length || 1

  const doneHeight = Math.round((doneCount / total) * 10)
  const doingHeight = Math.round((doingCount / total) * 10)
  const todoHeight = Math.round((todoCount / total) * 10)

  const renderBar = (height: number) => {
    let bar = ''
    for (let i = 10; i > 0; i--) {
      if (i <= height) bar += '  |###|  \n'
      else bar += '         \n'
    }
    bar += '  +---+  '
    return bar.split('\n')
  }

  const doneLines = renderBar(doneHeight)
  const doingLines = renderBar(doingHeight)
  const todoLines = renderBar(todoHeight)

  let chart = ''
  for (let i = 0; i < 11; i++) {
    const label = i === 10 ? '  0 ' : `${(10 - i) * 10}`.padStart(3, ' ') + ' '
    chart += `${label}| ${todoLines[i]} ${doingLines[i]} ${doneLines[i]}\n`
  }
  chart += '      +---------------------------\n'
  chart += '          TODO    DOING    DONE'

  // Dependency Graph Generator
  const generateGraph = () => {
    let graph = ''
    const roots = tasks.filter((t) => !t.dependencies)

    const renderNode = (task: Task, level: number) => {
      const indent = '  '.repeat(level)
      const prefix = level === 0 ? '' : '└── '
      graph += `${indent}${prefix}[${task.id}] ${task.name.substring(0, 15)}\n`

      const children = tasks.filter((t) => t.dependencies === task.id.toString())
      children.forEach((child) => renderNode(child, level + 1))
    }

    roots.forEach((root) => renderNode(root, 0))
    return graph || 'No tasks found.'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="border border-ink bg-canvas p-8 flex flex-col items-center">
        <div className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-6">
          Task_Distribution_Status
        </div>
        <pre className="text-[11px] leading-tight text-ink font-bold bg-surface-soft p-8 border border-hairline w-full overflow-auto text-center">
          {chart}
        </pre>
      </div>

      <div className="border border-ink bg-canvas p-8">
        <div className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-6">
          Live_Dependency_Graph
        </div>
        <pre className="text-[11px] leading-tight text-ink font-bold space-y-1 bg-surface-soft p-8 border border-hairline w-full overflow-auto">
          {generateGraph()}
        </pre>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import type { Task } from '../../domain/models/Task'
import { Typography } from '../components/Typography'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarViewProps {
  tasks: Task[]
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const startDay = startOfMonth.getDay()
  const totalDays = endOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = []
  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => {
      if (!task.deadline) return false
      const deadline = new Date(task.deadline)
      return (
        deadline.getDate() === day &&
        deadline.getMonth() === currentDate.getMonth() &&
        deadline.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <div className="bg-canvas border border-ink p-8">
      <div className="flex items-center justify-between mb-8">
        <Typography variant="h2" className="uppercase tracking-tight">
          {monthName} {currentDate.getFullYear()}
        </Typography>
        <div className="flex gap-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-surface-soft border border-hairline transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-surface-soft border border-hairline transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-hairline border border-hairline">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="bg-surface-soft p-4 text-center">
            <Typography variant="code" className="text-[10px] font-bold text-ash">
              {day}
            </Typography>
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`bg-canvas min-h-[120px] p-2 flex flex-col gap-2 ${day === null ? 'opacity-20' : ''}`}
          >
            {day !== null && (
              <>
                <Typography variant="code" className="text-xs font-bold mb-1">
                  {day.toString().padStart(2, '0')}
                </Typography>
                <div className="flex flex-col gap-1">
                  {getTasksForDay(day).map((task) => (
                    <div
                      key={task.id}
                      className={`text-[9px] p-1.5 border border-hairline truncate font-bold uppercase ${
                        task.status === 'done'
                          ? 'bg-success/10 text-success line-through opacity-50'
                          : task.status === 'doing'
                            ? 'bg-accent/10 text-accent border-accent/30'
                            : 'bg-surface-soft'
                      }`}
                      title={task.name}
                    >
                      {task.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

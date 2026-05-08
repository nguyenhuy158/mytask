import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
export const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [isCollapsed, setIsCollapsed] = useState(true)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        }
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval)
            setIsActive(false)
            toast.success(mode === 'work' ? 'Break time!' : 'Back to work!')
            if (mode === 'work') {
              setMode('break')
              setMinutes(5)
            } else {
              setMode('work')
              setMinutes(25)
            }
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        }
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, seconds, minutes, mode])
  const toggle = () => setIsActive(!isActive)
  const reset = () => {
    setIsActive(false)
    setMinutes(mode === 'work' ? 25 : 5)
    setSeconds(0)
  }
  const renderProgressBar = () => {
    const total = mode === 'work' ? 25 * 60 : 5 * 60
    const current = minutes * 60 + seconds
    const progress = Math.round(((total - current) / total) * 10)
    return `[${'#'.repeat(progress)}${'.'.repeat(10 - progress)}]`
  }
  return (
    <div
      className={`border border-ink bg-canvas text-ink font-mono transition-all duration-300 relative z-[100] ${isCollapsed ? 'p-2 w-28 md:w-32' : 'p-4 w-[calc(100vw-2rem)] md:w-64'}`}
    >
      <div className="text-[10px] uppercase font-bold mb-2 opacity-50 flex justify-between items-center cursor-move">
        <span>Pomodoro [{mode}]</span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:text-ink transition-colors px-1"
        >
          {isCollapsed ? '[+]' : '[—]'}
        </button>
      </div>
      {!isCollapsed ? (
        <>
          <div className="text-4xl font-bold tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-bold mt-1 opacity-80">{renderProgressBar()}</div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={toggle}
              className="text-[10px] font-bold border border-ink px-2 py-1 hover:bg-ink hover:text-canvas transition-colors"
            >
              {isActive ? '[PAUSE]' : '[START]'}
            </button>
            <button
              onClick={reset}
              className="text-[10px] font-bold border border-ink px-2 py-1 hover:bg-ink hover:text-canvas transition-colors"
            >
              [RESET]
            </button>
          </div>
        </>
      ) : (
        <div className="text-xl font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { wsAdapter } from '../../adapters/websocket/NativeWsAdapter'

export const LogStream = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (data: { type: string; message: string }) => {
      if (data.type === 'LOG_STREAM') {
        setLogs((prev) =>
          [...prev, `[${new Date().toLocaleTimeString()}] ${data.message}`].slice(-100),
        )
      }
    }
    wsAdapter.connect(handler, () => {})

    return () => {}
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      className={`bg-ink text-on-primary font-mono transition-all duration-300 border border-ink flex flex-col relative z-[100] ${isCollapsed ? 'h-8 w-48 md:w-64' : 'h-64 w-[calc(100vw-2rem)] md:w-64'}`}
    >
      <div className="text-[10px] uppercase font-bold p-2 flex justify-between items-center opacity-70 border-b border-white/10 cursor-move">
        <div className="flex items-center gap-2">
          <span>System Log</span>
          {!isCollapsed && <span className="animate-pulse">● LIVE</span>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:text-white transition-colors"
        >
          {isCollapsed ? '[+]' : '[—]'}
        </button>
      </div>

      {!isCollapsed && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 text-[10px]">
          {logs.length === 0 && <div className="text-mute italic">Waiting for logs...</div>}
          {logs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'

interface FocusModeProps {
  onClose: () => void
}

export const FocusMode: React.FC<FocusModeProps> = ({ onClose }) => {
  const [input, setInput] = useState('')

  return (
    <div className="fixed inset-0 z-[200] bg-canvas flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
      <button
        onClick={onClose}
        className="absolute top-10 right-10 text-[10px] font-bold border border-ink px-4 py-2 hover:bg-ink hover:text-canvas"
      >
        [EXIT_ZEN_MODE]
      </button>

      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="text-[10px] uppercase font-bold tracking-[0.5em] opacity-30">
          Focus_Session_Active
        </div>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you working on?"
          className="w-full bg-transparent border-none text-4xl font-bold text-center outline-none placeholder:opacity-10"
        />
        <div className="text-xs italic text-mute">Press ESC to exit or type your goal above</div>
      </div>

      <div className="mt-20 opacity-5">
        <pre className="text-[10px] leading-none">
          {`
  ███████╗ ██████╗  ██████╗██╗   ██╗███████╗
  ██╔════╝██╔═══██╗██╔════╝██║   ██║██╔════╝
  █████╗  ██║   ██║██║     ██║   ██║███████╗
  ██╔══╝  ██║   ██║██║     ██║   ██║╚════██║
  ██║     ╚██████╔╝╚██████╗╚██████╔╝███████║
  ╚═╝      ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝
          `}
        </pre>
      </div>
    </div>
  )
}

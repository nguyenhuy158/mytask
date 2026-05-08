import React, { useState, useRef, useEffect } from 'react'
interface Option {
  value: string | number
  label: string
}
interface SelectProps {
  value: string | number
  options: Option[]
  onChange: (value: string | number) => void
  placeholder?: string
  className?: string
}
export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((o) => o.value === value)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-transparent border-b border-hairline hover:border-ink py-1 text-sm font-bold transition-colors outline-none"
      >
        <span className={!selectedOption ? 'text-mute' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-[10px] opacity-30 ml-4">{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[200px] bg-canvas border border-ink shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-[300px] overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                  option.value === value ? 'bg-ink text-on-primary' : 'hover:bg-surface-soft'
                }`}
              >
                <span className="text-sm font-bold">
                  {option.value === value && <span className="mr-2">✓</span>}
                  {option.label}
                </span>
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-2 text-xs italic text-mute">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

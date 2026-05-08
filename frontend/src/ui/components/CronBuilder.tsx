import React, { useState } from 'react'
import { Cron } from 'react-js-cron'
import 'react-js-cron/dist/styles.css'
import { X } from 'lucide-react'

interface CronBuilderProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

export const CronBuilder: React.FC<CronBuilderProps> = ({ value, onChange, onClose }) => {
  const [internalValue, setInternalValue] = useState(value || '0 * * * *')

  return (
    <div className="fixed inset-0 z-[300] bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-canvas border border-ink shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink bg-surface-soft">
          <h2 className="text-xs font-bold uppercase tracking-widest">Cron Expression Builder</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ink hover:text-on-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="cron-builder-container">
            <Cron
              value={internalValue}
              setValue={(val) => {
                setInternalValue(val)
              }}
              displayError={true}
              clearButton={false}
            />
          </div>

          <div className="pt-6 border-t border-hairline flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-mute uppercase">Current Expression</span>
              <code className="bg-surface-soft px-3 py-1 border border-hairline text-xs font-bold tabular-nums">
                {internalValue}
              </code>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 text-[10px] font-bold border border-hairline hover:border-ink transition-all uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onChange(internalValue)
                  onClose()
                }}
                className="px-6 py-2 text-[10px] font-bold bg-ink text-on-primary border border-ink hover:bg-ink-deep transition-all uppercase"
              >
                Apply Expression
              </button>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .cron-builder-container .react-js-cron-select {
          font-family: 'Berkeley Mono', monospace !important;
          font-size: 12px !important;
          border-radius: 4px !important;
        }
        .cron-builder-container .react-js-cron-field {
          margin-bottom: 16px !important;
        }
        .cron-builder-container .ant-select-selector {
          border-radius: 4px !important;
          border-color: rgba(15,0,0,0.12) !important;
          background-color: #f8f7f7 !important;
        }
        .cron-builder-container .ant-select-focused .ant-select-selector {
          border-color: #201d1d !important;
          box-shadow: none !important;
        }
        .cron-builder-container .react-js-cron-text {
          font-family: 'Berkeley Mono', monospace !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          color: #646262 !important;
        }
      `,
        }}
      />
    </div>
  )
}

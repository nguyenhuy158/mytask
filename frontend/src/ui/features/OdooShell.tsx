import React, { useState } from 'react'
import toast from 'react-hot-toast'
export const OdooShell = ({ envId }: { envId: number }) => {
  const [script, setScript] = useState('')
  const [output, setOutput] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const execute = async () => {
    if (!script) return
    setLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/odoo/${envId}/shell`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script }),
        },
      )
      const data = await response.json()
      setOutput(data)
      toast.success('Executed')
    } catch (e) {
      toast.error('Execution failed')
      setOutput(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="border border-ink bg-canvas font-mono overflow-hidden flex flex-col h-[500px] sm:h-[600px]">
      <div className="bg-ink text-on-primary px-4 py-2 text-[10px] font-bold uppercase flex justify-between items-center">
        <span>Odoo Remote Shell</span>
        {loading && <span className="animate-pulse">EXECUTING...</span>}
      </div>
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <div className="text-[10px] text-mute mb-2 italic">
          Format: model|method|args|kwargs Example: res.partner|search_read|[[["is_company", "=",
          true]]]|{'{'}"fields": ["name"]{'}'}
        </div>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter shell command..."
          className="flex-1 bg-surface-soft border border-hairline p-4 text-xs outline-none focus:border-ink resize-none"
        />
        <button
          onClick={execute}
          disabled={loading}
          className="bg-ink text-on-primary py-2 font-bold text-xs uppercase hover:opacity-90 disabled:opacity-50"
        >
          [RUN_SCRIPT]
        </button>
        {output && (
          <div className="h-1/3 overflow-auto bg-black text-green-400 p-4 text-[10px] border border-ink">
            <pre>{JSON.stringify(output, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

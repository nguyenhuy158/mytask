import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
export const Wiki = () => {
  const [notes, setNotes] = useState<{ id: number; title: string; timestamp: string }[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/notes`)
      const data = await res.json()
      setNotes(data)
    } catch (err) {
      console.error(err)
    }
  }
  useEffect(() => {
    const init = async () => {
      await fetchNotes()
    }
    init()
  }, [])
  const saveNote = async () => {
    if (!title || !content) return
    setLoading(true)
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      toast.success('Note saved')
      setTitle('')
      setContent('')
      fetchNotes()
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
      <div className="lg:col-span-1 border border-ink bg-canvas flex flex-col">
        <div className="bg-ink text-on-primary px-4 py-2 text-[10px] font-bold uppercase">
          Wiki_Index
        </div>
        <div className="flex-1 overflow-auto divide-y divide-hairline">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 hover:bg-surface-soft cursor-pointer transition-colors"
            >
              <div className="font-bold text-xs uppercase">{note.title}</div>
              <div className="text-[10px] text-mute mt-1">
                {new Date(note.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 border border-ink bg-canvas flex flex-col">
        <div className="bg-ink text-on-primary px-4 py-2 text-[10px] font-bold uppercase flex justify-between">
          <span>Editor</span>
          {loading && <span className="animate-pulse">SAVING...</span>}
        </div>
        <div className="flex-1 flex flex-col p-8 space-y-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="text-2xl font-bold bg-transparent border-none outline-none placeholder:opacity-10 uppercase tracking-tight"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing Markdown..."
            className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
          />
          <div className="flex justify-end border-t border-hairline pt-6">
            <button
              onClick={saveNote}
              disabled={loading}
              className="bg-ink text-on-primary px-8 py-3 font-bold text-xs uppercase hover:opacity-90 transition-all"
            >
              [COMMIT_CHANGES]
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

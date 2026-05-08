import React, { useState, useEffect } from 'react'
import { Typography } from './Typography'
import { Button } from './Button'

interface FilePreviewProps {
  attachmentId: number
  filename: string
  mimetype: string
  onClose: () => void
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  attachmentId,
  filename,
  mimetype,
  onClose,
}) => {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attachments/${attachmentId}/url`,
    )
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.url)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [attachmentId])

  return (
    <div className="fixed inset-0 z-[400] bg-ink/90 flex flex-col p-4 sm:p-12 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h1" className="text-canvas truncate max-w-[70%]">
          {filename}
        </Typography>
        <Button
          onClick={onClose}
          variant="outline"
          className="border-canvas text-canvas hover:bg-canvas hover:text-ink"
        >
          [CLOSE]
        </Button>
      </div>

      <div className="flex-1 bg-canvas border border-ink overflow-auto flex items-center justify-center relative">
        {loading && (
          <div className="text-ink font-mono text-xs animate-pulse">LOADING_CONTENT...</div>
        )}

        {!loading && url && (
          <>
            {mimetype.startsWith('image/') ? (
              <img src={url} alt={filename} className="max-w-full max-h-full object-contain" />
            ) : mimetype === 'application/pdf' ? (
              <iframe src={url} title={filename} className="w-full h-full border-none" />
            ) : (
              <div className="text-center p-8">
                <Typography variant="h2" className="mb-4">
                  NO PREVIEW AVAILABLE
                </Typography>
                <Typography variant="caption" className="mb-8">
                  This file type ({mimetype}) cannot be previewed directly.
                </Typography>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block border border-ink px-6 py-3 font-bold uppercase hover:bg-ink hover:text-canvas transition-colors"
                >
                  Download File
                </a>
              </div>
            )}
          </>
        )}

        {!loading && !url && <div className="text-danger font-bold">FAILED_TO_LOAD_URL</div>}
      </div>
    </div>
  )
}

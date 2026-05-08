import React, { useState, useMemo } from 'react'
import type { HistoryItem } from '../../domain/models/System'
import { Typography } from '../components/Typography'
import { Pagination } from '../components/Table'
interface HistoryTableProps {
  history: HistoryItem[]
}
export const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return history.slice(startIndex, startIndex + pageSize)
  }, [history, currentPage])
  const totalPages = Math.ceil(history.length / pageSize)
  return (
    <div className="mt-16">
      <div className="flex items-center gap-2 mb-6 border-b border-hairline pb-2">
        <Typography variant="h2">Execution Log</Typography>
      </div>
      <div className="border border-hairline">
        <div className="divide-y divide-hairline">
          {history.length > 0 ? (
            paginatedHistory.map((item, index) => {
              const globalIndex = (currentPage - 1) * pageSize + index
              return (
                <div
                  key={globalIndex}
                  className="px-6 py-3 flex items-center justify-between hover:bg-surface-soft transition-colors text-xs"
                >
                  <div className="flex items-center gap-6">
                    <Typography variant="code" className="text-ash">
                      {String(globalIndex + 1).padStart(2, '0')}.
                    </Typography>
                    <div>
                      <Typography variant="body" className="font-bold mr-4 underline">
                        {item.task_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="not-italic text-body truncate inline-block max-w-sm"
                      >
                        {item.result}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="code" className="text-ash text-right">
                    {new Date(item.timestamp).toLocaleDateString()}{' '}
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Typography>
                </div>
              )
            })
          ) : (
            <div className="px-6 py-10 text-center text-ash italic text-xs font-bold uppercase tracking-widest">
              No activity found in logs.
            </div>
          )}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="px-4"
      />
    </div>
  )
}

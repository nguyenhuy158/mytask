import React, { useState, useMemo } from 'react'
import type { HistoryItem } from '@/domain/models/System'
import { Typography } from '@/ui/components/Typography'
import { Pagination } from '@/ui/components/Table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table'

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
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft hover:bg-surface-soft">
              <TableHead className="w-[80px] text-[10px] font-bold uppercase tracking-widest text-mute">
                ID
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Task_Name
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-mute">
                Result
              </TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-mute">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length > 0 ? (
              paginatedHistory.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index
                return (
                  <TableRow
                    key={globalIndex}
                    className="hover:bg-surface-soft transition-colors text-xs border-hairline"
                  >
                    <TableCell className="text-ash font-mono">
                      {String(globalIndex + 1).padStart(2, '0')}.
                    </TableCell>
                    <TableCell className="font-bold underline decoration-hairline">
                      {item.task_name}
                    </TableCell>
                    <TableCell className="not-italic text-body truncate max-w-sm">
                      {item.result}
                    </TableCell>
                    <TableCell className="text-ash text-right font-mono">
                      {new Date(item.timestamp).toLocaleDateString()}{' '}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-ash italic text-xs font-bold uppercase tracking-widest"
                >
                  No activity found in logs.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

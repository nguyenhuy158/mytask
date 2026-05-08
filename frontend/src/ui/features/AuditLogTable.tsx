import React, { useState, useMemo } from 'react'
import type { AuditLog } from '../../domain/models/System'
import { Table, TableBody, TableRow, TableCell, Pagination } from '../components/Table'
import { Button } from '../components/Button'
import { Typography } from '../components/Typography'
interface AuditLogTableProps {
  logs: AuditLog[]
  onRefresh: () => void
}
export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return logs.slice(startIndex, startIndex + pageSize)
  }, [logs, currentPage])
  const totalPages = Math.ceil(logs.length / pageSize)
  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6 border-b border-hairline pb-2">
        <Typography variant="h2">System Audit Log</Typography>
        <Button
          variant="link"
          size="xs"
          onClick={() => {
            onRefresh()
            setCurrentPage(1)
          }}
        >
          REFRESH_LOGS
        </Button>
      </div>
      <Table className="bg-surface-soft">
        <TableBody>
          {paginatedLogs.map((log, i) => (
            <TableRow key={i} className="hover:bg-canvas">
              <TableCell className="px-4 py-2 font-bold text-ash tabular-nums whitespace-nowrap min-w-[180px]">
                {new Date(log.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="px-4 py-2 font-bold uppercase text-primary whitespace-nowrap min-w-[150px]">
                [{log.action}]
              </TableCell>
              <TableCell className="px-4 py-2 italic text-mute">{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="px-4"
      />
    </div>
  )
}

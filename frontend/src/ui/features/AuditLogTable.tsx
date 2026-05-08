import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table'
import { Button } from '@/ui/components/ui/button'
import { Badge } from '@/ui/components/ui/badge'
import { useSystem } from '../hooks/useSystem'

export const AuditLogTable: React.FC = () => {
  const [page, setPage] = useState(0)
  const pageSize = 15

  const { auditLogs, totalLogs, fetchAll } = useSystem(page * pageSize, pageSize)

  const totalPages = Math.ceil(totalLogs / pageSize)

  return (
    <div className="mt-16 space-y-6">
      <div className="flex items-center justify-between border-b border-ink pb-4">
        <div>
          <h2 className="text-xl font-bold uppercase">System Audit Log</h2>
          <p className="text-mute text-[10px] italic mt-1">Tracking all system-level actions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] font-bold border-ink hover:bg-ink hover:text-on-primary"
          onClick={() => fetchAll()}
        >
          [REFRESH_LOGS]
        </Button>
      </div>

      <div className="border border-hairline bg-surface-soft">
        <Table>
          <TableHeader className="bg-ink text-on-primary">
            <TableRow className="hover:bg-ink">
              <TableHead className="text-[10px] font-bold uppercase text-on-primary w-[200px]">
                Timestamp
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-on-primary w-[150px]">
                Action
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-on-primary">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log, i) => (
              <TableRow key={i} className="hover:bg-canvas border-hairline">
                <TableCell className="font-mono text-[11px] text-ash tabular-nums">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold uppercase border-ink rounded-none px-1.5"
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] italic text-mute lowercase first-letter:uppercase">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
            {auditLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-ash uppercase font-bold">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-ash uppercase">
          Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalLogs)} of{' '}
          {totalLogs} entries
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="text-[10px] font-bold border-ink rounded-none"
          >
            [PREV]
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="text-[10px] font-bold border-ink rounded-none"
          >
            [NEXT]
          </Button>
        </div>
      </div>
    </div>
  )
}

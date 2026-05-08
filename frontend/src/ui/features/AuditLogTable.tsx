import React from 'react'
import type { AuditLog } from '../../domain/models/System'
import { Table, TableBody, TableRow, TableCell } from '../components/Table'
import { Button } from '../components/Button'
import { Typography } from '../components/Typography'

interface AuditLogTableProps {
  logs: AuditLog[]
  onRefresh: () => void
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onRefresh }) => {
  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6 border-b border-hairline pb-2">
        <Typography variant="h2">System Audit Log</Typography>
        <Button variant="link" size="xs" onClick={onRefresh}>
          REFRESH_LOGS
        </Button>
      </div>
      <Table className="bg-surface-soft max-h-64 overflow-y-auto block">
        <TableBody className="block w-full">
          {logs.map((log, i) => (
            <TableRow key={i} className="hover:bg-canvas block w-full flex">
              <TableCell className="px-4 py-2 font-bold text-ash tabular-nums whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="px-4 py-2 font-bold uppercase text-primary whitespace-nowrap">
                [{log.action}]
              </TableCell>
              <TableCell className="px-4 py-2 italic text-mute flex-1">{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

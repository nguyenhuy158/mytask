import React from 'react'
import type { DisbursementReport as IDisbursementReport } from '../../domain/models/OdooEnv'
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../components/Table'
import { Typography } from '../components/Typography'
import { Badge } from '../components/Badge'

interface DisbursementReportProps {
  report: IDisbursementReport[]
  loading: boolean
}

export const DisbursementReport: React.FC<DisbursementReportProps> = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Typography variant="label" className="animate-pulse">
          FETCHING_REPORT_DATA...
        </Typography>
      </div>
    )
  }

  if (report.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-hairline">
        <Typography variant="label" className="text-ash">
          NO_DATA_AVAILABLE
        </Typography>
      </div>
    )
  }

  const getKindVariant = (kind: string) => {
    switch (kind) {
      case 'new':
        return 'success'
      case 'fast':
        return 'warning'
      case 'early':
        return 'default'
      default:
        return 'ash'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h3" className="uppercase">
          Disbursement Speed
        </Typography>
        <Typography variant="code" className="text-ash">
          COUNT: {report.length}
        </Typography>
      </div>
      <Table>
        <TableHeader>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Confirm Date</TableHeaderCell>
          <TableHeaderCell>Approve Date</TableHeaderCell>
          <TableHeaderCell>Approved By</TableHeaderCell>
          <TableHeaderCell align="right">Duration (Min)</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {report.map((rec) => (
            <TableRow key={rec.id}>
              <TableCell className="font-bold">{rec.name}</TableCell>
              <TableCell>
                <Badge variant={getKindVariant(rec.kind)}>{rec.kind}</Badge>
              </TableCell>
              <TableCell className="text-[11px] text-ash tabular-nums">
                {rec.confirm_date}
              </TableCell>
              <TableCell className="text-[11px] text-ash tabular-nums">
                {rec.approve_date}
              </TableCell>
              <TableCell className="text-[11px]">
                {rec.approve_uid ? rec.approve_uid[1] : '-'}
              </TableCell>
              <TableCell
                align="right"
                className={`font-bold tabular-nums ${rec.approval_duration > 60 ? 'text-danger' : 'text-success'}`}
              >
                {rec.approval_duration.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

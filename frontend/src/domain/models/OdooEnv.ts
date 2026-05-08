export interface OdooEnv {
  id: number
  name: string
  url: string
  db: string
  username: string
  password?: string
  color?: string
}

export interface DisbursementReport {
  id: number
  name: string
  kind: string
  confirm_date: string
  approve_date: string
  approve_uid: [number, string]
  approval_duration: number
}

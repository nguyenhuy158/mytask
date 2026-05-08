export interface OdooEnv {
  id: number
  name: string
  url: string
  db: string
  username: string
  password?: string
  color?: string
  is_default?: boolean
}
export interface DisbursementReport {
  id: number
  name: string
  kind: string
  confirm_date: string
  approve_date: string
  approve_uid: [number, string]
  project_name: string
  approval_duration: number
}

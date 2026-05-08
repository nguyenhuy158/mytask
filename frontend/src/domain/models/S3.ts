export interface S3Config {
  id: number
  name: string
  endpoint: string
  region: string
  bucket: string
  access_key: string
  secret_key: string
  active: boolean
}

export interface S3Backup {
  key: string
  size: number
  last_modified: string
}

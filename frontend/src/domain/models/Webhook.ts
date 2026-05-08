export interface Webhook {
  id: number
  name: string
  type: 'webhook' | 'telegram' | 'slack' | 'gmail' | 'resend'
  url?: string
  secret?: string
  target?: string
  active: number
}

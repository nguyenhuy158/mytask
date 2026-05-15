export interface OAuthProvider {
  id: number
  name: string
  client_id: string
  enabled: boolean
  body: string
  auth_endpoint: string
  validation_endpoint: string
  scope: string
  css_class: string
  sequence: number
}

export type OAuthProviderUpdate = Partial<Omit<OAuthProvider, 'id'>>

export interface OAuthProviderPreset {
  id: string
  label: string
  values: OAuthProviderUpdate
}

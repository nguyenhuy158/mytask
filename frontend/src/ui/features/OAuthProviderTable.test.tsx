import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OAuthProviderTable } from './OAuthProviderTable'
import type {
  OAuthProvider,
  OAuthProviderPreset,
} from '../../domain/models/OAuthProvider'

const baseProvider: OAuthProvider = {
  id: 3,
  name: 'Google OAuth2',
  client_id: '261838289776-xyz.apps.googleusercontent.com',
  enabled: true,
  body: 'Log in with Google',
  auth_endpoint: 'https://accounts.google.com/o/oauth2/auth',
  validation_endpoint: 'https://oauth2.googleapis.com/tokeninfo',
  scope: 'profile email',
  css_class: 'fa fa-google',
  sequence: 10,
}

const baseProps = {
  providers: [baseProvider],
  loading: false,
  updating: false,
  presets: [] as OAuthProviderPreset[],
  onUpdate: vi.fn(),
  onApplyPreset: vi.fn(),
  onAddPreset: vi.fn(),
  onDeletePreset: vi.fn(),
}

describe('OAuthProviderTable', () => {
  it('renders providers and allowed badge', () => {
    render(<OAuthProviderTable {...baseProps} />)
    expect(screen.getByText('Google OAuth2')).toBeDefined()
    expect(screen.getByText('[ALLOWED]')).toBeDefined()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(<OAuthProviderTable {...baseProps} loading={true} />)
    expect(container.querySelectorAll('[data-slot="skeleton"], .h-4').length).toBeGreaterThan(0)
  })

  it('shows empty state when no providers', () => {
    render(<OAuthProviderTable {...baseProps} providers={[]} />)
    expect(screen.getByText('NO_OAUTH_PROVIDERS_OR_CONNECTION_FAILED')).toBeDefined()
  })

  it('applies preset to a provider', () => {
    const presets: OAuthProviderPreset[] = [
      { id: 'p1', label: 'PROD', values: { client_id: 'p-id', enabled: true } },
    ]
    const onApplyPreset = vi.fn()
    render(
      <OAuthProviderTable
        {...baseProps}
        presets={presets}
        onApplyPreset={onApplyPreset}
      />,
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p1' } })
    fireEvent.click(screen.getByText('Apply'))
    expect(onApplyPreset).toHaveBeenCalledWith(3, 'p1')
  })

  it('opens edit modal and submits updated fields', () => {
    const onUpdate = vi.fn()
    render(<OAuthProviderTable {...baseProps} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('Edit'))
    const clientIdInput = screen.getByDisplayValue(baseProvider.client_id) as HTMLInputElement
    fireEvent.change(clientIdInput, { target: { value: 'updated-id' } })
    fireEvent.click(screen.getByText('[UPDATE_PROVIDER]'))
    expect(onUpdate).toHaveBeenCalledWith(3, { client_id: 'updated-id' })
  })

  it('saves a preset from the edit modal', () => {
    const onAddPreset = vi.fn()
    render(<OAuthProviderTable {...baseProps} onAddPreset={onAddPreset} />)
    fireEvent.click(screen.getByText('Edit'))
    const labelInput = screen.getByPlaceholderText(
      'Preset label e.g. PROD_GOOGLE',
    ) as HTMLInputElement
    fireEvent.change(labelInput, { target: { value: 'PROD' } })
    fireEvent.click(screen.getByText('Save_Preset'))
    expect(onAddPreset).toHaveBeenCalled()
    expect(onAddPreset.mock.calls[0][0]).toBe('PROD')
  })

  it('deletes preset chip', () => {
    const presets: OAuthProviderPreset[] = [
      { id: 'p1', label: 'PROD', values: { client_id: 'p-id' } },
    ]
    const onDeletePreset = vi.fn()
    render(
      <OAuthProviderTable
        {...baseProps}
        presets={presets}
        onDeletePreset={onDeletePreset}
      />,
    )
    fireEvent.click(screen.getByLabelText('Delete preset PROD'))
    expect(onDeletePreset).toHaveBeenCalledWith('p1')
  })
})

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
  defaultPresets: {} as Record<number, string>,
  onUpdate: vi.fn(),
  onApplyPreset: vi.fn(),
  onAddPreset: vi.fn(),
  onUpdatePreset: vi.fn(),
  onDeletePreset: vi.fn(),
  onSetDefaultPreset: vi.fn(),
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

  it('auto-selects default preset and toggles default off', () => {
    const presets: OAuthProviderPreset[] = [
      { id: 'p1', label: 'PROD', values: { client_id: 'p-id' } },
    ]
    const onSetDefaultPreset = vi.fn()
    render(
      <OAuthProviderTable
        {...baseProps}
        presets={presets}
        defaultPresets={{ 3: 'p1' }}
        onSetDefaultPreset={onSetDefaultPreset}
      />,
    )
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('p1')
    expect(screen.getByText('★ PROD')).toBeDefined()
    fireEvent.click(screen.getByText('Default'))
    expect(onSetDefaultPreset).toHaveBeenCalledWith(3, '')
  })

  it('sets a default preset from the selection', () => {
    const presets: OAuthProviderPreset[] = [
      { id: 'p1', label: 'PROD', values: { client_id: 'p-id' } },
    ]
    const onSetDefaultPreset = vi.fn()
    render(
      <OAuthProviderTable
        {...baseProps}
        presets={presets}
        onSetDefaultPreset={onSetDefaultPreset}
      />,
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p1' } })
    fireEvent.click(screen.getByText('Set_Default'))
    expect(onSetDefaultPreset).toHaveBeenCalledWith(3, 'p1')
  })

  it('ignores a default that points to a missing preset', () => {
    render(
      <OAuthProviderTable
        {...baseProps}
        presets={[]}
        defaultPresets={{ 3: 'missing' }}
      />,
    )
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('')
  })

  it('creates a quick preset from the inline form', () => {
    const onAddPreset = vi.fn()
    render(<OAuthProviderTable {...baseProps} onAddPreset={onAddPreset} />)
    fireEvent.click(screen.getByText('New_Preset'))
    const labelInput = screen.getByPlaceholderText(
      'e.g. PROD_GOOGLE',
    ) as HTMLInputElement
    fireEvent.change(labelInput, { target: { value: 'STAGING' } })
    const saveBtn = screen.getAllByText('Save_Preset')[0]
    fireEvent.click(saveBtn)
    expect(onAddPreset).toHaveBeenCalled()
    expect(onAddPreset.mock.calls[0][0]).toBe('STAGING')
    expect(screen.queryByPlaceholderText('e.g. PROD_GOOGLE')).toBeNull()
  })

  it('captures preset field values and toggles cancel', () => {
    const onAddPreset = vi.fn()
    render(<OAuthProviderTable {...baseProps} onAddPreset={onAddPreset} />)
    fireEvent.click(screen.getByText('New_Preset'))
    fireEvent.change(screen.getByPlaceholderText('e.g. PROD_GOOGLE'), {
      target: { value: 'PROD' },
    })

    const allInputs = screen
      .getAllByRole('textbox')
      .filter((input) => (input as HTMLInputElement).type === 'text')
    fireEvent.change(allInputs[1], { target: { value: 'My Google' } })
    fireEvent.change(allInputs[2], { target: { value: 'cid-123' } })
    fireEvent.change(allInputs[3], { target: { value: 'https://auth' } })
    fireEvent.change(allInputs[4], { target: { value: 'https://validate' } })
    fireEvent.change(allInputs[5], { target: { value: 'profile email' } })
    fireEvent.change(allInputs[6], { target: { value: 'fa fa-google' } })
    fireEvent.change(allInputs[7], { target: { value: 'Sign in' } })
    const sequenceInput = screen
      .getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).type === 'number') as HTMLInputElement
    fireEvent.change(sequenceInput, { target: { value: '15' } })
    fireEvent.change(sequenceInput, { target: { value: '' } })
    fireEvent.change(sequenceInput, { target: { value: '20' } })
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)

    fireEvent.click(screen.getAllByText('Save_Preset')[0])
    expect(onAddPreset).toHaveBeenCalledWith('PROD', {
      name: 'My Google',
      client_id: 'cid-123',
      auth_endpoint: 'https://auth',
      validation_endpoint: 'https://validate',
      scope: 'profile email',
      css_class: 'fa fa-google',
      body: 'Sign in',
      sequence: 20,
      enabled: true,
    })

    fireEvent.click(screen.getByText('New_Preset'))
    const cancelButtons = screen.getAllByText('Cancel')
    fireEvent.click(cancelButtons[cancelButtons.length - 1])
    expect(screen.queryByPlaceholderText('e.g. PROD_GOOGLE')).toBeNull()
  })

  it('ignores empty label submissions in inline form', () => {
    const onAddPreset = vi.fn()
    render(<OAuthProviderTable {...baseProps} onAddPreset={onAddPreset} />)
    fireEvent.click(screen.getByText('New_Preset'))
    const saveBtn = (
      screen.getAllByText('Save_Preset')[0] as HTMLElement
    ).closest('button') as HTMLButtonElement
    expect(saveBtn.disabled).toBe(true)
    fireEvent.submit(saveBtn.closest('form') as HTMLFormElement)
    expect(onAddPreset).not.toHaveBeenCalled()
  })

  it('shows a preview popover with the preset uuid and values', () => {
    const presets: OAuthProviderPreset[] = [
      {
        id: 'uuid-1234',
        label: 'PROD',
        values: {
          client_id: 'cid-xyz',
          enabled: true,
          scope: 'profile email',
          sequence: 5,
        },
      },
    ]
    render(<OAuthProviderTable {...baseProps} presets={presets} />)
    fireEvent.click(screen.getByLabelText('Preview preset PROD'))
    expect(screen.getByText('UUID · uuid-1234')).toBeDefined()
    expect(screen.getByText('cid-xyz')).toBeDefined()
    expect(screen.getByText('true')).toBeDefined()
    expect(screen.getByText('profile email')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('edits an existing preset from the chip', () => {
    const presets: OAuthProviderPreset[] = [
      {
        id: 'p1',
        label: 'PROD',
        values: { client_id: 'old-id', scope: 'profile' },
      },
    ]
    const onUpdatePreset = vi.fn()
    const onAddPreset = vi.fn()
    render(
      <OAuthProviderTable
        {...baseProps}
        presets={presets}
        onUpdatePreset={onUpdatePreset}
        onAddPreset={onAddPreset}
      />,
    )
    fireEvent.click(screen.getByLabelText('Edit preset PROD'))
    expect(screen.getByText('Edit_Preset')).toBeDefined()
    const labelInput = screen.getByDisplayValue('PROD') as HTMLInputElement
    fireEvent.change(labelInput, { target: { value: 'PROD_V2' } })
    const clientInput = screen.getByDisplayValue('old-id') as HTMLInputElement
    fireEvent.change(clientInput, { target: { value: 'new-id' } })
    fireEvent.click(screen.getByText('Update_Preset'))
    expect(onUpdatePreset).toHaveBeenCalledWith('p1', 'PROD_V2', {
      client_id: 'new-id',
      scope: 'profile',
    })
    expect(onAddPreset).not.toHaveBeenCalled()
    expect(screen.queryByText('Edit_Preset')).toBeNull()
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

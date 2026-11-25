import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mt5Messages } from '~/features/mt5-connection/composables/messages'
import {
  BRIDGE_ERROR_CODES, bridgeErrorKey, bridgeStatusBadge, resolveBridgeApiUrl, saveFile,
} from '~/features/mt5-connection/composables/bridgeView'

const root = join(__dirname, '..', '..', '..')
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf-8')
const component = (name: string) => read('features', 'mt5-connection', 'components', `${name}.vue`)

describe('dev proxy', () => {
  it('forwards /api/v1/mt5-bridge to NUXT_BRIDGE_URL (default 8005)', () => {
    const config = read('nuxt.config.ts')
    expect(config).toContain(
      "'/api/v1/mt5-bridge': { target: `${process.env.NUXT_BRIDGE_URL || 'http://localhost:8005'}/api/v1/mt5-bridge`, changeOrigin: true }",
    )
  })
  it('documents NUXT_BRIDGE_URL', () => {
    for (const doc of [['docs', 'README.md'], ['docs', 'architecture.md'], ['AGENTS.md']]) {
      expect(read(...doc), doc.join('/')).toContain('NUXT_BRIDGE_URL')
    }
  })
})

describe('bridge view helpers', () => {
  it('whitelist URL is the API origin, or the app origin when the API is same-origin', () => {
    expect(resolveBridgeApiUrl('', 'http://localhost:3000')).toBe('http://localhost:3000')
    expect(resolveBridgeApiUrl('https://api.example.com/', 'http://localhost:3000')).toBe('https://api.example.com')
    expect(resolveBridgeApiUrl('https://api.example.com/base', 'x')).toBe('https://api.example.com')
    expect(resolveBridgeApiUrl('/backend', 'http://localhost:3000')).toBe('http://localhost:3000')
    expect(resolveBridgeApiUrl('/backend/', 'http://localhost:3000/')).toBe('http://localhost:3000')
    expect(resolveBridgeApiUrl('http://localhost:8005/', 'http://localhost:3000')).toBe('http://localhost:8005')
    expect(resolveBridgeApiUrl('  ', 'http://localhost:3000')).toBe('http://localhost:3000')
  })
  it('maps every known error code to a key in en and es, with a generic fallback', () => {
    expect(BRIDGE_ERROR_CODES).toEqual(expect.arrayContaining(['INVALID_TOKEN_NAME', 'NOT_FOUND', 'NETWORK_ERROR', 'UNAUTHENTICATED']))
    for (const code of [...BRIDGE_ERROR_CODES, 'WHATEVER', null]) {
      const key = bridgeErrorKey(code)
      expect(mt5Messages.en[key], `${code} en`).toBeTruthy()
      expect(mt5Messages.es[key], `${code} es`).toBeTruthy()
    }
    expect(bridgeErrorKey('WHATEVER')).toBe('mt5b.errors.generic')
  })
  it('status badge', () => {
    expect(bridgeStatusBadge('connected')).toEqual({ variant: 'success', key: 'mt5b.accounts.connected' })
    expect(bridgeStatusBadge('disconnected')).toEqual({ variant: 'danger', key: 'mt5b.accounts.disconnected' })
  })
  it('saves a blob through a temporary link and releases the URL', () => {
    const create = vi.fn(() => 'blob:x')
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    saveFile(new Blob(['x']), 'TradingJournalBridge.ex5')
    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:x')
    expect(document.querySelector('a[download]')).toBeNull()
    vi.unstubAllGlobals()
  })
  it('every mt5b key exists in en and es and the setup guide names the whitelist path', () => {
    const enKeys = Object.keys(mt5Messages.en).filter((k) => k.startsWith('mt5b.'))
    expect(enKeys.length).toBeGreaterThan(20)
    expect(mt5Messages.en['mt5b.setup.step_whitelist']).toContain('Tools > Options > Expert Advisors')
    expect(mt5Messages.en['mt5b.setup.step_whitelist']).toContain('Allow WebRequest')
  })
})

describe('bridge components (source level: .vue is not mounted in this vitest config)', () => {
  it('token panel confirms revocation and shows the plaintext in a copy-once modal', () => {
    const panel = component('Mt5BridgeTokenPanel')
    expect(panel).toContain('<AppConfirmDeleteModal')
    expect(panel).toContain('<Mt5BridgeTokenModal')
    const modal = component('Mt5BridgeTokenModal')
    expect(modal).toContain('<AppModal')
    expect(modal).toContain('navigator.clipboard')
    expect(modal).toContain('dismissCreatedToken')
    // navigating away with the modal open must not leave the plaintext in the store
    expect(modal).toMatch(/onBeforeUnmount\(\(\) => dismissCreatedToken\(\)\)/)
    expect(modal).toContain(':close-on-backdrop="false"')
  })
  it('EA download shows an explicit unavailable state', () => {
    const ea = component('Mt5BridgeEaDownload')
    expect(ea).toContain('eaUnavailable')
    expect(ea).toContain("t('mt5b.ea.unavailable_title')")
    expect(ea).toContain('saveFile')
  })
  it('accounts list has skeleton, error with retry, empty state with setup steps, and status fields', () => {
    const list = component('Mt5BridgeAccountList')
    expect(list).toContain('<AppSkeleton')
    expect(list).toContain('<AppEmptyState')
    expect(list).toContain('<Mt5BridgeSetupSteps')
    expect(list).toContain('accountsError')
    expect(list).toContain('lastHeartbeat')
    expect(list).toContain('lastDealAt')
    const steps = component('Mt5BridgeSetupSteps')
    expect(steps).toContain("t('mt5b.setup.step_whitelist')")
    expect(steps).toContain('resolveBridgeApiUrl')
  })
  it('the bridge panel is not gated by role; the legacy terminal link stays admin-only and separate', () => {
    const bridge = component('Mt5BridgePanel')
    expect(bridge).not.toMatch(/role|admin|resolveMt5View/)
    expect(component('Mt5ConnectionPanel')).toContain('resolveMt5View')
    const page = read('pages', 'mt5.vue')
    expect(page).toContain('<Mt5BridgePanel')
    expect(page).toContain('<Mt5ConnectionPanel')
    expect(page.indexOf('<Mt5BridgePanel')).toBeLessThan(page.indexOf('<Mt5ConnectionPanel'))
    expect(page).toContain("t('mt5b.legacy.title')")
  })
  it('never persists the plaintext token', () => {
    const sources = ['stores/mt5Bridge.ts', 'composables/bridgeView.ts', 'api/bridge.ts']
      .map((f) => read('features', 'mt5-connection', f))
      .concat(['Mt5BridgeTokenModal', 'Mt5BridgeTokenPanel'].map(component))
    for (const src of sources) expect(src).not.toMatch(/localStorage|sessionStorage/)
  })
})

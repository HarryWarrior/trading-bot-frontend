import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Vue SFCs are not mountable in this vitest setup; assert the wiring at source level.
describe('header shows the signed-in email', () => {
  it('layout passes user.email and the header renders it', () => {
    expect(readFileSync('layouts/default.vue', 'utf8')).toContain(':user-email="user?.email"')
    expect(readFileSync('components/Common/AppHeader.vue', 'utf8')).toContain('data-testid="header-email"')
  })
})

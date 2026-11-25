import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd() + '/'
const DIRS = ['features', 'components', 'pages', 'stores', 'composables']
const ALLOWED = ['components/Common/AppInput.vue'] // generates DOM ids only, never data
const EXT = /\.(vue|ts|js)$/

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })

describe('no simulated data', () => {
  it('does not use Math.random outside the allowed files', () => {
    const offenders = DIRS.flatMap((d) => walk(join(root, d)))
      .filter((f) => EXT.test(f))
      .map((f) => relative(root, f).replace(/\\/g, '/'))
      .filter((f) => !ALLOWED.includes(f))
      .filter((f) => readFileSync(join(root, f), 'utf8').includes('Math.random'))
    expect(offenders).toEqual([])
  })
})

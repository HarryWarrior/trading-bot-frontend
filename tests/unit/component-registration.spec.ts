import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '..', '..')

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

describe('shared component registration', () => {
  it('registers components/Common without a path prefix so <AppX> resolves', () => {
    const config = readFileSync(join(root, 'nuxt.config.ts'), 'utf-8')
    expect(config).toMatch(/path:\s*'~\/components\/Common',\s*pathPrefix:\s*false/)
  })

  it('every <AppX> used in templates exists in components/Common', () => {
    const common = new Set(readdirSync(join(root, 'components', 'Common')).map((f) => f.replace('.vue', '')))
    const sources = ['pages', 'layouts', 'features', 'components'].flatMap((d) => walk(join(root, d))).filter((f) => f.endsWith('.vue'))
    const unknown: string[] = []
    for (const file of sources) {
      for (const match of readFileSync(file, 'utf-8').matchAll(/<(App[A-Z][A-Za-z]+)/g)) {
        if (!common.has(match[1])) unknown.push(`${file}: ${match[1]}`)
      }
    }
    expect(unknown).toEqual([])
  })
})

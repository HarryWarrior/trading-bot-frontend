import { describe, expect, it } from 'vitest'
import { uploadErrorKey, validateUploadFile, MAX_UPLOAD_BYTES } from '~/features/journal/composables/uploadErrors'

describe('uploadErrorKey', () => {
  it.each([
    ['DUPLICATE_IMPORT', 'journal.upload.errors.duplicate'],
    ['UNSUPPORTED_FILE', 'journal.upload.errors.unsupported'],
    ['FILE_TOO_LARGE', 'journal.upload.errors.too_large'],
    ['UNREADABLE_REPORT', 'journal.upload.errors.unreadable'],
    ['NETWORK_ERROR', 'journal.errors.network'],
  ])('%s -> %s', (code, key) => {
    expect(uploadErrorKey(code)).toBe(key)
  })

  it('falls back to a generic message', () => {
    expect(uploadErrorKey('WHATEVER')).toBe('journal.errors.generic')
    expect(uploadErrorKey(null)).toBe('journal.errors.generic')
  })
})

describe('validateUploadFile', () => {
  it('accepts csv, xlsx and xls (case-insensitive)', () => {
    for (const name of ['a.csv', 'B.XLSX', 'c.xls']) {
      expect(validateUploadFile({ name, size: 100 })).toEqual({ ok: true })
    }
  })

  it('rejects other extensions', () => {
    expect(validateUploadFile({ name: 'a.pdf', size: 100 })).toEqual({ ok: false, code: 'UNSUPPORTED_FILE' })
  })

  it('rejects files over 10 MB but allows exactly 10 MB', () => {
    expect(validateUploadFile({ name: 'a.csv', size: MAX_UPLOAD_BYTES })).toEqual({ ok: true })
    expect(validateUploadFile({ name: 'a.csv', size: MAX_UPLOAD_BYTES + 1 })).toEqual({ ok: false, code: 'FILE_TOO_LARGE' })
  })
})

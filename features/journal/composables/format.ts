export const UPLOAD_ACCOUNT_REF = 'upload'

const isBlank = (value: number | null | undefined): value is null | undefined =>
  value === null || value === undefined || Number.isNaN(value)

/** Signed money, 2 dp: "+12.30", "−5.00"; null/NaN gives "—". */
export const formatMoney = (value: number | null | undefined): string => {
  if (isBlank(value)) return '—'
  const abs = Math.abs(value).toFixed(2)
  if (Number(abs) === 0) return abs
  return `${value > 0 ? '+' : '−'}${abs}`
}

export const pnlClass = (value: number | null | undefined): string => {
  if (isBlank(value) || Number(Math.abs(value).toFixed(2)) === 0) return 'text-zinc-500 dark:text-zinc-400'
  return value > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
}

/** Flat-CSV uploads use the account ref "upload" and are shown as "Uploaded files". */
export const isUploadAccount = (accountRef: string): boolean => accountRef === UPLOAD_ACCOUNT_REF

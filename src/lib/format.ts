export const nf = new Intl.NumberFormat('en-GB')

export function sparks(n: number): string {
  return nf.format(n)
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function dateWithYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function timeRange(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  const s = new Date(startIso).toLocaleTimeString('en-GB', opts)
  const e = new Date(endIso).toLocaleTimeString('en-GB', opts)
  return `${s}–${e}`
}

export function relativeDays(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const days = Math.round((d.getTime() - now.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 1 && days < 7) return `In ${days} days`
  if (days < 0) return `${Math.abs(days)} days ago`
  return dateWithYear(iso)
}

export function initials(first: string, last: string): string {
  return (first[0] ?? '') + (last[0] ?? '')
}

export function yearsOfService(startIso: string, now = new Date()): number {
  const start = new Date(startIso)
  let years = now.getUTCFullYear() - start.getUTCFullYear()
  const anniv = new Date(
    Date.UTC(now.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  )
  if (now < anniv) years -= 1
  return Math.max(0, years)
}

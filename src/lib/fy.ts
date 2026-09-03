// Chickpea's financial year runs August → July (matches the group's other
// dashboards). These helpers bucket spark awards by month and by financial year.

export interface Period {
  key: string
  label: string
  /** inclusive ISO date */
  from: string
  /** exclusive ISO date */
  toExclusive: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function financialYearStart(d: Date): Date {
  const y = d.getUTCFullYear()
  const start = new Date(Date.UTC(y, 7, 1)) // 1 Aug this calendar year
  if (d < start) return new Date(Date.UTC(y - 1, 7, 1))
  return start
}

export function currentMonthPeriod(now = new Date()): Period {
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const from = new Date(Date.UTC(y, m, 1))
  const to = new Date(Date.UTC(y, m + 1, 1))
  return {
    key: `m-${y}-${m + 1}`,
    label: `${MONTHS[m]} ${y}`,
    from: from.toISOString().slice(0, 10),
    toExclusive: to.toISOString().slice(0, 10),
  }
}

export function currentFinancialYearPeriod(now = new Date()): Period {
  const start = financialYearStart(now)
  const end = new Date(Date.UTC(start.getUTCFullYear() + 1, 7, 1))
  const endYr = end.getUTCFullYear()
  return {
    key: `fy-${start.getUTCFullYear()}`,
    label: `FY ${start.getUTCFullYear()}–${String(endYr).slice(2)}`,
    from: start.toISOString().slice(0, 10),
    toExclusive: end.toISOString().slice(0, 10),
  }
}

export function inPeriod(isoDate: string, period: Period): boolean {
  return isoDate >= period.from && isoDate < period.toExclusive
}

import type { PillarKey, SparkAward } from '../types'
import { GUILDS, MEMBERS, guildById } from '../data/seed'
import { inPeriod, type Period } from './fy'

export interface GuildStanding {
  guildId: string
  total: number
  byPillar: Record<PillarKey, number>
  rank: number
}

export interface MemberStanding {
  memberId: string
  guildId: string
  total: number
  rank: number
}

const ZERO: Record<PillarKey, number> = {
  people: 0,
  content: 0,
  environment: 0,
  engagement: 0,
}

/** Approved awards that fall within the given period. */
export function approvedInPeriod(awards: SparkAward[], period: Period): SparkAward[] {
  return awards.filter((a) => a.status === 'approved' && inPeriod(a.occurredOn, period))
}

export function guildStandings(awards: SparkAward[], period: Period): GuildStanding[] {
  const rows = new Map<string, GuildStanding>()
  for (const g of GUILDS) {
    rows.set(g.id, { guildId: g.id, total: 0, byPillar: { ...ZERO }, rank: 0 })
  }
  for (const a of approvedInPeriod(awards, period)) {
    const row = rows.get(a.guildId)
    if (!row) continue
    row.total += a.points
    row.byPillar[a.pillar] += a.points
  }
  const sorted = [...rows.values()].sort((x, y) => y.total - x.total)
  sorted.forEach((r, i) => (r.rank = i + 1))
  return sorted
}

export function memberStandings(
  awards: SparkAward[],
  period: Period,
  limit = 10,
): MemberStanding[] {
  const totals = new Map<string, number>()
  for (const a of approvedInPeriod(awards, period)) {
    totals.set(a.memberId, (totals.get(a.memberId) ?? 0) + a.points)
  }
  const sorted = [...totals.entries()]
    .map(([memberId, total]) => ({
      memberId,
      total,
      guildId: MEMBERS.find((m) => m.id === memberId)?.guildId ?? '',
      rank: 0,
    }))
    .sort((x, y) => y.total - x.total)
  sorted.forEach((r, i) => (r.rank = i + 1))
  return sorted.slice(0, limit)
}

export function memberTotal(
  awards: SparkAward[],
  memberId: string,
  period: Period,
): number {
  return approvedInPeriod(awards, period)
    .filter((a) => a.memberId === memberId)
    .reduce((sum, a) => sum + a.points, 0)
}

export function guildLabel(guildId: string): string {
  const g = guildById(guildId)
  return g ? g.nickname : '—'
}

import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { PILLARS, guildById, memberName, pillarByKey } from '../data/seed'
import type { PillarKey } from '../types'
import { currentFinancialYearPeriod, currentMonthPeriod } from '../lib/fy'
import { guildStandings, memberStandings } from '../lib/standings'
import { sparks } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { GuildCrest } from '../components/GuildCrest'
import { Card, PageHeading, SectionTitle, Toggle } from '../components/ui'

type PeriodChoice = 'month' | 'fy'
type ViewChoice = 'guilds' | 'people'
const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard() {
  const { user } = useAuth()
  const { awards } = useStore()
  const [periodChoice, setPeriodChoice] = useState<PeriodChoice>('month')
  const [view, setView] = useState<ViewChoice>('guilds')

  const month = useMemo(() => currentMonthPeriod(), [])
  const fy = useMemo(() => currentFinancialYearPeriod(), [])
  const period = periodChoice === 'month' ? month : fy

  const standings = guildStandings(awards, period)
  const people = memberStandings(awards, period, 20)
  const maxTotal = standings[0]?.total || 1

  return (
    <div className="rise space-y-5">
      <PageHeading title="Leaderboard" sub={period.label} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="sm:w-64">
          <Toggle
            options={[
              { key: 'month', label: 'This month' },
              { key: 'fy', label: 'Financial year' },
            ]}
            value={periodChoice}
            onChange={(v) => setPeriodChoice(v as PeriodChoice)}
          />
        </div>
        <div className="sm:w-48">
          <Toggle
            options={[
              { key: 'guilds', label: 'Guilds' },
              { key: 'people', label: 'People' },
            ]}
            value={view}
            onChange={(v) => setView(v as ViewChoice)}
          />
        </div>
      </div>

      {view === 'guilds' ? (
        <>
          <Card className="divide-y divide-line-soft">
            {standings.map((s) => {
              const g = guildById(s.guildId)
              const isMine = user?.guildId === s.guildId
              return (
                <div key={s.guildId} className={`px-4 py-3.5 ${isMine ? 'bg-maroon-wash/50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="figure w-6 text-center text-base text-ink-faint">{s.rank}</span>
                    <GuildCrest guildId={s.guildId} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-tight">{g.nickname}</p>
                      <p className="text-[11px] text-ink-faint">{g.name}</p>
                    </div>
                    <span className="figure text-lg">{sparks(s.total)}</span>
                  </div>
                  <StackedPillarBar byPillar={s.byPillar} max={maxTotal} />
                </div>
              )
            })}
          </Card>

          <div className="flex flex-wrap gap-x-4 gap-y-1 px-0.5">
            {PILLARS.map((p) => (
              <span key={p.key} className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.colour }} />
                {p.name}
              </span>
            ))}
          </div>

          <section>
            <SectionTitle>Pillar leaders</SectionTitle>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {PILLARS.map((p) => {
                const top = [...standings].sort(
                  (a, b) => b.byPillar[p.key] - a.byPillar[p.key],
                )[0]
                return (
                  <Card key={p.key} className="p-3.5">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{ color: p.colour }}
                    >
                      {p.name}
                    </p>
                    <p className="text-[11px] text-ink-faint">{p.cupAward}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <GuildCrest guildId={top.guildId} size="sm" />
                      <span className="flex-1 truncate text-xs font-semibold">
                        {guildById(top.guildId).nickname}
                      </span>
                      <span className="figure text-xs">{sparks(top.byPillar[p.key])}</span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {[people.slice(0, 10), people.slice(10, 20)].map((half, col) =>
              half.length === 0 ? null : (
                <Card key={col} className="divide-y divide-line-soft">
                  {half.map((m) => {
                    const rank = people.indexOf(m)
                    const isMe = m.memberId === user?.id
                    return (
                      <div
                        key={m.memberId}
                        className={`flex items-center gap-3 px-4 py-2.5 ${
                          isMe ? 'bg-maroon-wash/50' : ''
                        }`}
                      >
                        <span className="figure w-6 text-center text-sm text-ink-faint">
                          {rank < 3 ? MEDALS[rank] : rank + 1}
                        </span>
                        <Avatar memberId={m.memberId} size="sm" />
                        <span className="flex-1 text-sm">
                          <span className="font-semibold">{memberName(m.memberId)}</span>
                          <span className="block text-xs text-ink-faint">
                            {guildById(m.guildId).nickname}
                          </span>
                        </span>
                        <span className="figure text-sm">{sparks(m.total)}</span>
                      </div>
                    )
                  })}
                </Card>
              ),
            )}
          </div>
          <p className="px-0.5 text-xs text-ink-soft">
            {periodChoice === 'month'
              ? 'Leads the Bright Spark award this month.'
              : 'Leads the Brightest Spark award and a guaranteed Dream Team place.'}
          </p>
        </>
      )}
    </div>
  )
}

function StackedPillarBar({
  byPillar,
  max,
}: {
  byPillar: Record<PillarKey, number>
  max: number
}) {
  const total = PILLARS.reduce((s, p) => s + byPillar[p.key], 0)
  const widthPct = max > 0 ? (total / max) * 100 : 0
  return (
    <div className="mt-2.5 flex h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
      <div className="flex h-full" style={{ width: `${Math.max(2, widthPct)}%` }}>
        {PILLARS.map((p) => {
          const seg = total > 0 ? (byPillar[p.key] / total) * 100 : 0
          if (seg === 0) return null
          return (
            <div
              key={p.key}
              className="h-full"
              style={{ width: `${seg}%`, backgroundColor: pillarByKey(p.key).colour }}
            />
          )
        })}
      </div>
    </div>
  )
}

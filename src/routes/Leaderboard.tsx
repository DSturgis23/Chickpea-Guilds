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
import { Card, SectionTitle } from '../components/ui'

type PeriodChoice = 'month' | 'fy'
type ViewChoice = 'guilds' | 'people'

export function Leaderboard() {
  const { user } = useAuth()
  const { awards } = useStore()
  const [periodChoice, setPeriodChoice] = useState<PeriodChoice>('month')
  const [view, setView] = useState<ViewChoice>('guilds')

  const month = useMemo(() => currentMonthPeriod(), [])
  const fy = useMemo(() => currentFinancialYearPeriod(), [])
  const period = periodChoice === 'month' ? month : fy

  const standings = guildStandings(awards, period)
  const people = memberStandings(awards, period, 15)
  const maxTotal = standings[0]?.total || 1

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <p className="text-sm text-ink-soft">{period.label}</p>
      </div>

      <div className="flex gap-2">
        <Toggle
          options={[
            { key: 'month', label: 'This month' },
            { key: 'fy', label: 'Financial year' },
          ]}
          value={periodChoice}
          onChange={(v) => setPeriodChoice(v as PeriodChoice)}
        />
      </div>
      <div className="flex gap-2">
        <Toggle
          options={[
            { key: 'guilds', label: 'Guilds' },
            { key: 'people', label: 'People' },
          ]}
          value={view}
          onChange={(v) => setView(v as ViewChoice)}
        />
      </div>

      {view === 'guilds' ? (
        <>
          <Card className="divide-y divide-line">
            {standings.map((s) => {
              const g = guildById(s.guildId)
              const isMine = user?.guildId === s.guildId
              return (
                <div key={s.guildId} className={`px-4 py-3 ${isMine ? 'bg-maroon-soft/40' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-base font-black text-ink-soft">
                      {s.rank}
                    </span>
                    <GuildCrest guildId={s.guildId} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-tight">{g.nickname}</p>
                      <p className="text-[11px] text-ink-soft">{g.name}</p>
                    </div>
                    <span className="text-base font-black">{sparks(s.total)}</span>
                  </div>
                  <StackedPillarBar byPillar={s.byPillar} max={maxTotal} />
                </div>
              )
            })}
          </Card>

          <section>
            <SectionTitle>Pillar leaders</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {PILLARS.map((p) => {
                const ranked = [...standings].sort(
                  (a, b) => b.byPillar[p.key] - a.byPillar[p.key],
                )
                const top = ranked[0]
                return (
                  <Card key={p.key} className="p-3">
                    <p
                      className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: p.colour }}
                    >
                      {p.name}
                    </p>
                    <p className="text-[11px] text-ink-soft">{p.cupAward}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <GuildCrest guildId={top.guildId} size="sm" />
                      <span className="flex-1 text-xs font-semibold">
                        {guildById(top.guildId).nickname}
                      </span>
                      <span className="text-xs font-bold">
                        {sparks(top.byPillar[p.key])}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <Card className="divide-y divide-line">
            {people.map((m, i) => {
              const isMe = m.memberId === user?.id
              return (
                <div
                  key={m.memberId}
                  className={`flex items-center gap-3 px-4 py-2.5 ${
                    isMe ? 'bg-maroon-soft/40' : ''
                  }`}
                >
                  <span className="w-6 text-center text-sm font-black text-ink-soft">
                    {i < 3 ? MEDALS[i] : i + 1}
                  </span>
                  <Avatar memberId={m.memberId} size="sm" />
                  <span className="flex-1 text-sm">
                    <span className="font-semibold">{memberName(m.memberId)}</span>
                    <span className="block text-xs text-ink-soft">
                      {guildById(m.guildId).nickname}
                    </span>
                  </span>
                  <span className="text-sm font-bold">{sparks(m.total)}</span>
                </div>
              )
            })}
          </Card>
          <p className="px-1 text-xs text-ink-soft">
            {periodChoice === 'month'
              ? 'Leads the Bright Spark award this month.'
              : 'Leads the Brightest Spark award and a guaranteed Dream Team place.'}
          </p>
        </>
      )}
    </div>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

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
    <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-paper-2">
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

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex w-full rounded-xl bg-paper-2 p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            value === o.key ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useStore } from '../../state/store'
import { GUILDS, PILLARS, guildById, memberName } from '../../data/seed'
import { currentFinancialYearPeriod, currentMonthPeriod } from '../../lib/fy'
import {
  approvedInPeriod,
  guildStandings,
  memberStandings,
} from '../../lib/standings'
import { sparks } from '../../lib/format'
import { Bar, Card, SectionTitle } from '../../components/ui'
import { GuildCrest } from '../../components/GuildCrest'
import { BackHeader } from '../../components/BackHeader'

export function Reports() {
  const { awards } = useStore()
  const [scope, setScope] = useState<'month' | 'fy'>('fy')
  const month = useMemo(() => currentMonthPeriod(), [])
  const fy = useMemo(() => currentFinancialYearPeriod(), [])
  const period = scope === 'month' ? month : fy

  const standings = guildStandings(awards, period)
  const top = memberStandings(awards, period, 5)
  const rows = approvedInPeriod(awards, period)
  const totalSparks = rows.reduce((s, a) => s + a.points, 0)
  const maxTotal = standings[0]?.total || 1

  const pillarTotals = PILLARS.map((p) => ({
    ...p,
    total: rows.filter((a) => a.pillar === p.key).reduce((s, a) => s + a.points, 0),
  }))

  return (
    <div className="space-y-5">
      <BackHeader title="Reports" to="/more" />

      <div className="flex w-full rounded-xl bg-paper-2 p-1">
        {(['month', 'fy'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
              scope === s ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
            }`}
          >
            {s === 'month' ? month.label : fy.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Sparks awarded" value={sparks(totalSparks)} />
        <Stat label="Nominations" value={sparks(rows.length)} />
        <Stat
          label="Pending"
          value={sparks(awards.filter((a) => a.status === 'pending').length)}
        />
      </div>

      <section>
        <SectionTitle>Guild totals</SectionTitle>
        <Card className="divide-y divide-line">
          {standings.map((s) => (
            <div key={s.guildId} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-bold text-ink-soft">
                  {s.rank}
                </span>
                <GuildCrest guildId={s.guildId} size="sm" />
                <span className="flex-1 text-sm font-semibold">
                  {guildById(s.guildId).nickname}
                </span>
                <span className="text-sm font-bold">{sparks(s.total)}</span>
              </div>
              <div className="mt-2 pl-8">
                <Bar value={s.total} max={maxTotal} colour={guildById(s.guildId).colour} />
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <SectionTitle>Sparks by pillar</SectionTitle>
        <Card className="space-y-3 p-4">
          {pillarTotals.map((p) => (
            <div key={p.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold" style={{ color: p.colour }}>
                  {p.name}
                </span>
                <span className="font-bold">{sparks(p.total)}</span>
              </div>
              <Bar value={p.total} max={totalSparks || 1} colour={p.colour} />
            </div>
          ))}
        </Card>
      </section>

      <section>
        <SectionTitle>Top individuals</SectionTitle>
        <Card className="divide-y divide-line">
          {top.map((m, i) => (
            <div key={m.memberId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-5 text-center text-sm font-bold text-ink-soft">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-semibold">
                {memberName(m.memberId)}
              </span>
              <span className="text-xs text-ink-soft">
                {guildById(m.guildId).nickname}
              </span>
              <span className="text-sm font-bold">{sparks(m.total)}</span>
            </div>
          ))}
        </Card>
      </section>

      <button
        onClick={() => exportCsv(rows)}
        className="w-full rounded-xl bg-paper-2 py-3 text-sm font-semibold text-ink active:bg-line"
      >
        Export nominations (CSV)
      </button>
      <p className="text-center text-[11px] text-ink-soft">
        {GUILDS.length} guilds · {PILLARS.length} pillars · financial year Aug–Jul
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-lg font-black">{value}</p>
      <p className="text-[11px] leading-tight text-ink-soft">{label}</p>
    </Card>
  )
}

function exportCsv(rows: ReturnType<typeof approvedInPeriod>) {
  const header = 'date,member,guild,pillar,points,note\n'
  const body = rows
    .map(
      (a) =>
        `${a.occurredOn},"${memberName(a.memberId)}",${guildById(a.guildId).nickname},${
          a.pillar
        },${a.points},"${a.note.replace(/"/g, '""')}"`,
    )
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'guild-nominations.csv'
  link.click()
  URL.revokeObjectURL(url)
}

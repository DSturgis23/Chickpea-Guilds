import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, ChevronRight, Flame, Sparkles } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { EVENTS, guildById, memberName } from '../data/seed'
import { currentFinancialYearPeriod, currentMonthPeriod } from '../lib/fy'
import { guildStandings, memberStandings, memberTotal } from '../lib/standings'
import { relativeDays, shortDate, sparks } from '../lib/format'
import { useCountUp } from '../lib/useCountUp'
import { Avatar } from '../components/Avatar'
import { GuildCrest } from '../components/GuildCrest'
import { Card, SectionTitle } from '../components/ui'

export function Home() {
  const { user } = useAuth()
  const { awards } = useStore()
  const month = useMemo(() => currentMonthPeriod(), [])
  const fy = useMemo(() => currentFinancialYearPeriod(), [])
  if (!user) return null

  const standings = guildStandings(awards, month)
  const leader = standings[0]
  const myGuild = standings.find((s) => s.guildId === user.guildId)!
  const brightSparks = memberStandings(awards, month, 6)
  const myMonth = memberTotal(awards, user.id, month)
  const myFy = memberTotal(awards, user.id, fy)
  const nextEvents = [...EVENTS].sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 3)
  const guild = guildById(user.guildId)
  const monthShort = month.label.split(' ')[0]

  return (
    <div className="space-y-6 md:space-y-7">
      <div className="rise">
        <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-[30px]">
          {greeting()}, {user.firstName}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
          <Flame size={14} className="text-ember" />
          {month.label} · your guild is fighting for the {monthShort} Bright Spark
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
        <GuildHero
          className="rise rise-1 md:col-span-7"
          guildId={guild.id}
          rank={myGuild.rank}
          total={myGuild.total}
          leaderTotal={leader.total}
          leaderName={guildById(leader.guildId).nickname}
          runnerUpTotal={standings[1]?.total ?? 0}
        />

        <div className="rise rise-2 grid grid-cols-2 gap-4 md:col-span-5 md:content-start md:gap-5">
          <StatTile label={`You · ${monthShort}`} value={myMonth} foot="sparks earned" />
          <StatTile label={`You · ${fy.label}`} value={myFy} foot="sparks earned" />
          <Link
            to="/nominate"
            className="group relative col-span-2 flex items-center gap-3 overflow-hidden rounded-[14px] border border-maroon-bright/40 bg-maroon px-4 py-4 text-ink shadow-[0_0_0_1px_rgba(240,200,126,0.1),0_14px_30px_-18px_rgba(168,31,56,0.8)] transition-colors hover:bg-maroon-bright"
          >
            <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-ember/25 blur-2xl" />
            <Sparkles size={22} className="shrink-0 text-gold-bright" />
            <span className="flex-1">
              <span className="block font-semibold">Nominate someone for sparks</span>
              <span className="block text-xs text-ink-soft">Caught brilliant work? Put it forward.</span>
            </span>
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Guild leaderboard */}
        <section className="rise rise-3 md:col-span-7">
          <SectionTitle
            action={
              <Link to="/leaderboard" className="text-xs font-semibold text-gold">
                Full table
              </Link>
            }
          >
            Guild standings · {monthShort}
          </SectionTitle>
          <Card className="divide-y divide-line-soft overflow-hidden">
            {standings.map((s) => {
              const g = guildById(s.guildId)
              const isMine = s.guildId === user.guildId
              return (
                <div
                  key={s.guildId}
                  className="relative flex items-center gap-3 px-4 py-3"
                  style={isMine ? { background: 'var(--color-maroon-wash)' } : undefined}
                >
                  {isMine && (
                    <span
                      className="absolute inset-y-0 left-0 w-[3px]"
                      style={{ backgroundColor: g.colour, boxShadow: `0 0 12px ${g.colour}` }}
                    />
                  )}
                  <span className="figure w-5 text-center text-sm text-ink-faint">{s.rank}</span>
                  <GuildCrest guildId={s.guildId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{g.nickname}</p>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-paper-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(3, (s.total / (leader.total || 1)) * 100)}%`,
                          backgroundImage: `linear-gradient(90deg, ${g.colour}77, ${g.colour})`,
                          boxShadow: `0 0 10px -1px ${g.colour}`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="figure text-sm">{sparks(s.total)}</span>
                </div>
              )
            })}
          </Card>
        </section>

        {/* Bright Spark race */}
        <section className="rise rise-3 md:col-span-5">
          <SectionTitle>Bright Spark race · {monthShort}</SectionTitle>
          <Card className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {brightSparks.slice(0, 3).map((m, i) => (
                <Podium key={m.memberId} memberId={m.memberId} total={m.total} place={i} />
              ))}
            </div>
            <div className="mt-2 divide-y divide-line-soft">
              {brightSparks.slice(3).map((m, i) => (
                <div key={m.memberId} className="flex items-center gap-3 px-1 py-2">
                  <span className="figure w-5 text-center text-xs text-ink-faint">{i + 4}</span>
                  <Avatar memberId={m.memberId} size="sm" />
                  <span className="flex-1 truncate text-sm">{memberName(m.memberId)}</span>
                  <span className="figure text-sm">{sparks(m.total)}</span>
                </div>
              ))}
            </div>
          </Card>
          <p className="mt-2 px-0.5 text-xs text-ink-faint">
            Top at month end wins Dinner, Bed &amp; Breakfast in a Chickpea pub.
          </p>
        </section>

        {/* Upcoming */}
        <section className="rise rise-4 md:col-span-12">
          <SectionTitle
            action={
              <Link to="/events" className="text-xs font-semibold text-gold">
                All events
              </Link>
            }
          >
            Coming up at the Guild Hall
          </SectionTitle>
          <div className="grid gap-2 md:grid-cols-3 md:gap-4">
            {nextEvents.map((ev) => (
              <Card key={ev.id} className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-paper-2 text-center">
                  <span className="text-[10px] font-bold uppercase text-gold">
                    {shortDate(ev.startsAt).split(' ')[1]}
                  </span>
                  <span className="figure text-base leading-none">
                    {shortDate(ev.startsAt).split(' ')[0]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{ev.title}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {relativeDays(ev.startsAt)} · {ev.location}
                  </p>
                </div>
                <CalendarDays size={16} className="shrink-0 text-ink-faint" />
              </Card>
            ))}
          </div>
        </section>
      </div>

      <p className="flex items-center justify-center gap-2 pt-1 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
        Friction <Dot /> Spark <Dot /> Allocation <Dot /> Recognition <Dot /> Celebration
      </p>
    </div>
  )
}

function GuildHero({
  guildId,
  rank,
  total,
  leaderTotal,
  leaderName,
  runnerUpTotal,
  className = '',
}: {
  guildId: string
  rank: number
  total: number
  leaderTotal: number
  leaderName: string
  runnerUpTotal: number
  className?: string
}) {
  const g = guildById(guildId)
  const shownTotal = useCountUp(total)
  const pct = Math.max(4, Math.round((total / (leaderTotal || 1)) * 100))
  const gap = rank === 1 ? total - runnerUpTotal : leaderTotal - total

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <span
        className="ember-pulse pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full blur-3xl"
        style={{ backgroundColor: `${g.colour}40` }}
      />
      <div className="relative flex items-start gap-4 p-5">
        <GuildCrest guildId={guildId} size="xl" glow />
        <div className="flex-1 pt-1">
          <p className="label" style={{ color: g.colour }}>
            Your guild
          </p>
          <p className="font-serif text-[26px] font-semibold leading-tight">{g.nickname}</p>
          <p className="text-xs text-ink-faint">
            {g.name} · “{g.motto}”
          </p>
        </div>
        <div className="text-right">
          <p className="figure text-4xl leading-none">
            {rank}
            <span className="text-lg text-ink-faint">/6</span>
          </p>
          <p className="label mt-1">this month</p>
        </div>
      </div>

      <div className="relative space-y-2 border-t border-line-soft px-5 py-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="figure text-lg">{sparks(shownTotal)}</span>
          <span className="text-ink-soft">
            {rank === 1 ? (
              <>
                <span className="text-gold">{sparks(gap)} clear</span> of the pack
              </>
            ) : (
              <>
                {sparks(gap)} behind <span className="text-ink">{leaderName}</span>
              </>
            )}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-2">
          <div
            className="heat-fill h-full rounded-full"
            style={{
              width: `${pct}%`,
              backgroundImage: `linear-gradient(90deg, ${g.colour}66, ${g.colour})`,
              boxShadow: `0 0 16px -1px ${g.colour}`,
            }}
          />
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
          <ArrowUpRight size={13} className="text-gold" />
          {rank === 1
            ? 'Hold the top of the forge to the month’s end.'
            : `Close the gap and ${leaderName} loses the lead.`}
        </p>
      </div>
    </Card>
  )
}

function StatTile({ label, value, foot }: { label: string; value: number; foot: string }) {
  const shown = useCountUp(value)
  return (
    <Card className="p-4">
      <p className="label">{label}</p>
      <p className="figure mt-1 text-[26px] text-gold-bright">{sparks(shown)}</p>
      <p className="text-xs text-ink-faint">{foot}</p>
    </Card>
  )
}

const PLACE = [
  { ring: '#eec87e', label: '1st' },
  { ring: '#c7c7c7', label: '2nd' },
  { ring: '#c98a46', label: '3rd' },
]

function Podium({ memberId, total, place }: { memberId: string; total: number; place: number }) {
  const p = PLACE[place]
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-lg border border-line bg-paper-2 px-1 py-3 text-center"
      style={place === 0 ? { boxShadow: `0 0 0 1px ${p.ring}55, 0 0 20px -6px ${p.ring}` } : undefined}
    >
      <span className="rounded-full p-[2px]" style={{ boxShadow: `0 0 0 2px ${p.ring}` }}>
        <Avatar memberId={memberId} size="sm" />
      </span>
      <span className="mt-0.5 truncate text-[11px] font-semibold" style={{ maxWidth: '5.5rem' }}>
        {memberName(memberId).split(' ')[0]}
      </span>
      <span className="figure text-xs" style={{ color: p.ring }}>
        {sparks(total)}
      </span>
    </div>
  )
}

function Dot() {
  return <span className="text-gold">◆</span>
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

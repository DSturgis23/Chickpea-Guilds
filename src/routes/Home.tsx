import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { EVENTS, GUILDS, guildById, memberName } from '../data/seed'
import { currentFinancialYearPeriod, currentMonthPeriod } from '../lib/fy'
import { guildStandings, memberStandings, memberTotal } from '../lib/standings'
import { relativeDays, shortDate, sparks } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { GuildCrest } from '../components/GuildCrest'
import { Bar, Card, SectionTitle } from '../components/ui'
import { IconChevron, IconSpark } from '../components/icons'

export function Home() {
  const { user } = useAuth()
  const { awards } = useStore()
  const month = useMemo(() => currentMonthPeriod(), [])
  const fy = useMemo(() => currentFinancialYearPeriod(), [])
  if (!user) return null

  const standings = guildStandings(awards, month)
  const leader = standings[0]
  const myGuild = standings.find((s) => s.guildId === user.guildId)!
  const myRank = myGuild.rank
  const brightSparks = memberStandings(awards, month, 5)
  const myMonth = memberTotal(awards, user.id, month)
  const myFy = memberTotal(awards, user.id, fy)
  const nextEvents = [...EVENTS]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3)
  const guild = guildById(user.guildId)
  const monthShort = month.label.split(' ')[0]

  return (
    <div className="rise space-y-5 md:space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-[28px]">
          {greeting()}, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{month.label} · every spark counts</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
        {/* Guild hero */}
        <Card className="overflow-hidden md:col-span-7">
          <div
            className="flex items-center gap-4 px-5 py-5 text-white"
            style={{ backgroundColor: guild.colour }}
          >
            <GuildCrest guildId={guild.id} size="lg" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-80">
                Your guild
              </p>
              <p className="font-serif text-2xl font-semibold leading-tight">{guild.nickname}</p>
              <p className="text-xs opacity-80">“{guild.motto}”</p>
            </div>
            <div className="text-right">
              <p className="figure text-3xl leading-none">#{myRank}</p>
              <p className="text-xs opacity-80">of {GUILDS.length}</p>
            </div>
          </div>
          <div className="space-y-2 px-5 py-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{sparks(myGuild.total)} sparks</span>
              <span className="text-ink-soft">
                {myRank === 1
                  ? `${sparks(myGuild.total - (standings[1]?.total ?? 0))} clear`
                  : `${sparks(leader.total - myGuild.total)} behind ${
                      guildById(leader.guildId).nickname
                    }`}
              </span>
            </div>
            <Bar value={myGuild.total} max={leader.total} colour={guild.colour} />
          </div>
        </Card>

        {/* Right rail */}
        <div className="grid grid-cols-2 gap-4 md:col-span-5 md:content-start md:gap-5">
          <Stat label={`You · ${monthShort}`} value={sparks(myMonth)} sub="sparks earned" />
          <Stat label={`You · ${fy.label}`} value={sparks(myFy)} sub="sparks earned" />
          <Link
            to="/nominate"
            className="col-span-2 flex items-center gap-3 rounded-xl bg-maroon px-4 py-4 text-white transition-colors hover:bg-maroon-dark"
          >
            <IconSpark width={24} height={24} />
            <span className="flex-1">
              <span className="block font-semibold">Nominate someone</span>
              <span className="block text-xs opacity-80">Put brilliant work forward.</span>
            </span>
            <IconChevron width={18} height={18} />
          </Link>
        </div>

        {/* Guild leaderboard */}
        <section className="md:col-span-7">
          <SectionTitle
            action={
              <Link to="/leaderboard" className="text-xs font-semibold text-maroon">
                Full table
              </Link>
            }
          >
            Guild leaderboard · {monthShort}
          </SectionTitle>
          <Card className="divide-y divide-line-soft">
            {standings.map((s) => {
              const g = guildById(s.guildId)
              const isMine = s.guildId === user.guildId
              return (
                <div
                  key={s.guildId}
                  className={`flex items-center gap-3 px-4 py-2.5 ${
                    isMine ? 'bg-maroon-wash/50' : ''
                  }`}
                >
                  <span className="figure w-5 text-center text-sm text-ink-faint">{s.rank}</span>
                  <GuildCrest guildId={s.guildId} size="sm" />
                  <span className="flex-1 text-sm font-semibold">{g.nickname}</span>
                  <span className="figure text-sm">{sparks(s.total)}</span>
                </div>
              )
            })}
          </Card>
        </section>

        {/* Bright Spark race */}
        <section className="md:col-span-5">
          <SectionTitle>Bright Spark race · {monthShort}</SectionTitle>
          <Card className="divide-y divide-line-soft">
            {brightSparks.map((m, i) => (
              <div key={m.memberId} className="flex items-center gap-3 px-4 py-2.5">
                <span className="figure w-5 text-center text-sm text-ink-faint">{i + 1}</span>
                <Avatar memberId={m.memberId} size="sm" />
                <span className="flex-1 text-sm">
                  <span className="font-semibold">{memberName(m.memberId)}</span>
                  <span className="block text-xs text-ink-faint">
                    {guildById(m.guildId).nickname}
                  </span>
                </span>
                <span className="figure text-sm">{sparks(m.total)}</span>
              </div>
            ))}
          </Card>
          <p className="mt-2 px-0.5 text-xs text-ink-soft">
            Top at month end wins Dinner, Bed &amp; Breakfast in a Chickpea pub.
          </p>
        </section>

        {/* Upcoming */}
        <section className="md:col-span-12">
          <SectionTitle
            action={
              <Link to="/events" className="text-xs font-semibold text-maroon">
                All events
              </Link>
            }
          >
            Coming up at the Guild Hall
          </SectionTitle>
          <div className="grid gap-2 md:grid-cols-3 md:gap-4">
            {nextEvents.map((ev) => (
              <Card key={ev.id} className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-paper-2 text-center">
                  <span className="text-[10px] font-bold uppercase text-ink-faint">
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
              </Card>
            ))}
          </div>
        </section>
      </div>

      <p className="pt-1 text-center text-[11px] tracking-wide text-ink-faint">
        Friction → Spark → Allocation → Recognition → Celebration
      </p>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-4">
      <p className="label">{label}</p>
      <p className="figure mt-1 text-2xl md:text-[26px]">{value}</p>
      <p className="text-xs text-ink-faint">{sub}</p>
    </Card>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

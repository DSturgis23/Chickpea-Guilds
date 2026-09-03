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
  const brightSparks = memberStandings(awards, month, 3)
  const myMonth = memberTotal(awards, user.id, month)
  const myFy = memberTotal(awards, user.id, fy)
  const nextEvents = [...EVENTS]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 2)
  const guild = guildById(user.guildId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">
          {greeting()}, {user.firstName}
        </h1>
        <p className="text-sm text-ink-soft">{month.label} · every spark counts</p>
      </div>

      {/* My guild this month */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3 text-white"
          style={{ backgroundColor: guild.colour }}
        >
          <GuildCrest guildId={guild.id} size="lg" />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Your guild
            </p>
            <p className="text-lg font-black leading-tight">{guild.nickname}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black leading-none">#{myRank}</p>
            <p className="text-xs opacity-80">of {GUILDS.length}</p>
          </div>
        </div>
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">{sparks(myGuild.total)} sparks</span>
            <span className="text-ink-soft">
              {myRank === 1
                ? `+${sparks(myGuild.total - (standings[1]?.total ?? 0))} clear`
                : `${sparks(leader.total - myGuild.total)} behind ${
                    guildById(leader.guildId).nickname
                  }`}
            </span>
          </div>
          <Bar value={myGuild.total} max={leader.total} colour={guild.colour} />
        </div>
      </Card>

      {/* My sparks */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            You · {month.label.split(' ')[0]}
          </p>
          <p className="mt-1 text-2xl font-black">{sparks(myMonth)}</p>
          <p className="text-xs text-ink-soft">sparks earned</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            You · {fy.label}
          </p>
          <p className="mt-1 text-2xl font-black">{sparks(myFy)}</p>
          <p className="text-xs text-ink-soft">sparks earned</p>
        </Card>
      </div>

      {/* Nominate CTA */}
      <Link
        to="/nominate"
        className="flex items-center gap-3 rounded-2xl bg-maroon px-4 py-4 text-white active:bg-maroon-dark"
      >
        <IconSpark width={26} height={26} />
        <span className="flex-1">
          <span className="block font-bold">Nominate someone for sparks</span>
          <span className="block text-xs opacity-80">
            Caught someone doing it brilliantly? Put it forward.
          </span>
        </span>
        <IconChevron width={20} height={20} />
      </Link>

      {/* Guild leaderboard preview */}
      <section>
        <SectionTitle
          action={
            <Link to="/leaderboard" className="text-xs font-semibold text-maroon">
              Full table
            </Link>
          }
        >
          Guild leaderboard · {month.label.split(' ')[0]}
        </SectionTitle>
        <Card className="divide-y divide-line">
          {standings.map((s) => {
            const g = guildById(s.guildId)
            const isMine = s.guildId === user.guildId
            return (
              <div
                key={s.guildId}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  isMine ? 'bg-maroon-soft/40' : ''
                }`}
              >
                <span className="w-5 text-center text-sm font-bold text-ink-soft">
                  {s.rank}
                </span>
                <GuildCrest guildId={s.guildId} size="sm" />
                <span className="flex-1 text-sm font-semibold">{g.nickname}</span>
                <span className="text-sm font-bold">{sparks(s.total)}</span>
              </div>
            )
          })}
        </Card>
      </section>

      {/* Bright Spark race */}
      <section>
        <SectionTitle>Bright Spark race · {month.label.split(' ')[0]}</SectionTitle>
        <Card className="divide-y divide-line">
          {brightSparks.map((m, i) => (
            <div key={m.memberId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-5 text-center text-sm font-bold text-ink-soft">
                {i + 1}
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
          ))}
        </Card>
        <p className="mt-2 px-1 text-xs text-ink-soft">
          Top of the pile at month end wins Dinner, Bed &amp; Breakfast in a Chickpea pub.
        </p>
      </section>

      {/* Upcoming */}
      <section>
        <SectionTitle
          action={
            <Link to="/events" className="text-xs font-semibold text-maroon">
              All events
            </Link>
          }
        >
          Coming up at the Guild Hall
        </SectionTitle>
        <div className="space-y-2">
          {nextEvents.map((ev) => (
            <Card key={ev.id} className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-paper-2 text-center">
                <span className="text-xs font-bold uppercase text-ink-soft">
                  {shortDate(ev.startsAt).split(' ')[1]}
                </span>
                <span className="text-base font-black leading-none">
                  {shortDate(ev.startsAt).split(' ')[0]}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{ev.title}</p>
                <p className="text-xs text-ink-soft">
                  {relativeDays(ev.startsAt)} · {ev.location}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <p className="pt-2 text-center text-[11px] text-ink-soft">
        Friction → Spark → Allocation → Recognition → Celebration
      </p>
    </div>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

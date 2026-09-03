import { useMemo } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { behaviourById, guildById, memberName } from '../data/seed'
import { currentFinancialYearPeriod, currentMonthPeriod } from '../lib/fy'
import { memberTotal } from '../lib/standings'
import { dateWithYear, sparks, yearsOfService } from '../lib/format'
import { GuildCrest } from '../components/GuildCrest'
import { PillarTag } from '../components/PillarTag'
import { Button, Card, SectionTitle } from '../components/ui'
import { BackHeader } from '../components/BackHeader'

export function Profile() {
  const { user, signOut } = useAuth()
  const { awards } = useStore()
  const month = useMemo(() => currentMonthPeriod(), [])
  const fy = useMemo(() => currentFinancialYearPeriod(), [])

  if (!user) return null
  const guild = guildById(user.guildId)
  const mine = awards
    .filter((a) => a.memberId === user.id)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))

  return (
    <div className="rise space-y-5 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
      <div className="space-y-4 md:space-y-5">
        <BackHeader title="Your profile" to="/" />

        <Card className="overflow-hidden">
          <div
            className="flex items-center gap-4 px-5 py-5 text-white"
            style={{ backgroundColor: guild.colour }}
          >
            <GuildCrest guildId={guild.id} size="xl" />
            <div>
              <p className="font-serif text-xl font-semibold leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm opacity-90">{guild.name}</p>
              <p className="text-xs opacity-75">“{guild.motto}”</p>
            </div>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-y-2.5 px-5 py-4 text-sm">
            <dt className="text-ink-faint">Pub / site</dt>
            <dd>{user.site}</dd>
            <dt className="text-ink-faint">Role</dt>
            <dd>{user.jobRole}</dd>
            <dt className="text-ink-faint">Started</dt>
            <dd>
              {dateWithYear(user.startDate)} · {yearsOfService(user.startDate)} yr service
            </dd>
            <dt className="text-ink-faint">Email</dt>
            <dd className="truncate">{user.email}</dd>
          </dl>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="label">{month.label.split(' ')[0]}</p>
            <p className="figure mt-1 text-2xl">{sparks(memberTotal(awards, user.id, month))}</p>
            <p className="text-xs text-ink-faint">sparks contributed</p>
          </Card>
          <Card className="p-4">
            <p className="label">{fy.label}</p>
            <p className="figure mt-1 text-2xl">{sparks(memberTotal(awards, user.id, fy))}</p>
            <p className="text-xs text-ink-faint">sparks contributed</p>
          </Card>
        </div>

        <Button variant="secondary" size="lg" onClick={signOut} className="hidden md:flex">
          Sign out
        </Button>
      </div>

      <section>
        <SectionTitle>Your spark history</SectionTitle>
        <Card className="divide-y divide-line-soft">
          {mine.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">
              No sparks yet — they’ll appear here once People &amp; Culture approve a nomination.
            </p>
          )}
          {mine.slice(0, 20).map((a) => {
            const b = behaviourById(a.behaviourId)
            return (
              <div key={a.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium">{b.title}</span>
                  <PillarTag pillar={a.pillar} />
                  <span className="text-sm font-bold text-maroon">+{a.points}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {dateWithYear(a.occurredOn)}
                  {a.status !== 'approved' && (
                    <span className="ml-2 font-semibold uppercase text-gold">
                      {a.status}
                    </span>
                  )}
                  {a.nominatedById && ` · nominated by ${memberName(a.nominatedById)}`}
                </p>
              </div>
            )
          })}
        </Card>
        <Button variant="secondary" size="lg" onClick={signOut} className="mt-5 md:hidden">
          Sign out
        </Button>
      </section>
    </div>
  )
}

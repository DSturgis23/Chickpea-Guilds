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
    <div className="space-y-5">
      <BackHeader title="Your profile" to="/" />

      <Card className="overflow-hidden">
        <div
          className="flex items-center gap-4 px-4 py-4 text-white"
          style={{ backgroundColor: guild.colour }}
        >
          <GuildCrest guildId={guild.id} size="xl" />
          <div>
            <p className="text-lg font-black leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm opacity-90">{guild.name}</p>
            <p className="text-xs opacity-75">“{guild.motto}”</p>
          </div>
        </div>
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 px-4 py-4 text-sm">
          <dt className="text-ink-soft">Pub / site</dt>
          <dd>{user.site}</dd>
          <dt className="text-ink-soft">Role</dt>
          <dd>{user.jobRole}</dd>
          <dt className="text-ink-soft">Started</dt>
          <dd>
            {dateWithYear(user.startDate)} · {yearsOfService(user.startDate)} yr service
          </dd>
          <dt className="text-ink-soft">Email</dt>
          <dd className="truncate">{user.email}</dd>
        </dl>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {month.label.split(' ')[0]}
          </p>
          <p className="mt-1 text-2xl font-black">{sparks(memberTotal(awards, user.id, month))}</p>
          <p className="text-xs text-ink-soft">sparks contributed</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {fy.label}
          </p>
          <p className="mt-1 text-2xl font-black">{sparks(memberTotal(awards, user.id, fy))}</p>
          <p className="text-xs text-ink-soft">sparks contributed</p>
        </Card>
      </div>

      <section>
        <SectionTitle>Your spark history</SectionTitle>
        <Card className="divide-y divide-line">
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
                <p className="mt-0.5 text-xs text-ink-soft">
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
      </section>

      <Button variant="secondary" size="lg" onClick={signOut}>
        Sign out
      </Button>
    </div>
  )
}

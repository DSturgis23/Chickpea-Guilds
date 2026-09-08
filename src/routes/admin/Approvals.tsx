import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { useStore } from '../../state/store'
import { behaviourById, guildById, memberById, memberName } from '../../data/seed'
import { dateWithYear, sparks } from '../../lib/format'
import { Avatar } from '../../components/Avatar'
import { PillarTag } from '../../components/PillarTag'
import { Button, Card, EmptyState } from '../../components/ui'
import { BackHeader } from '../../components/BackHeader'
import { Check as IconCheck, X as IconX } from 'lucide-react'

export function Approvals() {
  const { user } = useAuth()
  const { awards, decide } = useStore()
  const [tab, setTab] = useState<'pending' | 'decided'>('pending')

  const pending = useMemo(
    () =>
      awards
        .filter((a) => a.status === 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [awards],
  )
  const decided = useMemo(
    () =>
      awards
        .filter((a) => a.status !== 'pending' && a.decidedAt)
        .sort((a, b) => (b.decidedAt ?? '').localeCompare(a.decidedAt ?? ''))
        .slice(0, 30),
    [awards],
  )

  if (!user) return null

  return (
    <div className="space-y-4 md:mx-auto md:max-w-4xl">
      <BackHeader title="Approvals" to="/more" />
      <p className="text-sm text-ink-soft">
        Sparks are only awarded once you verify the nomination.
      </p>

      <div className="flex w-full max-w-sm rounded-lg border border-line bg-paper-2 p-0.5">
        {(['pending', 'decided'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-[7px] px-3 py-1.5 text-xs font-semibold capitalize ${
              tab === t ? 'bg-surface text-ink shadow-sm' : 'text-ink-faint'
            }`}
          >
            {t} {t === 'pending' && pending.length > 0 && `(${pending.length})`}
          </button>
        ))}
      </div>

      {tab === 'pending' ? (
        pending.length === 0 ? (
          <EmptyState title="All caught up" hint="No nominations waiting." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((a) => {
              const b = behaviourById(a.behaviourId)
              const m = memberById(a.memberId)
              return (
                <Card key={a.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar memberId={a.memberId} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {guildById(m.guildId).nickname} · {m.site}
                      </p>
                    </div>
                    <span className="figure text-base text-maroon">
                      +{sparks(b.points)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium">{b.title}</span>
                    <PillarTag pillar={a.pillar} />
                  </div>
                  {a.note && (
                    <p className="mt-2 rounded-lg bg-paper-2 px-3 py-2 text-sm text-ink-soft">
                      “{a.note}”
                    </p>
                  )}
                  <p className="mt-2 text-xs text-ink-soft">
                    {a.nominatedById ? `Nominated by ${memberName(a.nominatedById)}` : 'Automatic'} ·{' '}
                    occurred {dateWithYear(a.occurredOn)}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => decide(a.id, 'approved', user.id)}
                    >
                      <IconCheck width={18} height={18} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => decide(a.id, 'rejected', user.id)}
                    >
                      <IconX width={18} height={18} /> Reject
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <Card className="divide-y divide-line-soft">
          {decided.map((a) => {
            const b = behaviourById(a.behaviourId)
            return (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                    a.status === 'approved' ? 'bg-[#2E7D5B]' : 'bg-[#b3122e]'
                  }`}
                >
                  {a.status === 'approved' ? (
                    <IconCheck width={15} height={15} />
                  ) : (
                    <IconX width={15} height={15} />
                  )}
                </span>
                <span className="flex-1 text-sm">
                  <span className="font-semibold">{memberName(a.memberId)}</span>
                  <span className="block text-xs text-ink-soft">{b.title}</span>
                </span>
                <span className="text-sm font-bold text-ink-soft">
                  {a.status === 'approved' ? `+${sparks(b.points)}` : '—'}
                </span>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}

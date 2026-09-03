import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { EVENTS, guildById, memberName } from '../data/seed'
import type { GuildEvent } from '../types'
import { dateWithYear, relativeDays, timeRange } from '../lib/format'
import { Card, EmptyState, PageHeading, Pill, SectionTitle } from '../components/ui'

function visibleTo(ev: GuildEvent, role: string, guildId: string): boolean {
  switch (ev.visibility.kind) {
    case 'all':
      return true
    case 'role':
      return (
        role === ev.visibility.role ||
        role === 'super_admin' ||
        role === 'p_and_c' ||
        role === 'director'
      )
    case 'guild':
      return ev.visibility.guildId === guildId
  }
}

export function Events() {
  const { user } = useAuth()
  const [openId, setOpenId] = useState<string | null>(null)
  if (!user) return null

  const events = [...EVENTS]
    .filter((ev) => visibleTo(ev, user.role, user.guildId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  const now = new Date().toISOString()
  const upcoming = events.filter((e) => e.endsAt >= now)
  const past = events.filter((e) => e.endsAt < now)

  return (
    <div className="rise space-y-5">
      <PageHeading title="Events" sub="Training, seminars and guild-generated events" />

      <section>
        <SectionTitle>Upcoming</SectionTitle>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing scheduled" hint="New events show up here as People & Culture posts them." />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            {upcoming.map((ev) => (
              <EventCard
                key={ev.id}
                ev={ev}
                open={openId === ev.id}
                onToggle={() => setOpenId(openId === ev.id ? null : ev.id)}
              />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <SectionTitle>Earlier</SectionTitle>
          <div className="grid gap-2 opacity-70 md:grid-cols-2 md:gap-4">
            {past.map((ev) => (
              <EventCard
                key={ev.id}
                ev={ev}
                open={openId === ev.id}
                onToggle={() => setOpenId(openId === ev.id ? null : ev.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EventCard({
  ev,
  open,
  onToggle,
}: {
  ev: GuildEvent
  open: boolean
  onToggle: () => void
}) {
  const restricted = ev.visibility.kind !== 'all'
  return (
    <Card onClick={onToggle} className="p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-paper-2 text-center">
          <span className="text-[10px] font-bold uppercase text-ink-soft">
            {new Date(ev.startsAt).toLocaleDateString('en-GB', { month: 'short' })}
          </span>
          <span className="text-base font-black leading-none">
            {new Date(ev.startsAt).getDate()}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">{ev.title}</p>
          <p className="text-xs text-ink-soft">
            {relativeDays(ev.startsAt)} · {timeRange(ev.startsAt, ev.endsAt)}
          </p>
        </div>
        {restricted && (
          <Pill colour="#6b5d55">
            {ev.visibility.kind === 'role' ? 'GM only' : guildById((ev.visibility as { guildId: string }).guildId).nickname}
          </Pill>
        )}
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
          <p className="text-ink-soft">{ev.description}</p>
          <dl className="grid grid-cols-[80px_1fr] gap-y-1 text-xs">
            <dt className="text-ink-soft">When</dt>
            <dd>
              {dateWithYear(ev.startsAt)}, {timeRange(ev.startsAt, ev.endsAt)}
            </dd>
            <dt className="text-ink-soft">Where</dt>
            <dd>{ev.location}</dd>
            <dt className="text-ink-soft">Posted by</dt>
            <dd>{memberName(ev.createdById)}</dd>
          </dl>
        </div>
      )}
    </Card>
  )
}

import { useMemo, useState } from 'react'
import { GUILDS, MEMBERS, guildById } from '../../data/seed'
import { dateWithYear } from '../../lib/format'
import { Avatar } from '../../components/Avatar'
import { GuildCrest } from '../../components/GuildCrest'
import { Card, inputClass } from '../../components/ui'
import { BackHeader } from '../../components/BackHeader'

export function People() {
  const [query, setQuery] = useState('')
  const [guildFilter, setGuildFilter] = useState<string>('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MEMBERS.filter(
      (m) =>
        (guildFilter === 'all' || m.guildId === guildFilter) &&
        (!q ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.site.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)),
    )
  }, [query, guildFilter])

  return (
    <div className="rise space-y-4 md:mx-auto md:max-w-4xl">
      <BackHeader title="People & guild allocation" to="/more" />
      <p className="text-sm text-ink-soft">
        {MEMBERS.length} members. Allocation is random on onboarding; you’ll be able to
        override it here.
      </p>

      <input
        className={inputClass}
        placeholder="Search name, pub or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={guildFilter === 'all'} onClick={() => setGuildFilter('all')}>
          All
        </Chip>
        {GUILDS.map((g) => (
          <Chip
            key={g.id}
            active={guildFilter === g.id}
            onClick={() => setGuildFilter(g.id)}
          >
            {g.nickname}
          </Chip>
        ))}
      </div>

      <Card className="divide-y divide-line-soft">
        {rows.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar memberId={m.id} size="md" />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {m.firstName} {m.lastName}
              </p>
              <p className="text-xs text-ink-soft">
                {m.jobRole} · {m.site} · joined {dateWithYear(m.startDate)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <GuildCrest guildId={m.guildId} size="sm" />
              <span className="text-xs font-semibold">{guildById(m.guildId).nickname}</span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-ink-soft">No match.</p>
        )}
      </Card>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        active
          ? 'border-maroon bg-maroon text-white'
          : 'border-line bg-white text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

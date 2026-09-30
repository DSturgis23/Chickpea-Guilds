import { useMemo, useState } from 'react'
import { Mail, Search } from 'lucide-react'
import { GUILDS, SITES, guildById } from '../data/seed'
import { useStore } from '../state/store'
import { dateWithYear, yearsOfService } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { GuildCrest } from '../components/GuildCrest'
import { Card, PageHeading, inputClass } from '../components/ui'
import { BackHeader } from '../components/BackHeader'

export function Directory() {
  const { members } = useStore()
  const [query, setQuery] = useState('')
  const [guild, setGuild] = useState('all')
  const [site, setSite] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => m.active)
      .filter((m) => guild === 'all' || m.guildId === guild)
      .filter((m) => site === 'all' || m.site === site)
      .filter(
        (m) =>
          !q ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.jobRole.toLowerCase().includes(q) ||
          m.site.toLowerCase().includes(q),
      )
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
  }, [members, query, guild, site])

  return (
    <div className="rise space-y-4 md:mx-auto md:max-w-3xl">
      <BackHeader title="Directory" to="/more" />
      <PageHeading title="Directory" sub={`${members.filter((m) => m.active).length} people across the group`} />

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          className={`${inputClass} pl-9`}
          placeholder="Search name, role or pub"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={guild === 'all' && site === 'all'} onClick={() => { setGuild('all'); setSite('all') }}>
          Everyone
        </Chip>
        {GUILDS.map((g) => (
          <Chip key={g.id} active={guild === g.id} onClick={() => setGuild(guild === g.id ? 'all' : g.id)}>
            {g.nickname}
          </Chip>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SITES.slice(0, 8).map((s) => (
          <Chip key={s} active={site === s} onClick={() => setSite(site === s ? 'all' : s)}>
            {s.replace(/^The /, '')}
          </Chip>
        ))}
      </div>

      <Card className="divide-y divide-line-soft">
        {rows.map((m) => {
          const open = openId === m.id
          return (
            <div key={m.id}>
              <button
                onClick={() => setOpenId(open ? null : m.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
              >
                <Avatar memberId={m.id} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {m.jobRole} · {m.site}
                  </p>
                </div>
                <GuildCrest guildId={m.guildId} size="sm" />
              </button>
              {open && (
                <div className="space-y-2 border-t border-line-soft bg-paper-2/40 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Mail size={14} className="text-ink-faint" />
                    <a href={`mailto:${m.email}`} className="text-gold hover:underline">
                      {m.email}
                    </a>
                  </div>
                  <p className="text-ink-soft">
                    {guildById(m.guildId).nickname} · joined {dateWithYear(m.startDate)} ·{' '}
                    {yearsOfService(m.startDate)} yr service
                  </p>
                </div>
              )}
            </div>
          )
        })}
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-faint">No one matches.</p>
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
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-gold/50 bg-gold-wash text-ink'
          : 'border-line bg-surface-2 text-ink-faint hover:text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

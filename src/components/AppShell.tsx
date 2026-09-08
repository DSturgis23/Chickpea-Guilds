import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { guildById } from '../data/seed'
import { currentMonthPeriod } from '../lib/fy'
import { guildStandings } from '../lib/standings'
import { House, LayoutGrid, MessagesSquare, Newspaper, Sparkles } from 'lucide-react'
import { GuildCrest } from './GuildCrest'

const tabs = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/feed', label: 'Feed', icon: Newspaper, end: false },
  { to: '/nominate', label: 'Nominate', icon: Sparkles, end: false, center: true },
  { to: '/chat', label: 'Chat', icon: MessagesSquare, end: false },
  { to: '/more', label: 'More', icon: LayoutGrid, end: false },
]

export function AppShell() {
  const { user } = useAuth()
  const { pendingCount } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  if (!user) return null

  const guild = guildById(user.guildId)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col md:max-w-none">
      {/* ── Mobile header ─────────────────────────────────────────────── */}
      <header className="safe-top sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="leading-tight">
            <p className="font-serif text-lg font-semibold tracking-tight text-gold-bright">
              Chickpea Guilds
            </p>
            <p className="label mt-0.5">
              {guild.nickname} · {guild.motto}
            </p>
          </div>
          <button onClick={() => navigate('/profile')} aria-label="Your profile">
            <GuildCrest guildId={user.guildId} size="md" />
          </button>
        </div>
      </header>

      {/* ── Desktop top bar ──────────────────────────────────────────── */}
      <DesktopTopBar path={location.pathname} />

      <main className="flex-1 px-4 pb-28 pt-5 md:px-10 md:pb-44 md:pt-8 lg:px-14">
        <div className="mx-auto w-full max-w-md md:max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* ── Bottom tab bar — every size; a floating pill on wide screens ── */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-surface/90 backdrop-blur
                   md:inset-x-auto md:bottom-6 md:left-1/2 md:w-auto md:max-w-none md:-translate-x-1/2 md:rounded-full md:border
                   md:px-2 md:shadow-[0_0_0_1px_rgba(240,200,126,0.08),0_16px_40px_-12px_rgba(0,0,0,0.8)]"
      >
        <div className="grid grid-cols-5 md:flex md:gap-1">
          {tabs.map(({ to, label, icon: Icon, end, center }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-2.5 md:text-xs md:transition-colors ${
                  isActive
                    ? 'text-gold-bright md:bg-maroon-wash'
                    : 'text-ink-faint md:hover:text-ink-soft'
                }`
              }
            >
              {center ? (
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-maroon text-ink shadow-[0_0_0_1px_rgba(240,200,126,0.2),0_8px_24px_-6px_rgba(255,122,47,0.5)] ring-4 ring-paper md:mt-0 md:h-8 md:w-8 md:shadow-none md:ring-0">
                  <Icon size={22} strokeWidth={2} className="md:h-[18px] md:w-[18px]" />
                </span>
              ) : (
                <Icon size={20} strokeWidth={2} className="md:h-[18px] md:w-[18px]" />
              )}
              <span>{label}</span>
              {to === '/more' && pendingCount > 0 && (
                <span className="absolute right-6 top-1.5 h-1.5 w-1.5 rounded-full bg-gold-bright md:right-2 md:top-1.5" />
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function DesktopTopBar({ path }: { path: string }) {
  const { awards } = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  const month = currentMonthPeriod()
  const standings = guildStandings(awards, month)
  const mine = standings.find((s) => s.guildId === user.guildId)
  const title = TITLES[path] ?? titleFromPath(path)

  return (
    <header className="hidden border-b border-line bg-paper/85 backdrop-blur md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-10 py-4 lg:px-14">
        <div className="flex items-baseline gap-4">
          <p className="font-serif text-lg font-semibold tracking-tight text-gold-bright">
            Chickpea Guilds
          </p>
          <span className="text-ink-faint">/</span>
          <h1 className="font-serif text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="label">{month.label}</span>
          {mine && (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3.5 hover:border-ink-faint/40"
            >
              <GuildCrest guildId={user.guildId} size="sm" />
              <span className="text-left leading-tight">
                <span className="block text-xs font-semibold">{user.firstName}</span>
                <span className="block text-[11px] text-ink-faint">
                  {guildById(user.guildId).nickname} · {ordinal(mine.rank)}
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

const TITLES: Record<string, string> = {
  '/': 'Home',
  '/feed': 'Feed',
  '/chat': 'Chat',
  '/directory': 'Directory',
  '/leaderboard': 'Leaderboard',
  '/nominate': 'Nominate for sparks',
  '/events': 'Events',
  '/documents': 'Documents',
  '/about': 'How Guilds work',
  '/profile': 'Your profile',
  '/more': 'More',
  '/admin/approvals': 'Approvals',
  '/admin/behaviours': 'Behaviours & points',
  '/admin/people': 'People & guild allocation',
  '/admin/reports': 'Reports',
}

function titleFromPath(path: string): string {
  const last = path.split('/').filter(Boolean).pop() ?? 'Home'
  return last.charAt(0).toUpperCase() + last.slice(1)
}

function ordinal(rank: number): string {
  const s = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'
  return `${rank}${s} of 6`
}

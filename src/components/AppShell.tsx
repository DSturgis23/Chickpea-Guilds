import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { guildById } from '../data/seed'
import { GuildCrest } from './GuildCrest'
import { IconCalendar, IconGrid, IconHome, IconSpark, IconTrophy } from './icons'

const tabs = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/leaderboard', label: 'Leaderboard', icon: IconTrophy, end: false },
  { to: '/nominate', label: 'Nominate', icon: IconSpark, end: false, center: true },
  { to: '/events', label: 'Events', icon: IconCalendar, end: false },
  { to: '/more', label: 'More', icon: IconGrid, end: false },
]

export function AppShell() {
  const { user } = useAuth()
  const { pendingCount } = useStore()
  const navigate = useNavigate()
  const guild = user ? guildById(user.guildId) : null

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-paper">
      <header className="safe-top sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="leading-tight">
            <p className="font-serif text-lg font-black tracking-tight text-maroon">
              Chickpea Guilds
            </p>
            {guild && (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {guild.nickname} · {guild.motto}
              </p>
            )}
          </div>
          {user && (
            <button onClick={() => navigate('/profile')} aria-label="Your profile">
              <GuildCrest guildId={user.guildId} size="md" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-white/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end, center }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
                  isActive ? 'text-maroon' : 'text-ink-soft'
                }`
              }
            >
              {center ? (
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-maroon text-white shadow-lg shadow-maroon/30 ring-4 ring-paper">
                  <Icon width={24} height={24} />
                </span>
              ) : (
                <Icon width={22} height={22} />
              )}
              <span>{label}</span>
              {to === '/more' && pendingCount > 0 && (
                <span className="absolute right-5 top-1.5 h-2 w-2 rounded-full bg-gold" />
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

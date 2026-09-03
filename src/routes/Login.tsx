import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { MEMBERS } from '../data/seed'
import { Button, Field, inputClass } from '../components/ui'
import { GuildCrest } from '../components/GuildCrest'

export function Login() {
  const { signIn, impersonate, usingRealAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = signIn(email)
    if (res.ok) navigate('/', { replace: true })
    else setError(res.error ?? 'Could not sign in.')
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <p className="font-serif text-3xl font-black tracking-tight text-maroon">
          Chickpea Guilds
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Sparks, leaderboards and recognition — one craft, six guilds.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Work email">
          <input
            className={inputClass}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@chickpea.group"
          />
        </Field>
        <Field label="Password" hint="First time in? People & Culture will give you a temporary one.">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error && <p className="text-sm text-[#b3122e]">{error}</p>}
        <Button size="lg" type="submit">
          Sign in
        </Button>
      </form>

      {!usingRealAuth && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Preview build — no backend yet
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Password is ignored. Tap a person to explore the app as them.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {MEMBERS.slice(0, 6).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  impersonate(m.id)
                  navigate('/', { replace: true })
                }}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 text-left active:bg-paper-2"
              >
                <GuildCrest guildId={m.guildId} size="sm" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">
                    {m.firstName} {m.lastName}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {m.jobRole} · {roleLabel(m.role)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function roleLabel(role: string): string {
  return (
    {
      member: 'Member',
      manager: 'General Manager',
      p_and_c: 'People & Culture',
      director: 'Director',
      super_admin: 'Super admin',
    }[role] ?? role
  )
}

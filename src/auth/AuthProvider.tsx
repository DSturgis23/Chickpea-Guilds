import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Member, Role } from '../types'
import { MEMBERS } from '../data/seed'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { fetchMemberById } from '../lib/live'

// Two paths, chosen by whether Supabase is configured (see lib/supabase.ts):
//  - real:  Supabase Auth session + the matching row in `profiles`
//  - demo:  no backend — "signing in" resolves an email against seed.ts and
//           remembers the choice in localStorage (also how the on-screen
//           person-picker on the login page works)

interface AuthValue {
  user: Member | null
  ready: boolean
  usingRealAuth: boolean
  signIn: (email: string, password?: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => void
  /** Demo-only: jump straight into a role to explore the app. */
  impersonate: (memberId: string) => void
}

const AuthContext = createContext<AuthValue | null>(null)
const STORAGE_KEY = 'guilds.demo.userId'

const ADMIN_ROLES: Role[] = ['p_and_c', 'super_admin']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let cancelled = false
      supabase.auth.getSession().then(({ data }) => {
        const uid = data.session?.user.id
        if (!uid) {
          if (!cancelled) setReady(true)
          return
        }
        fetchMemberById(uid)
          .then((m) => {
            if (!cancelled) setUser(m)
          })
          .finally(() => {
            if (!cancelled) setReady(true)
          })
      })

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchMemberById(session.user.id).then((m) => {
            if (!cancelled) setUser(m)
          })
        } else if (!cancelled) {
          setUser(null)
        }
      })

      return () => {
        cancelled = true
        sub.subscription.unsubscribe()
      }
    }

    // Demo fallback — no backend configured.
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const m = MEMBERS.find((x) => x.id === saved)
      if (m) setUser(m)
    }
    setReady(true)
  }, [])

  const signIn = useCallback(async (email: string, password?: string) => {
    if (isSupabaseConfigured && supabase) {
      if (!password) return { ok: false, error: 'Enter your password.' }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        return {
          ok: false,
          error:
            error.message === 'Invalid login credentials'
              ? 'Wrong email or password.'
              : error.message,
        }
      }
      const m = await fetchMemberById(data.user.id)
      if (!m) {
        return {
          ok: false,
          error: 'Signed in, but no profile is set up yet — ask People & Culture.',
        }
      }
      setUser(m)
      return { ok: true }
    }

    // Demo fallback — password is ignored, any seeded email works.
    const m = MEMBERS.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!m) {
      return {
        ok: false,
        error: 'No account for that email yet. Ask People & Culture to add you.',
      }
    }
    localStorage.setItem(STORAGE_KEY, m.id)
    setUser(m)
    return { ok: true }
  }, [])

  const signOut = useCallback(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut()
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(null)
  }, [])

  const impersonate = useCallback((memberId: string) => {
    const m = MEMBERS.find((x) => x.id === memberId)
    if (m) {
      localStorage.setItem(STORAGE_KEY, m.id)
      setUser(m)
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, ready, usingRealAuth: isSupabaseConfigured, signIn, signOut, impersonate }),
    [user, ready, signIn, signOut, impersonate],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function isAdminRole(role: Role | undefined): boolean {
  return role ? ADMIN_ROLES.includes(role) : false
}

export function canManageEvents(role: Role | undefined): boolean {
  return role ? ['manager', 'p_and_c', 'super_admin', 'director'].includes(role) : false
}

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
import { isSupabaseConfigured } from '../lib/supabase'

// While Supabase is not yet wired, "signing in" just resolves an email to one of
// the demo members. The real flow (admin-created email + password, forced reset
// on first login) drops in here without touching the rest of the app.

interface AuthValue {
  user: Member | null
  ready: boolean
  usingRealAuth: boolean
  signIn: (email: string) => { ok: boolean; error?: string }
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
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const m = MEMBERS.find((x) => x.id === saved)
      if (m) setUser(m)
    }
    setReady(true)
  }, [])

  const signIn = useCallback((email: string) => {
    const m = MEMBERS.find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase(),
    )
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
    localStorage.removeItem(STORAGE_KEY)
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

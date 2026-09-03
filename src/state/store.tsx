import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AwardStatus, SparkAward } from '../types'
import { AWARDS, behaviourById, memberById } from '../data/seed'

// In-memory store standing in for Supabase. Nominations added here and approval
// decisions made here live for the session only — enough to demo the full loop.

interface NominationInput {
  memberId: string
  behaviourId: string
  note: string
  occurredOn: string
  nominatedById: string
}

interface StoreValue {
  awards: SparkAward[]
  nominate: (input: NominationInput) => void
  decide: (awardId: string, status: Exclude<AwardStatus, 'pending'>, decidedById: string) => void
  pendingCount: number
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [awards, setAwards] = useState<SparkAward[]>(AWARDS)

  const nominate = useCallback((input: NominationInput) => {
    const behaviour = behaviourById(input.behaviourId)
    const member = memberById(input.memberId)
    const now = new Date()
    const award: SparkAward = {
      id: `a-new-${now.getTime()}`,
      memberId: input.memberId,
      guildId: member.guildId,
      behaviourId: input.behaviourId,
      pillar: behaviour.pillar,
      points: behaviour.points,
      note: input.note,
      status: 'pending',
      nominatedById: input.nominatedById,
      occurredOn: input.occurredOn,
      createdAt: now.toISOString(),
    }
    setAwards((prev) => [award, ...prev])
  }, [])

  const decide = useCallback(
    (awardId: string, status: Exclude<AwardStatus, 'pending'>, decidedById: string) => {
      setAwards((prev) =>
        prev.map((a) =>
          a.id === awardId
            ? { ...a, status, decidedById, decidedAt: new Date().toISOString() }
            : a,
        ),
      )
    },
    [],
  )

  const pendingCount = useMemo(
    () => awards.filter((a) => a.status === 'pending').length,
    [awards],
  )

  const value = useMemo<StoreValue>(
    () => ({ awards, nominate, decide, pendingCount }),
    [awards, nominate, decide, pendingCount],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

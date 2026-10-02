import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AwardStatus,
  Behaviour,
  ChatMessage,
  FeedPost,
  GuildDocument,
  GuildEvent,
  Member,
  SparkAward,
} from '../types'
import {
  AWARDS,
  BEHAVIOURS,
  CHAT_MESSAGES,
  DOCUMENTS,
  EVENTS,
  FEED_POSTS,
  MEMBERS,
  behaviourById as seedBehaviourById,
  memberById as seedMemberById,
} from '../data/seed'
import { isSupabaseConfigured } from '../lib/supabase'
import * as live from '../lib/live'
import { useAuth } from '../auth/AuthProvider'

// Two data sources, chosen by whether Supabase is configured:
//  - real: the sparks ledger, people, behaviours, events and documents all come
//    from the live database (src/lib/live.ts)
//  - demo: everything comes from src/data/seed.ts, held in memory for the session
//
// Feed and Chat have no tables yet — they stay on seed data either way; that's
// deliberate, not an oversight (see the build-vs-buy notes).

interface NominationInput {
  memberId: string
  behaviourId: string
  note: string
  occurredOn: string
  nominatedById: string
}

interface StoreValue {
  awards: SparkAward[]
  nominate: (input: NominationInput) => Promise<void>
  decide: (awardId: string, status: Exclude<AwardStatus, 'pending'>, decidedById: string) => Promise<void>
  pendingCount: number

  // Real people + reference data once Supabase is wired; seed content otherwise.
  members: Member[]
  behaviours: Behaviour[]
  events: GuildEvent[]
  documents: GuildDocument[]
  dataLoading: boolean
  memberById: (id: string) => Member | undefined
  memberName: (id: string) => string
  behaviourById: (id: string) => Behaviour | undefined

  // Admin: events & documents
  createEvent: (input: live.EventInput) => Promise<void>
  editEvent: (id: string, input: live.EventInput) => Promise<void>
  removeEvent: (id: string) => Promise<void>
  uploadDocumentFile: (input: { file: File; title: string; category: string; uploadedById: string }) => Promise<void>
  removeDocument: (id: string, fileUrl: string) => Promise<void>
  getDocumentUrl: (fileUrl: string) => Promise<string>

  // Feed — always seed data (no table yet).
  posts: FeedPost[]
  toggleReaction: (postId: string, emoji: string, memberId: string) => void
  addComment: (postId: string, memberId: string, body: string) => void
  votePoll: (postId: string, optionId: string, memberId: string) => void

  // Chat — always seed data (no table yet).
  messages: ChatMessage[]
  sendMessage: (channelId: string, authorId: string, body: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const [awards, setAwards] = useState<SparkAward[]>(isSupabaseConfigured ? [] : AWARDS)
  const [members, setMembers] = useState<Member[]>(isSupabaseConfigured ? [] : MEMBERS)
  const [behaviours, setBehaviours] = useState<Behaviour[]>(isSupabaseConfigured ? [] : BEHAVIOURS)
  const [events, setEvents] = useState<GuildEvent[]>(isSupabaseConfigured ? [] : EVENTS)
  const [documents, setDocuments] = useState<GuildDocument[]>(isSupabaseConfigured ? [] : DOCUMENTS)
  const [dataLoading, setDataLoading] = useState(isSupabaseConfigured)

  const [posts, setPosts] = useState<FeedPost[]>(FEED_POSTS)
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES)

  const refreshAwards = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setAwards(await live.fetchAwards())
  }, [])

  const refreshEvents = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setEvents(await live.fetchEvents())
  }, [])

  const refreshDocuments = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setDocuments(await live.fetchDocuments())
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    // Row-Level Security only grants access to the `authenticated` role, so
    // fetching before sign-in completes silently returns nothing — wait for a
    // real session (and re-fetch if the signed-in user changes).
    if (!ready) return
    if (!user) {
      setMembers([])
      setBehaviours([])
      setAwards([])
      setEvents([])
      setDocuments([])
      setDataLoading(false)
      return
    }
    let cancelled = false
    setDataLoading(true)
    Promise.all([
      live.fetchMembers(),
      live.fetchBehaviours(),
      live.fetchAwards(),
      live.fetchEvents(),
      live.fetchDocuments(),
    ])
      .then(([m, b, a, e, d]) => {
        if (cancelled) return
        setMembers(m)
        setBehaviours(b)
        setAwards(a)
        setEvents(e)
        setDocuments(d)
      })
      .catch((err) => {
        console.error('Failed to load live Guilds data:', err)
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ready, user?.id])

  const nominate = useCallback(
    async (input: NominationInput) => {
      if (isSupabaseConfigured) {
        const member = members.find((m) => m.id === input.memberId)
        const behaviour = behaviours.find((b) => b.id === input.behaviourId)
        if (!member || !behaviour) throw new Error('Unknown member or behaviour')
        await live.insertNomination({
          memberId: input.memberId,
          guildId: member.guildId,
          behaviourId: input.behaviourId,
          pillar: behaviour.pillar,
          points: behaviour.points,
          note: input.note,
          occurredOn: input.occurredOn,
          nominatedById: input.nominatedById,
        })
        await refreshAwards()
        return
      }

      const behaviour = seedBehaviourById(input.behaviourId)
      const member = seedMemberById(input.memberId)
      const now = new Date()
      setAwards((prev) => [
        {
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
        },
        ...prev,
      ])
    },
    [members, behaviours, refreshAwards],
  )

  const decide = useCallback(
    async (awardId: string, status: Exclude<AwardStatus, 'pending'>, decidedById: string) => {
      if (isSupabaseConfigured) {
        await live.decideAward(awardId, status, decidedById)
        await refreshAwards()
        return
      }
      setAwards((prev) =>
        prev.map((a) =>
          a.id === awardId
            ? { ...a, status, decidedById, decidedAt: new Date().toISOString() }
            : a,
        ),
      )
    },
    [refreshAwards],
  )

  const createEvent = useCallback(
    async (input: live.EventInput) => {
      if (isSupabaseConfigured) {
        await live.insertEvent(input)
        await refreshEvents()
        return
      }
      setEvents((prev) => [
        ...prev,
        {
          id: `ev-new-${Date.now()}`,
          title: input.title,
          description: input.description,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          location: input.location,
          createdById: input.createdById,
          visibility: input.visibility,
        },
      ])
    },
    [refreshEvents],
  )

  const editEvent = useCallback(
    async (id: string, input: live.EventInput) => {
      if (isSupabaseConfigured) {
        await live.updateEvent(id, input)
        await refreshEvents()
        return
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                title: input.title,
                description: input.description,
                startsAt: input.startsAt,
                endsAt: input.endsAt,
                location: input.location,
                visibility: input.visibility,
              }
            : e,
        ),
      )
    },
    [refreshEvents],
  )

  const removeEvent = useCallback(
    async (id: string) => {
      if (isSupabaseConfigured) {
        await live.deleteEvent(id)
        await refreshEvents()
        return
      }
      setEvents((prev) => prev.filter((e) => e.id !== id))
    },
    [refreshEvents],
  )

  const uploadDocumentFile = useCallback(
    async (input: { file: File; title: string; category: string; uploadedById: string }) => {
      if (isSupabaseConfigured) {
        await live.uploadDocument(input)
        await refreshDocuments()
        return
      }
      setDocuments((prev) => [
        {
          id: `doc-new-${Date.now()}`,
          title: input.title,
          category: input.category,
          updatedAt: new Date().toISOString().slice(0, 10),
          fileUrl: '#',
          sizeLabel: `${input.file.name.split('.').pop()?.toUpperCase() ?? 'FILE'} · demo`,
        },
        ...prev,
      ])
    },
    [refreshDocuments],
  )

  const removeDocument = useCallback(
    async (id: string, fileUrl: string) => {
      if (isSupabaseConfigured) {
        await live.deleteDocument(id, fileUrl)
        await refreshDocuments()
        return
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    },
    [refreshDocuments],
  )

  const getDocumentUrl = useCallback(async (fileUrl: string) => {
    if (isSupabaseConfigured) return live.documentDownloadUrl(fileUrl)
    return fileUrl
  }, [])

  const toggleReaction = useCallback((postId: string, emoji: string, memberId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const current = p.reactions[emoji] ?? []
        const next = current.includes(memberId)
          ? current.filter((m) => m !== memberId)
          : [...current, memberId]
        const reactions = { ...p.reactions, [emoji]: next }
        if (next.length === 0) delete reactions[emoji]
        return { ...p, reactions }
      }),
    )
  }, [])

  const addComment = useCallback((postId: string, memberId: string, body: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: `cm-${Date.now()}`, authorId: memberId, at: new Date().toISOString(), body },
              ],
            }
          : p,
      ),
    )
  }, [])

  const votePoll = useCallback((postId: string, optionId: string, memberId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p
        const options = p.poll.options.map((o) => ({
          ...o,
          votes: o.votes.filter((m) => m !== memberId),
        }))
        const target = options.find((o) => o.id === optionId)
        if (target) target.votes = [...target.votes, memberId]
        return { ...p, poll: { ...p.poll, options } }
      }),
    )
  }, [])

  const sendMessage = useCallback((channelId: string, authorId: string, body: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, channelId, authorId, at: new Date().toISOString(), body },
    ])
  }, [])

  const memberByIdFn = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members],
  )
  const memberName = useCallback(
    (id: string) => {
      const m = memberByIdFn(id)
      return m ? `${m.firstName} ${m.lastName}` : 'Unknown'
    },
    [memberByIdFn],
  )
  const behaviourByIdFn = useCallback(
    (id: string) => behaviours.find((b) => b.id === id),
    [behaviours],
  )

  const pendingCount = useMemo(
    () => awards.filter((a) => a.status === 'pending').length,
    [awards],
  )

  const value = useMemo<StoreValue>(
    () => ({
      awards,
      nominate,
      decide,
      pendingCount,
      members,
      behaviours,
      events,
      documents,
      dataLoading,
      memberById: memberByIdFn,
      memberName,
      behaviourById: behaviourByIdFn,
      createEvent,
      editEvent,
      removeEvent,
      uploadDocumentFile,
      removeDocument,
      getDocumentUrl,
      posts,
      toggleReaction,
      addComment,
      votePoll,
      messages,
      sendMessage,
    }),
    [
      awards,
      nominate,
      decide,
      pendingCount,
      members,
      behaviours,
      events,
      documents,
      dataLoading,
      memberByIdFn,
      memberName,
      behaviourByIdFn,
      createEvent,
      editEvent,
      removeEvent,
      uploadDocumentFile,
      removeDocument,
      getDocumentUrl,
      posts,
      toggleReaction,
      addComment,
      votePoll,
      messages,
      sendMessage,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

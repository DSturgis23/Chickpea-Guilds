import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AwardStatus, ChatMessage, FeedPost, SparkAward } from '../types'
import {
  AWARDS,
  CHAT_MESSAGES,
  FEED_POSTS,
  behaviourById,
  memberById,
} from '../data/seed'

// In-memory store standing in for Supabase. Everything added here lives for the
// session only — enough to demo the full loop end to end.

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

  posts: FeedPost[]
  toggleReaction: (postId: string, emoji: string, memberId: string) => void
  addComment: (postId: string, memberId: string, body: string) => void
  votePoll: (postId: string, optionId: string, memberId: string) => void

  messages: ChatMessage[]
  sendMessage: (channelId: string, authorId: string, body: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [awards, setAwards] = useState<SparkAward[]>(AWARDS)
  const [posts, setPosts] = useState<FeedPost[]>(FEED_POSTS)
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES)

  const nominate = useCallback((input: NominationInput) => {
    const behaviour = behaviourById(input.behaviourId)
    const member = memberById(input.memberId)
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

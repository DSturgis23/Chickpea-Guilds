import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Hash, Send, Users } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { CHAT_CHANNELS, memberById, memberName } from '../data/seed'
import type { ChannelKind } from '../types'
import { timeAgo } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { Card, PageHeading, inputClass } from '../components/ui'

const KIND_LABEL: Record<ChannelKind, string> = {
  pub: 'Pub',
  guild: 'Guild',
  management: 'Management',
  group: 'Group',
}

export function Chat() {
  const { channelId } = useParams()
  if (channelId) return <Thread channelId={channelId} />
  return <ChannelList />
}

function ChannelList() {
  const { user } = useAuth()
  const { messages } = useStore()
  if (!user) return null

  const channels = useMemo(() => {
    return [...CHAT_CHANNELS].sort((a, b) => b.lastAt.localeCompare(a.lastAt))
  }, [])

  return (
    <div className="rise space-y-4 md:mx-auto md:max-w-2xl">
      <PageHeading title="Chat" sub="Pub, guild and management channels — a preview" />
      <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-ink-faint">
        Preview of the messaging idea. A live build would use a managed chat service — see the
        integration checklist.
      </p>
      <Card className="divide-y divide-line-soft">
        {channels.map((ch) => {
          const count = messages.filter((m) => m.channelId === ch.id).length
          const last = messages
            .filter((m) => m.channelId === ch.id)
            .sort((a, b) => b.at.localeCompare(a.at))[0]
          return (
            <Link
              key={ch.id}
              to={`/chat/${ch.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-faint">
                <Hash size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {ch.name}
                  <span className="text-[10px] font-normal uppercase tracking-wide text-ink-faint">
                    {KIND_LABEL[ch.kind]}
                  </span>
                </p>
                <p className="truncate text-xs text-ink-faint">
                  {last ? `${memberName(last.authorId).split(' ')[0]}: ${last.body}` : ch.preview}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-ink-faint">{timeAgo(last?.at ?? ch.lastAt)}</span>
                {ch.unread ? (
                  <span className="rounded-full bg-maroon px-1.5 text-[11px] font-bold text-ink">
                    {ch.unread}
                  </span>
                ) : (
                  <span className="text-[11px] text-ink-faint">{count} msgs</span>
                )}
              </div>
            </Link>
          )
        })}
      </Card>
    </div>
  )
}

function Thread({ channelId }: { channelId: string }) {
  const { user } = useAuth()
  const { messages, sendMessage } = useStore()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const channel = CHAT_CHANNELS.find((c) => c.id === channelId)

  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.channelId === channelId)
        .sort((a, b) => a.at.localeCompare(b.at)),
    [messages, channelId],
  )
  if (!user || !channel) return null

  return (
    <div className="rise mx-auto flex h-[calc(100dvh-11rem)] max-w-2xl flex-col md:h-[calc(100dvh-15rem)]">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <button onClick={() => navigate('/chat')} className="-ml-1 text-ink-soft hover:text-ink" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <p className="font-serif text-lg font-semibold tracking-tight">{channel.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <Users size={12} /> {channel.members} members · {KIND_LABEL[channel.kind]}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {thread.map((m, i) => {
          const mine = m.authorId === user.id
          const showAuthor = i === 0 || thread[i - 1].authorId !== m.authorId
          return (
            <div key={m.id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 shrink-0">
                {showAuthor && !mine && <Avatar memberId={m.authorId} size="sm" />}
              </div>
              <div className={`max-w-[78%] ${mine ? 'items-end text-right' : ''}`}>
                {showAuthor && (
                  <p className="mb-0.5 text-[11px] text-ink-faint">
                    {mine ? 'You' : memberById(m.authorId).firstName} · {timeAgo(m.at)}
                  </p>
                )}
                <p
                  className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? 'rounded-br-sm bg-maroon text-ink'
                      : 'rounded-bl-sm border border-line bg-surface-2 text-ink'
                  }`}
                >
                  {m.body}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form
        className="flex gap-2 border-t border-line pt-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          sendMessage(channelId, user.id, draft.trim())
          setDraft('')
        }}
      >
        <input
          className={`${inputClass} py-2.5`}
          placeholder={`Message ${channel.name}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-maroon px-4 text-ink disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}

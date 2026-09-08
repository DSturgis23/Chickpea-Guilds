import { useMemo, useState } from 'react'
import { MessageCircle, Pin, Send } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { memberById, memberName } from '../data/seed'
import type { FeedPost } from '../types'
import { timeAgo } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { Card, PageHeading, Pill, inputClass } from '../components/ui'

const REACTIONS = ['👍', '🔥', '👏', '🙌', '⚡', '❤️']

export function Feed() {
  const { user } = useAuth()
  const { posts } = useStore()
  const ordered = useMemo(
    () =>
      [...posts].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
        return b.postedAt.localeCompare(a.postedAt)
      }),
    [posts],
  )
  if (!user) return null

  return (
    <div className="rise space-y-4 md:mx-auto md:max-w-2xl">
      <PageHeading title="Feed" sub="Business updates, targeted to who needs them" />
      {ordered.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}

function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth()
  const { toggleReaction, addComment, votePoll } = useStore()
  const [showComments, setShowComments] = useState(false)
  const [draft, setDraft] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  if (!user) return null

  const author = memberById(post.authorId)
  const reactionEntries = Object.entries(post.reactions)

  return (
    <Card className="overflow-hidden">
      {post.pinned && (
        <div className="flex items-center gap-1.5 border-b border-line-soft bg-gold-wash px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
          <Pin size={12} /> Pinned{post.mustRead && ' · must read'}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar memberId={post.authorId} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">
              {author.firstName} {author.lastName}
            </p>
            <p className="truncate text-xs text-ink-faint">
              {author.jobRole} · {timeAgo(post.postedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Pill colour="#b79a6a">{post.audience}</Pill>
            {post.tag && <span className="text-[11px] text-ink-faint">{post.tag}</span>}
          </div>
        </div>

        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{post.body}</p>

        {post.imageTint && (
          <div
            className="mt-3 h-40 w-full rounded-lg border border-line-soft"
            style={{
              backgroundImage: `linear-gradient(135deg, ${post.imageTint}44, ${post.imageTint}14)`,
            }}
          />
        )}

        {post.poll && (
          <Poll
            postId={post.id}
            poll={post.poll}
            myId={user.id}
            onVote={(oid) => votePoll(post.id, oid, user.id)}
          />
        )}

        {/* reactions */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {reactionEntries.map(([emoji, ids]) => {
            const mine = ids.includes(user.id)
            return (
              <button
                key={emoji}
                onClick={() => toggleReaction(post.id, emoji, user.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                  mine
                    ? 'border-gold/50 bg-gold-wash text-ink'
                    : 'border-line bg-surface-2 text-ink-soft hover:border-gold/40'
                }`}
              >
                <span>{emoji}</span>
                <span className="figure">{ids.length}</span>
              </button>
            )
          })}
          <div className="relative">
            <button
              onClick={() => setPickerOpen((o) => !o)}
              className="inline-flex h-6 w-7 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-faint hover:border-gold/40"
              aria-label="Add reaction"
            >
              +
            </button>
            {pickerOpen && (
              <div className="absolute bottom-8 left-0 z-10 flex gap-1 rounded-full border border-line bg-surface p-1 shadow-lg">
                {REACTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      toggleReaction(post.id, e, user.id)
                      setPickerOpen(false)
                    }}
                    className="rounded-full px-1.5 py-0.5 text-base hover:bg-surface-2"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink-soft"
          >
            <MessageCircle size={14} />
            {post.comments.length}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-line-soft bg-paper-2/40 px-4 py-3">
          <div className="space-y-3">
            {post.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar memberId={c.authorId} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs">
                    <span className="font-semibold">{memberName(c.authorId)}</span>{' '}
                    <span className="text-ink-faint">· {timeAgo(c.at)}</span>
                  </p>
                  <p className="text-sm text-ink-soft">{c.body}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-xs text-ink-faint">No comments yet.</p>
            )}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              addComment(post.id, user.id, draft.trim())
              setDraft('')
            }}
          >
            <input
              className={`${inputClass} py-2 text-sm`}
              placeholder="Write a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-maroon px-3 text-ink disabled:opacity-40"
              aria-label="Send comment"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </Card>
  )
}

function Poll({
  poll,
  myId,
  onVote,
}: {
  postId: string
  poll: NonNullable<FeedPost['poll']>
  myId: string
  onVote: (optionId: string) => void
}) {
  const total = poll.options.reduce((s, o) => s + o.votes.length, 0)
  const myVote = poll.options.find((o) => o.votes.includes(myId))?.id

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-line-soft bg-paper-2/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{poll.question}</p>
      {poll.options.map((o) => {
        const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0
        const mine = myVote === o.id
        return (
          <button
            key={o.id}
            onClick={() => onVote(o.id)}
            className="relative block w-full overflow-hidden rounded-md border border-line bg-surface px-3 py-2 text-left text-sm hover:border-gold/40"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-md"
              style={{
                width: `${pct}%`,
                background: mine ? 'var(--color-gold-wash)' : 'var(--color-paper-2)',
              }}
            />
            <span className="relative flex items-center justify-between">
              <span className={mine ? 'font-semibold' : ''}>{o.label}</span>
              <span className="figure text-xs text-ink-faint">{pct}%</span>
            </span>
          </button>
        )
      })}
      <p className="text-[11px] text-ink-faint">
        {total} vote{total === 1 ? '' : 's'} · tap to change yours
      </p>
    </div>
  )
}

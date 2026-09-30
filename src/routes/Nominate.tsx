import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { PILLARS, guildById } from '../data/seed'
import { sparks } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { GuildCrest } from '../components/GuildCrest'
import { PillarTag } from '../components/PillarTag'
import { Button, Card, Field, inputClass } from '../components/ui'
import { ArrowLeft as IconArrowLeft, Check as IconCheck, Sparkles as IconSpark } from 'lucide-react'

type Step = 'who' | 'what' | 'why' | 'done'

/** Supabase/PostgREST errors are plain objects with a `message`, not `Error` instances. */
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return 'Could not send the nomination.'
}

export function Nominate() {
  const { user } = useAuth()
  const { nominate, members, behaviours, memberById, behaviourById } = useStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('who')
  const [query, setQuery] = useState('')
  const [memberId, setMemberId] = useState<string | null>(null)
  const [behaviourId, setBehaviourId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => new Date().toISOString().slice(0, 10))
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    // A person with no guild yet (allocation pending) can't be awarded sparks —
    // there's nowhere for the points to go — so they're not nominable yet.
    return members
      .filter((m) => m.active && m.id !== user?.id && m.guildId)
      .filter(
        (m) =>
          !q ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.site.toLowerCase().includes(q),
      )
  }, [members, query, user?.id])

  const awaitingAllocation = useMemo(
    () => members.filter((m) => m.active && m.id !== user?.id && !m.guildId).length,
    [members, user?.id],
  )

  if (!user) return null

  async function submit() {
    if (!memberId || !behaviourId) return
    setSending(true)
    setSendError(null)
    try {
      await nominate({ memberId, behaviourId, note: note.trim(), occurredOn, nominatedById: user!.id })
      setStep('done')
    } catch (err) {
      setSendError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (step === 'done') {
    const m = memberById(memberId!)
    const b = behaviourById(behaviourId!)
    if (!m || !b) return null
    return (
      <div className="rise mx-auto flex max-w-md flex-col items-center pt-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2E7D5B] text-white">
          <IconCheck width={32} height={32} />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight">Nomination sent</h1>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">
          People &amp; Culture will review it. If approved, <b>{sparks(b.points)} sparks</b>{' '}
          go to <b>{guildById(m.guildId).nickname}</b> for {m.firstName}.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            onClick={() => {
              setStep('who')
              setMemberId(null)
              setBehaviourId(null)
              setNote('')
            }}
          >
            Nominate someone else
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rise mx-auto max-w-md space-y-4">
      <div className="flex items-center gap-2">
        {step !== 'who' && (
          <button
            onClick={() => setStep(step === 'why' ? 'what' : 'who')}
            className="-ml-1 text-ink-soft"
            aria-label="Back"
          >
            <IconArrowLeft width={22} height={22} />
          </button>
        )}
        <h1 className="font-serif text-2xl font-semibold tracking-tight md:hidden">
          Nominate for sparks
        </h1>
        <h1 className="hidden font-serif text-xl font-semibold tracking-tight md:block">
          {stepTitle(step)}
        </h1>
      </div>

      <StepDots step={step} />

      {step === 'who' && (
        <div className="space-y-3">
          <Field label="Who caught your eye?">
            <input
              className={inputClass}
              placeholder="Search name or pub"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
          <Card className="max-h-[52vh] divide-y divide-line overflow-y-auto">
            {candidates.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMemberId(m.id)
                  setStep('what')
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-paper-2"
              >
                <Avatar memberId={m.id} size="md" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">
                    {m.firstName} {m.lastName}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {m.jobRole} · {m.site}
                  </span>
                </span>
                <GuildCrest guildId={m.guildId} size="sm" />
              </button>
            ))}
            {candidates.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-soft">No match.</p>
            )}
          </Card>
          {awaitingAllocation > 0 && (
            <p className="px-1 text-xs text-ink-faint">
              {awaitingAllocation} {awaitingAllocation === 1 ? 'person is' : 'people are'} still
              awaiting guild allocation and can&rsquo;t be nominated yet.
            </p>
          )}
        </div>
      )}

      {step === 'what' && memberId && (
        <div className="space-y-4">
          <SelectedMember memberId={memberId} />
          {PILLARS.map((p) => (
            <div key={p.key}>
              <p
                className="mb-1.5 px-1 text-xs font-bold uppercase tracking-wide"
                style={{ color: p.colour }}
              >
                {p.name}
              </p>
              <Card className="divide-y divide-line-soft">
                {behaviours.filter((b) => b.pillar === p.key && b.active && !b.autoAward).map(
                  (b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBehaviourId(b.id)
                        setStep('why')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-paper-2"
                    >
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{b.title}</span>
                        {b.detail && (
                          <span className="block text-xs text-ink-soft">{b.detail}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-maroon">
                        +{b.points}
                      </span>
                    </button>
                  ),
                )}
              </Card>
            </div>
          ))}
          <p className="px-1 text-xs text-ink-soft">
            Training, induction and years of service are awarded automatically — no
            nomination needed.
          </p>
        </div>
      )}

      {step === 'why' && memberId && behaviourId && behaviourById(behaviourId) && (
        <div className="space-y-4">
          <SelectedMember memberId={memberId} />
          <Card className="flex items-center gap-3 p-4">
            <IconSpark width={22} height={22} className="text-maroon" />
            <span className="flex-1 text-sm font-semibold">
              {behaviourById(behaviourId)!.title}
            </span>
            <PillarTag pillar={behaviourById(behaviourId)!.pillar} />
            <span className="text-sm font-bold text-maroon">
              +{behaviourById(behaviourId)!.points}
            </span>
          </Card>
          <Field label="What happened?" hint="A sentence or two for People & Culture. Be specific.">
            <textarea
              className={`${inputClass} min-h-[110px] resize-none`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Stepped in on the pass all weekend and still trained two new starters without being asked."
            />
          </Field>
          <Field label="When?">
            <input
              type="date"
              className={inputClass}
              value={occurredOn}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </Field>
          {sendError && <p className="text-sm text-[#e2867f]">{sendError}</p>}
          <Button size="lg" disabled={note.trim().length < 8 || sending} onClick={submit}>
            {sending ? 'Sending…' : 'Send nomination'}
          </Button>
        </div>
      )}
    </div>
  )
}

function SelectedMember({ memberId }: { memberId: string }) {
  const { memberById } = useStore()
  const m = memberById(memberId)
  if (!m) return null
  return (
    <Card className="flex items-center gap-3 p-3">
      <Avatar memberId={memberId} size="md" />
      <span className="flex-1">
        <span className="block text-sm font-semibold">
          {m.firstName} {m.lastName}
        </span>
        <span className="block text-xs text-ink-soft">
          {guildById(m.guildId).nickname} · {m.site}
        </span>
      </span>
    </Card>
  )
}

function stepTitle(step: Step): string {
  return step === 'who'
    ? 'Nominate — who?'
    : step === 'what'
      ? 'Nominate — what for?'
      : 'Nominate — the detail'
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ['who', 'what', 'why']
  const idx = order.indexOf(step)
  return (
    <div className="flex gap-1.5">
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 flex-1 rounded-full ${
            i <= idx ? 'bg-maroon' : 'bg-paper-2'
          }`}
        />
      ))}
    </div>
  )
}

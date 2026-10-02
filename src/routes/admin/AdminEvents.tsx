import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { useStore } from '../../state/store'
import { GUILDS } from '../../data/seed'
import type { EventInput } from '../../lib/live'
import type { GuildEvent, Role } from '../../types'
import { dateWithYear, timeRange } from '../../lib/format'
import { Button, Card, EmptyState, Field, SectionTitle, inputClass } from '../../components/ui'
import { BackHeader } from '../../components/BackHeader'
import { Pencil, Plus, Trash2, X } from 'lucide-react'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'manager', label: 'General Managers' },
  { value: 'director', label: 'Directors' },
  { value: 'p_and_c', label: 'People & Culture' },
]

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value: string): string {
  return new Date(value).toISOString()
}

const BLANK: EventInput = {
  title: '',
  description: '',
  startsAt: '',
  endsAt: '',
  location: '',
  visibility: { kind: 'all' },
  createdById: '',
}

export function AdminEvents() {
  const { user } = useAuth()
  const { events, createEvent, editEvent, removeEvent } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EventInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upcoming = useMemo(
    () => [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [events],
  )

  if (!user) return null

  function startCreate() {
    setEditingId('new')
    setForm({ ...BLANK, createdById: user!.id })
    setError(null)
  }

  function startEdit(ev: GuildEvent) {
    setEditingId(ev.id)
    setForm({
      title: ev.title,
      description: ev.description,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      location: ev.location,
      visibility: ev.visibility,
      createdById: ev.createdById || user!.id,
    })
    setError(null)
  }

  function cancel() {
    setEditingId(null)
    setForm(null)
  }

  async function save() {
    if (!form) return
    if (!form.title.trim() || !form.startsAt || !form.endsAt) {
      setError('Title, start and finish are all required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId === 'new') await createEvent(form)
      else if (editingId) await editEvent(editingId, form)
      cancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the event.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    await removeEvent(id).catch((err) => setError(err instanceof Error ? err.message : 'Could not delete.'))
  }

  return (
    <div className="rise space-y-5 md:mx-auto md:max-w-3xl">
      <BackHeader title="Events" to="/more" />
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">Post events to the team calendar and set who sees them.</p>
        {!form && (
          <Button size="md" onClick={startCreate}>
            <Plus size={16} /> New event
          </Button>
        )}
      </div>

      {form && (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="label">{editingId === 'new' ? 'New event' : 'Edit event'}</p>
            <button onClick={cancel} className="text-ink-faint hover:text-ink" aria-label="Cancel">
              <X size={18} />
            </button>
          </div>
          <Field label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Guild Hall — Autumn Induction"
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts">
              <input
                type="datetime-local"
                className={inputClass}
                value={form.startsAt ? toLocalInput(form.startsAt) : ''}
                onChange={(e) => setForm({ ...form, startsAt: fromLocalInput(e.target.value) })}
              />
            </Field>
            <Field label="Finishes">
              <input
                type="datetime-local"
                className={inputClass}
                value={form.endsAt ? toLocalInput(form.endsAt) : ''}
                onChange={(e) => setForm({ ...form, endsAt: fromLocalInput(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. The Pembroke Arms — Guild Hall"
            />
          </Field>
          <Field label="Who can see this" hint="Admins and directors can always see everything.">
            <div className="flex flex-wrap gap-2">
              <VisibilityChip
                active={form.visibility.kind === 'all'}
                onClick={() => setForm({ ...form, visibility: { kind: 'all' } })}
              >
                Everyone
              </VisibilityChip>
              {ROLE_OPTIONS.map((r) => (
                <VisibilityChip
                  key={r.value}
                  active={form.visibility.kind === 'role' && form.visibility.role === r.value}
                  onClick={() => setForm({ ...form, visibility: { kind: 'role', role: r.value } })}
                >
                  {r.label}
                </VisibilityChip>
              ))}
              {GUILDS.map((g) => (
                <VisibilityChip
                  key={g.id}
                  active={form.visibility.kind === 'guild' && form.visibility.guildId === g.id}
                  onClick={() => setForm({ ...form, visibility: { kind: 'guild', guildId: g.id } })}
                >
                  {g.nickname} only
                </VisibilityChip>
              ))}
            </div>
          </Field>
          {error && <p className="text-sm text-[#e2867f]">{error}</p>}
          <Button size="lg" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save event'}
          </Button>
        </Card>
      )}

      <section>
        <SectionTitle>All events</SectionTitle>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing posted yet" hint="New events you create will show up here and on the Events tab." />
        ) : (
          <Card className="divide-y divide-line-soft">
            {upcoming.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{ev.title}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {dateWithYear(ev.startsAt)} · {timeRange(ev.startsAt, ev.endsAt)} · {ev.location}
                  </p>
                </div>
                <button onClick={() => startEdit(ev)} className="text-ink-faint hover:text-ink" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(ev.id)}
                  className="text-ink-faint hover:text-[#e2867f]"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  )
}

function VisibilityChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'border-gold/50 bg-gold-wash text-ink' : 'border-line bg-surface-2 text-ink-faint'
      }`}
    >
      {children}
    </button>
  )
}

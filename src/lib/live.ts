// Live Supabase queries — the real-data equivalents of src/data/seed.ts.
// Used once Supabase is configured; every function here talks to the actual
// database, so results reflect what's really in Chickpea's tenant, not sample
// content. Feed and Chat have no tables yet and stay on seed data regardless.

import { supabase } from './supabase'
import type {
  AwardStatus,
  Behaviour,
  GuildDocument,
  GuildEvent,
  Member,
  PillarKey,
  Role,
  SparkAward,
} from '../types'

const AVATAR_PALETTE = [
  '#6E1423', '#C64A1F', '#2E5A88', '#1F7A6B', '#8A6D3B', '#4A5468', '#B3122E', '#2E7D5B',
]

/** Deterministic colour from a person's id, since the DB doesn't store one. */
function colourFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

function must() {
  if (!supabase) throw new Error('Supabase is not configured — check .env')
  return supabase
}

// ---------- profiles -> members ---------------------------------------------
interface ProfileRow {
  id: string
  first_name: string
  last_name: string
  email: string
  guild_id: string | null
  site: string | null
  job_role: string | null
  role: Role
  start_date: string | null
  active: boolean
}

function rowToMember(row: ProfileRow): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    guildId: row.guild_id ?? '',
    site: row.site ?? 'Unassigned',
    jobRole: row.job_role ?? 'Unassigned',
    role: row.role,
    startDate: row.start_date ?? new Date().toISOString().slice(0, 10),
    active: row.active,
    avatarColour: colourFor(row.id),
  }
}

export async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await must().from('profiles').select('*').order('first_name')
  if (error) throw error
  return (data ?? []).map(rowToMember)
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const { data, error } = await must().from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToMember(data) : null
}

// ---------- behaviours (real UUIDs — do not reuse seed.ts string ids) -------
interface BehaviourRow {
  id: string
  pillar: PillarKey
  title: string
  detail: string | null
  points: number
  auto_award: boolean
  active: boolean
}

function rowToBehaviour(row: BehaviourRow): Behaviour {
  return {
    id: row.id,
    pillar: row.pillar,
    title: row.title,
    detail: row.detail ?? undefined,
    points: row.points,
    autoAward: row.auto_award,
    active: row.active,
  }
}

export async function fetchBehaviours(): Promise<Behaviour[]> {
  const { data, error } = await must()
    .from('behaviours')
    .select('*')
    .eq('active', true)
    .order('sort')
  if (error) throw error
  return (data ?? []).map(rowToBehaviour)
}

// ---------- the sparks ledger -------------------------------------------------
interface AwardRow {
  id: string
  member_id: string
  guild_id: string
  behaviour_id: string
  pillar: PillarKey
  points: number
  note: string
  evidence_url: string | null
  status: AwardStatus
  nominated_by: string | null
  decided_by: string | null
  decided_at: string | null
  occurred_on: string
  created_at: string
}

function rowToAward(row: AwardRow): SparkAward {
  return {
    id: row.id,
    memberId: row.member_id,
    guildId: row.guild_id,
    behaviourId: row.behaviour_id,
    pillar: row.pillar,
    points: row.points,
    note: row.note,
    evidenceUrl: row.evidence_url ?? undefined,
    status: row.status,
    nominatedById: row.nominated_by,
    decidedById: row.decided_by,
    decidedAt: row.decided_at,
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
  }
}

export async function fetchAwards(): Promise<SparkAward[]> {
  const { data, error } = await must()
    .from('spark_awards')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToAward)
}

export async function insertNomination(input: {
  memberId: string
  guildId: string
  behaviourId: string
  pillar: PillarKey
  points: number
  note: string
  occurredOn: string
  nominatedById: string
}): Promise<void> {
  const { error } = await must()
    .from('spark_awards')
    .insert({
      member_id: input.memberId,
      guild_id: input.guildId,
      behaviour_id: input.behaviourId,
      pillar: input.pillar,
      points: input.points,
      note: input.note,
      status: 'pending',
      nominated_by: input.nominatedById,
      occurred_on: input.occurredOn,
    })
  if (error) throw error
}

export async function decideAward(
  awardId: string,
  status: Exclude<AwardStatus, 'pending'>,
  decidedById: string,
): Promise<void> {
  const { error } = await must()
    .from('spark_awards')
    .update({ status, decided_by: decidedById, decided_at: new Date().toISOString() })
    .eq('id', awardId)
  if (error) throw error
}

// ---------- events -------------------------------------------------------------
interface EventRow {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string | null
  created_by: string | null
  visibility: 'all' | 'role' | 'guild'
  visible_role: Role | null
  visible_guild: string | null
}

function rowToEvent(row: EventRow): GuildEvent {
  const visibility: GuildEvent['visibility'] =
    row.visibility === 'role' && row.visible_role
      ? { kind: 'role', role: row.visible_role }
      : row.visibility === 'guild' && row.visible_guild
        ? { kind: 'guild', guildId: row.visible_guild }
        : { kind: 'all' }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location ?? '',
    createdById: row.created_by ?? '',
    visibility,
  }
}

export async function fetchEvents(): Promise<GuildEvent[]> {
  const { data, error } = await must().from('events').select('*').order('starts_at')
  if (error) throw error
  return (data ?? []).map(rowToEvent)
}

export interface EventInput {
  title: string
  description: string
  startsAt: string
  endsAt: string
  location: string
  visibility: GuildEvent['visibility']
  createdById: string
}

function visibilityColumns(v: GuildEvent['visibility']) {
  return {
    visibility: v.kind,
    visible_role: v.kind === 'role' ? v.role : null,
    visible_guild: v.kind === 'guild' ? v.guildId : null,
  }
}

export async function insertEvent(input: EventInput): Promise<void> {
  const { error } = await must().from('events').insert({
    title: input.title,
    description: input.description,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    location: input.location,
    created_by: input.createdById,
    ...visibilityColumns(input.visibility),
  })
  if (error) throw error
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  const { error } = await must()
    .from('events')
    .update({
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      location: input.location,
      ...visibilityColumns(input.visibility),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await must().from('events').delete().eq('id', id)
  if (error) throw error
}

// ---------- documents ----------------------------------------------------------
interface DocumentRow {
  id: string
  title: string
  category: string
  storage_path: string
  size_label: string | null
  updated_at: string
}

function rowToDocument(row: DocumentRow): GuildDocument {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    updatedAt: row.updated_at.slice(0, 10),
    fileUrl: row.storage_path,
    sizeLabel: row.size_label ?? '',
  }
}

export async function fetchDocuments(): Promise<GuildDocument[]> {
  const { data, error } = await must().from('documents').select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToDocument)
}

const DOCS_BUCKET = 'documents'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export async function uploadDocument(input: {
  file: File
  title: string
  category: string
  uploadedById: string
}): Promise<void> {
  const client = must()
  const path = `${crypto.randomUUID()}-${input.file.name}`
  const { error: uploadError } = await client.storage.from(DOCS_BUCKET).upload(path, input.file)
  if (uploadError) throw uploadError

  const { error } = await client.from('documents').insert({
    title: input.title,
    category: input.category,
    storage_path: path,
    size_label: `${input.file.name.split('.').pop()?.toUpperCase() ?? 'FILE'} · ${formatBytes(input.file.size)}`,
    uploaded_by: input.uploadedById,
  })
  if (error) {
    await client.storage.from(DOCS_BUCKET).remove([path]) // don't leave an orphaned file
    throw error
  }
}

export async function documentDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await must()
    .storage.from(DOCS_BUCKET)
    .createSignedUrl(storagePath, 60 * 10) // 10 minutes
  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(id: string, storagePath: string): Promise<void> {
  const client = must()
  const { error } = await client.from('documents').delete().eq('id', id)
  if (error) throw error
  await client.storage.from(DOCS_BUCKET).remove([storagePath])
}

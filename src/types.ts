// Domain types for the Guilds app. These mirror the planned Supabase schema so
// that swapping the seed-data layer for real queries is a drop-in change.

export type Role =
  | 'member'
  | 'manager' // General Manager
  | 'p_and_c' // People & Culture admin — approves nominations, runs the scheme
  | 'director'
  | 'super_admin'

export type PillarKey = 'people' | 'content' | 'environment' | 'engagement'

export interface Pillar {
  key: PillarKey
  name: string
  colour: string
  /** Which annual Guild Cup category this pillar decides. */
  cupAward: string
  blurb: string
}

export interface Guild {
  id: string
  name: string // "The Guild of Stokers"
  nickname: string // "The Stoked"
  colour: string
  motto: string
}

export interface Behaviour {
  id: string
  pillar: PillarKey
  title: string
  detail?: string
  points: number
  /** Awarded automatically (training, service) vs. by nomination. */
  autoAward: boolean
  active: boolean
}

export type AwardStatus = 'pending' | 'approved' | 'rejected'

export interface SparkAward {
  id: string
  /** Person the sparks are for. */
  memberId: string
  guildId: string
  behaviourId: string
  pillar: PillarKey
  points: number
  note: string
  evidenceUrl?: string
  status: AwardStatus
  nominatedById: string | null // null = automatic
  decidedById?: string | null
  decidedAt?: string | null
  occurredOn: string // ISO date
  createdAt: string // ISO datetime
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  guildId: string
  site: string
  jobRole: string
  role: Role
  startDate: string // ISO date — drives years-of-service sparks
  active: boolean
  avatarColour: string
}

export type EventVisibility =
  | { kind: 'all' }
  | { kind: 'role'; role: Role }
  | { kind: 'guild'; guildId: string }

export interface GuildEvent {
  id: string
  title: string
  description: string
  startsAt: string // ISO datetime
  endsAt: string // ISO datetime
  location: string
  createdById: string
  visibility: EventVisibility
}

export interface PollOption {
  id: string
  label: string
  votes: string[] // memberIds
}

export interface FeedComment {
  id: string
  authorId: string
  at: string
  body: string
}

export interface FeedPost {
  id: string
  authorId: string
  postedAt: string
  body: string
  /** Human-readable audience label, e.g. "Everyone", "The Silver Plough", "The Strikers". */
  audience: string
  tag?: string
  pinned?: boolean
  mustRead?: boolean
  /** Decorative colour block stands in for an image in the demo. */
  imageTint?: string
  reactions: Record<string, string[]> // emoji -> memberIds
  comments: FeedComment[]
  poll?: { question: string; options: PollOption[] }
}

export type ChannelKind = 'pub' | 'guild' | 'management' | 'group'

export interface ChatChannel {
  id: string
  kind: ChannelKind
  name: string
  members: number
  lastAt: string
  preview: string
  unread?: number
}

export interface ChatMessage {
  id: string
  channelId: string
  authorId: string
  at: string
  body: string
}

export interface GuildDocument {
  id: string
  title: string
  category: string
  updatedAt: string // ISO date
  /** Storage path once wired to Supabase; placeholder for now. */
  fileUrl: string
  sizeLabel: string
}

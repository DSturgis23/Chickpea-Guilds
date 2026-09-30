import type {
  Behaviour,
  ChatChannel,
  ChatMessage,
  FeedPost,
  Guild,
  GuildDocument,
  GuildEvent,
  Member,
  Pillar,
  SparkAward,
} from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Guilds — working names from the JD deck (slides 14–15). All editable later in
// the admin portal; the 6th (Storm Chasers) is a proposed replacement.
// ─────────────────────────────────────────────────────────────────────────────
export const GUILDS: Guild[] = [
  { id: 'stokers', name: 'The Guild of Stokers', nickname: 'The Stoked', colour: '#F2762E', motto: 'Keep the fire fed.' },
  { id: 'pyros', name: 'The Guild of Pyrotechnicians', nickname: 'The Pyros', colour: '#E23A4E', motto: 'Make it a spectacle.' },
  { id: 'stormchasers', name: 'The Guild of Meteorologists', nickname: 'The Storm Chasers', colour: '#6E7BEA', motto: 'Read the room, ride the front.' },
  { id: 'strikers', name: 'The Guild of Matchmakers', nickname: 'The Strikers', colour: '#43B98A', motto: 'One strike, one light.' },
  { id: 'gunners', name: 'The Guild of Musketeers', nickname: 'The Gunners', colour: '#9AA3B2', motto: 'All for one.' },
  { id: 'hammers', name: 'The Guild of Blacksmiths', nickname: 'The Hammers', colour: '#C98A46', motto: 'Strike while it’s hot.' },
]

// Falls back to a neutral placeholder rather than throwing — real accounts can
// exist for a moment with no guild yet (not allocated, or allocation pending).
const UNASSIGNED_GUILD: Guild = {
  id: '',
  name: 'Not yet allocated',
  nickname: 'Unassigned',
  colour: '#8d7f6f',
  motto: 'Guild allocation happens automatically on onboarding.',
}
export const guildById = (id: string) => GUILDS.find((g) => g.id === id) ?? UNASSIGNED_GUILD

// ─────────────────────────────────────────────────────────────────────────────
// Pillars — the four spark categories (deck slide 16 + glossary).
// ─────────────────────────────────────────────────────────────────────────────
export const PILLARS: Pillar[] = [
  {
    key: 'people',
    name: 'People',
    colour: '#6BA7E0',
    cupAward: 'Spark Starter',
    blurb: 'Training, cross-skilling, qualifications, service and bringing others in.',
  },
  {
    key: 'content',
    name: 'Content',
    colour: '#E0B84A',
    cupAward: 'Detail Spark',
    blurb: 'Events, menu ideas, supplier engagement and telling the Chickpea story.',
  },
  {
    key: 'environment',
    name: 'Environment',
    colour: '#4FBF8B',
    cupAward: 'Rural Spark',
    blurb: 'Energy efficiency and making our iconic spaces better than we found them.',
  },
  {
    key: 'engagement',
    name: 'Engagement',
    colour: '#E2564A',
    cupAward: 'Guest Spark',
    blurb: 'Memorable guest moments, Come Back Soons and giving back to the community.',
  },
]

export const pillarByKey = (key: string) => PILLARS.find((p) => p.key === key)!

// ─────────────────────────────────────────────────────────────────────────────
// Behaviours & spark values — lifted verbatim from deck slide 16.
// ─────────────────────────────────────────────────────────────────────────────
export const BEHAVIOURS: Behaviour[] = [
  // People
  { id: 'p-training', pillar: 'people', title: 'Completed all online training modules', points: 50, autoAward: true, active: true },
  { id: 'p-induction', pillar: 'people', title: 'Passed induction training', points: 50, autoAward: true, active: true },
  { id: 'p-crosstrain', pillar: 'people', title: 'Cross-trained in another department', points: 100, autoAward: false, active: true },
  { id: 'p-referral', pillar: 'people', title: 'Referred a new starter', points: 100, autoAward: false, active: true },
  { id: 'p-sports', pillar: 'people', title: 'Played for a Chickpea sports team', points: 100, autoAward: false, active: true },
  { id: 'p-qual', pillar: 'people', title: 'Gained a professional qualification', detail: 'e.g. WSET, apprenticeship', points: 200, autoAward: false, active: true },
  { id: 'p-service', pillar: 'people', title: 'Every year of service', points: 50, autoAward: true, active: true },
  // Content
  { id: 'c-event', pillar: 'content', title: 'Led an event', points: 100, autoAward: false, active: true },
  { id: 'c-menu', pillar: 'content', title: 'Enhanced menu content', detail: 'e.g. a dish that goes on every pub menu', points: 100, autoAward: false, active: true },
  { id: 'c-supplier', pillar: 'content', title: 'Engaged with suppliers', detail: 'e.g. attending a Quarr Cross visit', points: 100, autoAward: false, active: true },
  { id: 'c-social', pillar: 'content', title: 'Created a social media post', points: 100, autoAward: false, active: true },
  // Environment
  { id: 'e-energy', pillar: 'environment', title: 'Championed an energy-efficiency measure', points: 200, autoAward: false, active: true },
  { id: 'e-tidy', pillar: 'environment', title: 'Enhanced a pub environment', detail: 'e.g. deadheading a rose bush', points: 100, autoAward: false, active: true },
  { id: 'e-refurb', pillar: 'environment', title: 'Contributed to a refurb', points: 500, autoAward: false, active: true },
  { id: 'e-christmas', pillar: 'environment', title: 'Decorated the pubs at Christmas', points: 300, autoAward: false, active: true },
  // Engagement
  { id: 'g-volunteer', pillar: 'engagement', title: 'Volunteered with Wiltshire Community Foundation', points: 200, autoAward: false, active: true },
  { id: 'g-moment', pillar: 'engagement', title: 'Created a memorable guest moment', points: 100, autoAward: false, active: true },
  { id: 'g-cbs', pillar: 'engagement', title: 'Delivered the most Come Back Soons', points: 100, autoAward: false, active: true },
]

export const behaviourById = (id: string) => BEHAVIOURS.find((b) => b.id === id)!

// ─────────────────────────────────────────────────────────────────────────────
// Sites — the 12 Chickpea venues (from the group's other dashboards) + Group.
// ─────────────────────────────────────────────────────────────────────────────
export const SITES: string[] = [
  'The Pembroke Arms',
  'The Grosvenor Arms',
  'The Silver Plough',
  'The Queens Head',
  'The Bell and Crown',
  'The Dog and Gun Inn',
  'The Manor House Inn',
  'The Fleur De Lys',
  'The Kings Arms',
  'The Market Tavern',
  'The Great Decoy',
  'Nole on the Square',
  'The Engine Room',
]

export const JOB_ROLES: string[] = [
  'Front of House',
  'Bar',
  'Chef',
  'Kitchen Porter',
  'Supervisor',
  'Assistant Manager',
  'General Manager',
  'Area Manager',
  'People & Culture',
  'Marketing',
  'Director',
]

// ─────────────────────────────────────────────────────────────────────────────
// Demo members. The two super_admins are real; the rest are illustrative so the
// leaderboards and nominate flow have something to show before Supabase is wired.
// ─────────────────────────────────────────────────────────────────────────────
const AV = ['#6E1423', '#C64A1F', '#2E5A88', '#1F7A6B', '#8A6D3B', '#4A5468', '#B3122E', '#2E7D5B']

export const MEMBERS: Member[] = [
  { id: 'u-delilah', firstName: 'Delilah', lastName: 'Sturgis', email: 'delilah@chickpea.group', guildId: 'strikers', site: 'The Engine Room', jobRole: 'Marketing', role: 'super_admin', startDate: '2024-02-01', active: true, avatarColour: AV[0] },
  { id: 'u-jordan', firstName: 'Jordan', lastName: 'Doe', email: 'jordan@chickpea.group', guildId: 'gunners', site: 'The Engine Room', jobRole: 'People & Culture', role: 'super_admin', startDate: '2022-09-01', active: true, avatarColour: AV[5] },
  { id: 'u-ethan', firstName: 'Ethan', lastName: 'Doe', email: 'ethan@chickpea.group', guildId: 'stokers', site: 'The Engine Room', jobRole: 'Managing Director', role: 'director', startDate: '2019-05-01', active: true, avatarColour: AV[1] },
  { id: 'u-tommy', firstName: 'Tommy', lastName: 'Doe', email: 'tommy@chickpea.group', guildId: 'pyros', site: 'The Engine Room', jobRole: 'Creative Director', role: 'director', startDate: '2019-05-01', active: true, avatarColour: AV[6] },
  { id: 'u-amara', firstName: 'Amara', lastName: 'Bell', email: 'amara.bell@chickpea.group', guildId: 'stormchasers', site: 'The Grosvenor Arms', jobRole: 'General Manager', role: 'manager', startDate: '2021-03-15', active: true, avatarColour: AV[2] },
  { id: 'u-callum', firstName: 'Callum', lastName: 'Reid', email: 'callum.reid@chickpea.group', guildId: 'hammers', site: 'The Silver Plough', jobRole: 'General Manager', role: 'manager', startDate: '2020-11-02', active: true, avatarColour: AV[4] },
  { id: 'u-priya', firstName: 'Priya', lastName: 'Shah', email: 'priya.shah@chickpea.group', guildId: 'strikers', site: 'The Pembroke Arms', jobRole: 'Chef', role: 'member', startDate: '2023-06-01', active: true, avatarColour: AV[3] },
  { id: 'u-liam', firstName: 'Liam', lastName: 'Ford', email: 'liam.ford@chickpea.group', guildId: 'stokers', site: 'The Pembroke Arms', jobRole: 'Bar', role: 'member', startDate: '2025-01-20', active: true, avatarColour: AV[7] },
  { id: 'u-nina', firstName: 'Nina', lastName: 'Okafor', email: 'nina.okafor@chickpea.group', guildId: 'gunners', site: 'The Queens Head', jobRole: 'Front of House', role: 'member', startDate: '2024-08-11', active: true, avatarColour: AV[2] },
  { id: 'u-sam', firstName: 'Sam', lastName: 'Whitlock', email: 'sam.whitlock@chickpea.group', guildId: 'pyros', site: 'The Bell and Crown', jobRole: 'Supervisor', role: 'member', startDate: '2022-04-04', active: true, avatarColour: AV[1] },
  { id: 'u-erin', firstName: 'Erin', lastName: 'Davies', email: 'erin.davies@chickpea.group', guildId: 'stormchasers', site: 'The Dog and Gun Inn', jobRole: 'Assistant Manager', role: 'member', startDate: '2021-09-27', active: true, avatarColour: AV[3] },
  { id: 'u-omar', firstName: 'Omar', lastName: 'Haines', email: 'omar.haines@chickpea.group', guildId: 'hammers', site: 'The Manor House Inn', jobRole: 'Chef', role: 'member', startDate: '2023-02-13', active: true, avatarColour: AV[5] },
  { id: 'u-bea', firstName: 'Bea', lastName: 'Marsh', email: 'bea.marsh@chickpea.group', guildId: 'strikers', site: 'The Fleur De Lys', jobRole: 'Front of House', role: 'member', startDate: '2025-05-06', active: true, avatarColour: AV[6] },
  { id: 'u-theo', firstName: 'Theo', lastName: 'Nash', email: 'theo.nash@chickpea.group', guildId: 'stokers', site: 'The Kings Arms', jobRole: 'Bar', role: 'member', startDate: '2020-07-19', active: true, avatarColour: AV[0] },
]

export const memberById = (id: string) => MEMBERS.find((m) => m.id === id)!
export const memberName = (id: string) => {
  const m = memberById(id)
  return `${m.firstName} ${m.lastName}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo spark awards — deterministically generated so month / financial-year
// leaderboards and the approvals queue all have realistic data.
// ─────────────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildAwards(): SparkAward[] {
  const rnd = mulberry32(20260907)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]
  const activeMembers = MEMBERS.filter((m) => m.active)
  const nominatable = BEHAVIOURS.filter((b) => b.active && !b.autoAward)
  const awards: SparkAward[] = []
  // Anchor on the real "now" so the current month always has fresh activity,
  // however long after the build date the demo is shown.
  const now = new Date()
  now.setUTCHours(9, 0, 0, 0)
  let seq = 0

  const add = (memberId: string, daysAgo: number, forcePending?: boolean) => {
    const member = memberById(memberId)
    const behaviour = pick(nominatable)
    const occurred = new Date(now.getTime() - daysAgo * 86400000)
    // Everything older than a week is settled. Within the last week, roughly
    // half of the nominations are still waiting on People & Culture — that's
    // what fills the approvals queue.
    const pending = forcePending ?? (daysAgo <= 6 && rnd() < 0.35)
    awards.push({
      id: `a-${seq++}`,
      memberId: member.id,
      guildId: member.guildId,
      behaviourId: behaviour.id,
      pillar: behaviour.pillar,
      points: behaviour.points,
      note: pick(NOTES[behaviour.pillar]),
      status: pending ? 'pending' : 'approved',
      nominatedById: pick(MEMBERS).id,
      decidedById: pending ? null : 'u-jordan',
      decidedAt: pending ? null : occurred.toISOString(),
      occurredOn: occurred.toISOString().slice(0, 10),
      createdAt: occurred.toISOString(),
    })
  }

  // Full financial year of history, denser over the last few weeks so the
  // current month's leaderboards and Bright Spark race look alive even when the
  // financial year (and so this demo's "now") is only a few days old.
  const today = now.getUTCDate()
  for (let daysAgo = 1; daysAgo <= 380; daysAgo += 1) {
    let perDay = rnd() < 0.5 ? 1 : rnd() < 0.55 ? 2 : rnd() < 0.6 ? 3 : 0
    if (daysAgo <= 30) perDay += 2
    if (daysAgo < today) perDay += 6 + Math.floor(rnd() * 5) // current month fill
    for (let k = 0; k < perDay; k += 1) add(pick(activeMembers).id, daysAgo)
  }

  // Guarantee every seeded person has a personal track record, including a few
  // sparks this month, so any demo login lands on a populated profile.
  for (const m of activeMembers) {
    const count = 5 + Math.floor(rnd() * 8)
    for (let i = 0; i < count; i += 1) {
      const daysAgo = 1 + Math.floor(rnd() * (i < 3 ? 25 : 300))
      add(m.id, daysAgo)
    }
  }

  // A predictable handful of fresh nominations for the approvals demo.
  for (let i = 0; i < 7; i += 1) {
    add(pick(activeMembers).id, 1 + Math.floor(rnd() * 5), true)
  }

  return awards.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const NOTES: Record<string, string[]> = {
  people: [
    'Covered a shift at another pub at short notice and trained two new starters.',
    'Mentored the new commis through their first three weeks on the section.',
    'Finished the WSET Level 2 in their own time and is already sharing tasting notes.',
    'Talked a friend into applying — they start front of house next month.',
    'Ten years in this month and still setting the standard on a Friday night.',
  ],
  content: [
    'Wrote up the Quarr Cross visit and shared photos with every site.',
    'Their pickled walnut dish has gone onto every pub menu this autumn.',
    'Ran the harvest supper single-handed — sold out and rebooked on the night.',
    'Shot and posted the reel that pulled the biggest weekend of bookings all year.',
    'Built the new bar prep guide — every site is using it now.',
  ],
  environment: [
    'Championed switching the cellar cooling — a measurable drop in energy use.',
    'Pulled the whole garden back into shape before the bank holiday rush.',
    'Led on the snug refurb: sourced the reclaimed timber and project-managed it.',
    'Had the pub looking magical for the Christmas switch-on.',
    'Sorted the recycling store and got the whole team composting kitchen waste.',
  ],
  engagement: [
    'Went out of their way to make a regular’s anniversary genuinely special.',
    'Spent a Saturday volunteering with the Wiltshire Community Foundation.',
    'Most Come Back Soons in the group two months running.',
    'Remembered a guest’s late father’s usual order and left it as a surprise.',
    'Organised the quiz night that packed the snug on a wet Tuesday.',
  ],
}

export const AWARDS: SparkAward[] = buildAwards()

// ─────────────────────────────────────────────────────────────────────────────
// Demo events & documents.
// ─────────────────────────────────────────────────────────────────────────────
export const EVENTS: GuildEvent[] = [
  { id: 'ev-1', title: 'Guild Hall — Autumn Induction', description: 'New starters across the group meet in the Regency Room (the Guild Hall). Guild jackets handed out.', startsAt: '2026-09-11T10:00:00Z', endsAt: '2026-09-11T15:00:00Z', location: 'The Pembroke Arms — Guild Hall', createdById: 'u-jordan', visibility: { kind: 'all' } },
  { id: 'ev-2', title: 'WSET Level 2 — Session 1', description: 'First of six wine sessions. Sparks awarded on completion of the qualification.', startsAt: '2026-09-18T13:00:00Z', endsAt: '2026-09-18T17:00:00Z', location: 'The Pembroke Arms — Guild Hall', createdById: 'u-jordan', visibility: { kind: 'all' } },
  { id: 'ev-3', title: 'GM Forum — Q3', description: 'Quarterly General Managers meeting. Guild scheme standing item.', startsAt: '2026-09-24T09:30:00Z', endsAt: '2026-09-24T12:00:00Z', location: 'The Grosvenor Arms', createdById: 'u-jordan', visibility: { kind: 'role', role: 'manager' } },
  { id: 'ev-4', title: 'Guild Council — meeting 2 of 4', description: 'Guild ambassadors + People & Culture. Review spark scoring and any contentious nominations.', startsAt: '2026-10-02T14:00:00Z', endsAt: '2026-10-02T16:00:00Z', location: 'The Pembroke Arms — Guild Hall', createdById: 'u-jordan', visibility: { kind: 'all' } },
  { id: 'ev-5', title: 'Quarr Cross supplier visit', description: 'Kitchen teams welcome. Content sparks for attending and writing it up.', startsAt: '2026-10-09T09:00:00Z', endsAt: '2026-10-09T13:00:00Z', location: 'Quarr Cross Farm', createdById: 'u-jordan', visibility: { kind: 'all' } },
]

// ─────────────────────────────────────────────────────────────────────────────
// Demo newsfeed — targeted company posts, a pinned notice, reactions, comments,
// and a poll. Shows the comms side of the app (the "Blink-lite" pitch).
// ─────────────────────────────────────────────────────────────────────────────
const dayAgo = (n: number) =>
  new Date(Date.now() - n * 86400000 - 3600000 * 4).toISOString()

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'fp-pin',
    authorId: 'u-jordan',
    postedAt: dayAgo(1),
    tag: 'Notice',
    pinned: true,
    mustRead: true,
    audience: 'Everyone',
    body: 'Autumn menu launches Monday across every pub. Allergen matrices are in Documents — please read the changes to the pies and the new alliums line before service. Managers, brief your teams Sunday night.',
    reactions: { '👍': ['u-amara', 'u-callum', 'u-priya', 'u-theo'], '🙌': ['u-nina'] },
    comments: [
      { id: 'c1', authorId: 'u-callum', at: dayAgo(1), body: 'Silver Plough team briefed. Prep list updated.' },
    ],
  },
  {
    id: 'fp-1',
    authorId: 'u-tommy',
    postedAt: dayAgo(2),
    tag: 'Well done',
    audience: 'Everyone',
    imageTint: '#C98A46',
    body: 'The harvest supper at the Grosvenor sold out in a night and the photos are all over local Instagram. Huge from Amara and the team — that is exactly the kind of Content spark the Guilds are for.',
    reactions: { '🔥': ['u-jordan', 'u-ethan', 'u-priya', 'u-sam', 'u-omar'], '👏': ['u-nina', 'u-bea', 'u-liam'] },
    comments: [],
  },
  {
    id: 'fp-poll',
    authorId: 'u-delilah',
    postedAt: dayAgo(3),
    tag: 'Your say',
    audience: 'Everyone',
    body: 'Guild Cup night — where should we hold it this year? One vote each, closes Friday.',
    reactions: {},
    comments: [
      { id: 'c2', authorId: 'u-erin', at: dayAgo(2), body: 'Brewery every time.' },
    ],
    poll: {
      question: 'Guild Cup venue 2027',
      options: [
        { id: 'o1', label: 'St Austell Brewery', votes: ['u-erin', 'u-omar', 'u-sam', 'u-theo', 'u-nina'] },
        { id: 'o2', label: 'The Guild Hall, Pembroke Arms', votes: ['u-priya', 'u-bea'] },
        { id: 'o3', label: 'A marquee at the Grosvenor', votes: ['u-callum', 'u-amara', 'u-liam'] },
      ],
    },
  },
  {
    id: 'fp-2',
    authorId: 'u-callum',
    postedAt: dayAgo(4),
    tag: 'Silver Plough',
    audience: 'The Silver Plough',
    body: 'Cellar cooling swap is done — new setpoints on the board. Any drop in line quality, tell me straight away. Energy sparks logged for whoever pushed for this.',
    reactions: { '👍': ['u-jordan', 'u-omar'] },
    comments: [],
  },
  {
    id: 'fp-3',
    authorId: 'u-jordan',
    postedAt: dayAgo(6),
    tag: 'Guilds',
    audience: 'Everyone',
    body: 'September Bright Spark standings are live on the leaderboard. Storm Chasers have pulled ahead on Engagement — Detail Spark is still wide open. Nominate the people you see doing it well.',
    reactions: { '⚡': ['u-erin', 'u-amara'], '👍': ['u-priya', 'u-theo', 'u-bea'] },
    comments: [],
  },
  {
    id: 'fp-4',
    authorId: 'u-amara',
    postedAt: dayAgo(8),
    tag: 'General Managers',
    audience: 'General Managers',
    body: 'Q3 GM Forum agenda is in the calendar. Bring your labour numbers and one idea to raise guild participation on your site.',
    reactions: { '👍': ['u-callum'] },
    comments: [],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Demo chat — channels + one readable thread. A preview of the messaging idea,
// not a working chat build.
// ─────────────────────────────────────────────────────────────────────────────
export const CHAT_CHANNELS: ChatChannel[] = [
  { id: 'ch-pembroke', kind: 'pub', name: 'The Pembroke Arms', members: 24, lastAt: dayAgo(0), preview: 'Priya: covers are up to 78 for tonight', unread: 3 },
  { id: 'ch-strikers', kind: 'guild', name: 'The Strikers', members: 71, lastAt: dayAgo(0), preview: 'Bea: nominated Omar for the refurb 👏', unread: 1 },
  { id: 'ch-gms', kind: 'management', name: 'General Managers', members: 12, lastAt: dayAgo(1), preview: 'Amara: labour report attached' },
  { id: 'ch-grosvenor', kind: 'pub', name: 'The Grosvenor Arms', members: 19, lastAt: dayAgo(1), preview: 'Amara: great work on the supper everyone' },
  { id: 'ch-kitchen', kind: 'group', name: 'Kitchen — all sites', members: 33, lastAt: dayAgo(2), preview: 'Omar: new alliums spec — see the doc' },
  { id: 'ch-council', kind: 'guild', name: 'Guild Council', members: 7, lastAt: dayAgo(3), preview: 'Jordan: agenda for meeting 2' },
]

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', channelId: 'ch-pembroke', authorId: 'u-liam', at: dayAgo(0), body: 'Morning all — deliveries are in, wine order short by two cases of the Picpoul.' },
  { id: 'm2', channelId: 'ch-pembroke', authorId: 'u-priya', at: dayAgo(0), body: 'Noted. I’ll call the rep. Covers are up to 78 for tonight, two large tables at 8.' },
  { id: 'm3', channelId: 'ch-pembroke', authorId: 'u-theo', at: dayAgo(0), body: 'Can someone bring the spare card machine down from the office? Ours is playing up.' },
  { id: 'm4', channelId: 'ch-pembroke', authorId: 'u-priya', at: dayAgo(0), body: 'On it. Also — great service last night team, three Come Back Soons in one shift 🔥' },
  { id: 'm5', channelId: 'ch-strikers', authorId: 'u-bea', at: dayAgo(0), body: 'Just nominated Omar for the snug refurb — that reclaimed bar back is unreal 👏' },
  { id: 'm6', channelId: 'ch-strikers', authorId: 'u-erin', at: dayAgo(0), body: 'Seconded. We’re only 1,400 back on the Cup, keep it coming.' },
]

export const DOCUMENTS: GuildDocument[] = [
  { id: 'doc-1', title: 'Team Handbook 2026', category: 'Handbooks', updatedAt: '2026-08-01', fileUrl: '#', sizeLabel: 'PDF · 2.4 MB' },
  { id: 'doc-2', title: 'Guilds Programme — How Sparks Work', category: 'Guilds', updatedAt: '2026-08-20', fileUrl: '#', sizeLabel: 'PDF · 640 KB' },
  { id: 'doc-3', title: 'Allergen & Dietary Policy', category: 'Policies', updatedAt: '2026-06-14', fileUrl: '#', sizeLabel: 'PDF · 810 KB' },
  { id: 'doc-4', title: 'Holiday & Absence Policy', category: 'Policies', updatedAt: '2026-05-02', fileUrl: '#', sizeLabel: 'PDF · 520 KB' },
  { id: 'doc-5', title: 'Cellar & Line-Cleaning SOP', category: 'Operations', updatedAt: '2026-07-11', fileUrl: '#', sizeLabel: 'PDF · 1.1 MB' },
  { id: 'doc-6', title: 'Guild Hall Booking Form', category: 'Guilds', updatedAt: '2026-08-28', fileUrl: '#', sizeLabel: 'DOCX · 90 KB' },
]

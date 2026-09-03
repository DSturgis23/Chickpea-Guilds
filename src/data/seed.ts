import type {
  Behaviour,
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
  { id: 'stokers', name: 'The Guild of Stokers', nickname: 'The Stoked', colour: '#C64A1F', motto: 'Keep the fire fed.' },
  { id: 'pyros', name: 'The Guild of Pyrotechnicians', nickname: 'The Pyros', colour: '#B3122E', motto: 'Make it a spectacle.' },
  { id: 'stormchasers', name: 'The Guild of Meteorologists', nickname: 'The Storm Chasers', colour: '#2E5A88', motto: 'Read the room, ride the front.' },
  { id: 'strikers', name: 'The Guild of Matchmakers', nickname: 'The Strikers', colour: '#1F7A6B', motto: 'One strike, one light.' },
  { id: 'gunners', name: 'The Guild of Musketeers', nickname: 'The Gunners', colour: '#4A5468', motto: 'All for one.' },
  { id: 'hammers', name: 'The Guild of Blacksmiths', nickname: 'The Hammers', colour: '#8A6D3B', motto: 'Strike while it’s hot.' },
]

export const guildById = (id: string) => GUILDS.find((g) => g.id === id)!

// ─────────────────────────────────────────────────────────────────────────────
// Pillars — the four spark categories (deck slide 16 + glossary).
// ─────────────────────────────────────────────────────────────────────────────
export const PILLARS: Pillar[] = [
  {
    key: 'people',
    name: 'People',
    colour: '#3B6FB0',
    cupAward: 'Spark Starter',
    blurb: 'Training, cross-skilling, qualifications, service and bringing others in.',
  },
  {
    key: 'content',
    name: 'Content',
    colour: '#C9A227',
    cupAward: 'Detail Spark',
    blurb: 'Events, menu ideas, supplier engagement and telling the Chickpea story.',
  },
  {
    key: 'environment',
    name: 'Environment',
    colour: '#2E7D5B',
    cupAward: 'Rural Spark',
    blurb: 'Energy efficiency and making our iconic spaces better than we found them.',
  },
  {
    key: 'engagement',
    name: 'Engagement',
    colour: '#C0392B',
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
  'Chickpea Group (Head Office)',
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
  { id: 'u-delilah', firstName: 'Delilah', lastName: 'Sturgis', email: 'delilah@chickpea.group', guildId: 'strikers', site: 'Chickpea Group (Head Office)', jobRole: 'Marketing', role: 'super_admin', startDate: '2024-02-01', active: true, avatarColour: AV[0] },
  { id: 'u-jordan', firstName: 'Jordan', lastName: 'Doe', email: 'jordan@chickpea.group', guildId: 'gunners', site: 'Chickpea Group (Head Office)', jobRole: 'People & Culture', role: 'super_admin', startDate: '2022-09-01', active: true, avatarColour: AV[5] },
  { id: 'u-ethan', firstName: 'Ethan', lastName: 'Doe', email: 'ethan@chickpea.group', guildId: 'stokers', site: 'Chickpea Group (Head Office)', jobRole: 'Managing Director', role: 'director', startDate: '2019-05-01', active: true, avatarColour: AV[1] },
  { id: 'u-tommy', firstName: 'Tommy', lastName: 'Doe', email: 'tommy@chickpea.group', guildId: 'pyros', site: 'Chickpea Group (Head Office)', jobRole: 'Creative Director', role: 'director', startDate: '2019-05-01', active: true, avatarColour: AV[6] },
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

export const DOCUMENTS: GuildDocument[] = [
  { id: 'doc-1', title: 'Team Handbook 2026', category: 'Handbooks', updatedAt: '2026-08-01', fileUrl: '#', sizeLabel: 'PDF · 2.4 MB' },
  { id: 'doc-2', title: 'Guilds Programme — How Sparks Work', category: 'Guilds', updatedAt: '2026-08-20', fileUrl: '#', sizeLabel: 'PDF · 640 KB' },
  { id: 'doc-3', title: 'Allergen & Dietary Policy', category: 'Policies', updatedAt: '2026-06-14', fileUrl: '#', sizeLabel: 'PDF · 810 KB' },
  { id: 'doc-4', title: 'Holiday & Absence Policy', category: 'Policies', updatedAt: '2026-05-02', fileUrl: '#', sizeLabel: 'PDF · 520 KB' },
  { id: 'doc-5', title: 'Cellar & Line-Cleaning SOP', category: 'Operations', updatedAt: '2026-07-11', fileUrl: '#', sizeLabel: 'PDF · 1.1 MB' },
  { id: 'doc-6', title: 'Guild Hall Booking Form', category: 'Guilds', updatedAt: '2026-08-28', fileUrl: '#', sizeLabel: 'DOCX · 90 KB' },
]

import { GUILDS, PILLARS } from '../data/seed'
import { GuildCrest } from '../components/GuildCrest'
import { Card, SectionTitle } from '../components/ui'
import { BackHeader } from '../components/BackHeader'

const GLOSSARY: [string, string][] = [
  ['Craft', 'A skill, activity or profession. At Chickpea, hospitality is our craft.'],
  ['Guild', 'A group of like-minded people who share the same craft.'],
  ['Friction', 'The behaviours that lead to sparks.'],
  ['Spark', 'The points earned.'],
  ['Bright Spark', 'The individual who earned the most points in a month.'],
  ['Guild Cup', 'The guild with the most points in the year — Guild of the Year.'],
  ['Brightest Spark', 'The individual who earned the most points in the year — a Dream Team place.'],
  ['Kindling', 'The person who made the biggest impact in a short space of time.'],
]

export function About() {
  return (
    <div className="rise space-y-5 md:mx-auto md:max-w-3xl">
      <BackHeader title="How Guilds work" to="/more" />

      <Card className="p-4">
        <p className="text-sm text-ink-soft">
          Everyone at Chickpea is automatically placed in one of six guilds. You earn{' '}
          <b>sparks</b> for your guild through behaviours that hone the craft of
          hospitality. Guilds are recognised every month and every year.
        </p>
        <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Friction → Spark → Allocation → Recognition → Celebration
        </p>
      </Card>

      <section>
        <SectionTitle>The six guilds</SectionTitle>
        <Card className="divide-y divide-line-soft">
          {GUILDS.map((g) => (
            <div key={g.id} className="flex items-center gap-3 px-4 py-3">
              <GuildCrest guildId={g.id} size="md" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{g.nickname}</span>
                <span className="block text-xs text-ink-soft">
                  {g.name} · “{g.motto}”
                </span>
              </span>
            </div>
          ))}
        </Card>
        <p className="mt-2 px-1 text-xs text-ink-soft">
          Names are still being finalised by the Guild Council.
        </p>
      </section>

      <section>
        <SectionTitle>The four pillars</SectionTitle>
        <div className="space-y-2">
          {PILLARS.map((p) => (
            <Card key={p.key} className="p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-bold" style={{ color: p.colour }}>
                  {p.name}
                </p>
                <p className="text-xs text-ink-soft">Cup award: {p.cupAward}</p>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{p.blurb}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Glossary</SectionTitle>
        <Card className="divide-y divide-line-soft">
          {GLOSSARY.map(([term, def]) => (
            <div key={term} className="px-4 py-3">
              <p className="text-sm font-semibold">{term}</p>
              <p className="text-xs text-ink-soft">{def}</p>
            </div>
          ))}
        </Card>
      </section>
    </div>
  )
}

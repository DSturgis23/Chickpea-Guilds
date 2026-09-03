import { BEHAVIOURS, PILLARS } from '../../data/seed'
import { Card, SectionTitle } from '../../components/ui'
import { BackHeader } from '../../components/BackHeader'

export function Behaviours() {
  return (
    <div className="space-y-5">
      <BackHeader title="Behaviours & points" to="/more" />
      <p className="text-sm text-ink-soft">
        The behaviours that attract sparks and their values. Editing lands here once
        the admin portal is wired to the backend.
      </p>

      {PILLARS.map((p) => (
        <section key={p.key}>
          <SectionTitle>
            <span style={{ color: p.colour }}>{p.name}</span> — {p.cupAward}
          </SectionTitle>
          <Card className="divide-y divide-line">
            {BEHAVIOURS.filter((b) => b.pillar === p.key).map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1">
                  <span className="block text-sm font-medium">{b.title}</span>
                  {b.detail && (
                    <span className="block text-xs text-ink-soft">{b.detail}</span>
                  )}
                  <span className="mt-0.5 inline-block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    {b.autoAward ? 'Automatic' : 'By nomination'}
                  </span>
                </span>
                <span className="text-sm font-bold text-maroon">+{b.points}</span>
              </div>
            ))}
          </Card>
        </section>
      ))}
    </div>
  )
}

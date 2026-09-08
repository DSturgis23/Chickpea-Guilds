import { useMemo } from 'react'
import { DOCUMENTS } from '../data/seed'
import { dateWithYear } from '../lib/format'
import { Card, SectionTitle } from '../components/ui'
import { FileText as IconDoc } from 'lucide-react'
import { BackHeader } from '../components/BackHeader'

export function Documents() {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof DOCUMENTS>()
    for (const d of DOCUMENTS) {
      const arr = map.get(d.category) ?? []
      arr.push(d)
      map.set(d.category, arr)
    }
    return [...map.entries()]
  }, [])

  return (
    <div className="rise space-y-5">
      <BackHeader title="Documents" />
      <p className="text-sm text-ink-soft">
        Handbooks, policies and SOPs — always the current version.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
      {grouped.map(([category, docs]) => (
        <section key={category}>
          <SectionTitle>{category}</SectionTitle>
          <Card className="divide-y divide-line-soft">
            {docs.map((d) => (
              <a
                key={d.id}
                href={d.fileUrl}
                className="flex items-center gap-3 px-4 py-3 active:bg-paper-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-soft text-maroon">
                  <IconDoc width={20} height={20} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{d.title}</span>
                  <span className="block text-xs text-ink-soft">
                    {d.sizeLabel} · updated {dateWithYear(d.updatedAt)}
                  </span>
                </span>
              </a>
            ))}
          </Card>
        </section>
      ))}
      </div>
    </div>
  )
}

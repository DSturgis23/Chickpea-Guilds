import { useMemo } from 'react'
import { useStore } from '../state/store'
import { dateWithYear } from '../lib/format'
import { Card, EmptyState, SectionTitle } from '../components/ui'
import { FileText as IconDoc } from 'lucide-react'
import { BackHeader } from '../components/BackHeader'

export function Documents() {
  const { documents, getDocumentUrl } = useStore()
  const grouped = useMemo(() => {
    const map = new Map<string, typeof documents>()
    for (const d of documents) {
      const arr = map.get(d.category) ?? []
      arr.push(d)
      map.set(d.category, arr)
    }
    return [...map.entries()]
  }, [documents])

  async function open(fileUrl: string) {
    const url = await getDocumentUrl(fileUrl)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="rise space-y-5">
      <BackHeader title="Documents" />
      <p className="text-sm text-ink-soft">
        Handbooks, policies and SOPs — always the current version.
      </p>

      {documents.length === 0 ? (
        <EmptyState
          title="Nothing uploaded yet"
          hint="Handbooks and policies will appear here once People & Culture add them."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {grouped.map(([category, docs]) => (
            <section key={category}>
              <SectionTitle>{category}</SectionTitle>
              <Card className="divide-y divide-line-soft">
                {docs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => open(d.fileUrl)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-paper-2"
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
                  </button>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

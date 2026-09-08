import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/** Mobile-only page header with a back affordance. Desktop uses the top bar. */
export function BackHeader({ title, to }: { title: string; to?: string }) {
  const navigate = useNavigate()
  return (
    <div className="mb-4 flex items-center gap-2 md:hidden">
      <button
        onClick={() => (to ? navigate(to) : navigate(-1))}
        className="-ml-1 text-ink-soft transition-colors hover:text-ink"
        aria-label="Back"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="font-serif text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { IconArrowLeft } from './icons'

export function BackHeader({ title, to }: { title: string; to?: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => (to ? navigate(to) : navigate(-1))}
        className="-ml-1 text-ink-soft"
        aria-label="Back"
      >
        <IconArrowLeft width={22} height={22} />
      </button>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}

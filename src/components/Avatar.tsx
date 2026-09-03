import { memberById } from '../data/seed'
import { initials } from '../lib/format'

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-base',
}

export function Avatar({
  memberId,
  size = 'md',
}: {
  memberId: string
  size?: keyof typeof SIZES
}) {
  const m = memberById(memberId)
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZES[size]}`}
      style={{ backgroundColor: m.avatarColour }}
    >
      {initials(m.firstName, m.lastName)}
    </span>
  )
}

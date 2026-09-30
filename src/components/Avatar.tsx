import { memberById as seedMemberById } from '../data/seed'
import { useStore } from '../state/store'
import { initials } from '../lib/format'

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-base',
}

/**
 * Looks the person up in the live store first (real accounts), falling back to
 * seed data — Feed and Chat still reference seed-only people who have no
 * profile row yet, since those two features have no table of their own.
 */
export function Avatar({
  memberId,
  size = 'md',
}: {
  memberId: string
  size?: keyof typeof SIZES
}) {
  const { memberById } = useStore()
  const m = memberById(memberId) ?? seedMemberById(memberId)
  if (!m) return null
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZES[size]}`}
      style={{ backgroundColor: m.avatarColour }}
    >
      {initials(m.firstName, m.lastName)}
    </span>
  )
}

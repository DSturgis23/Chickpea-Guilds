import { guildById } from '../data/seed'

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

/**
 * Placeholder guild crest — a coloured shield with the nickname monogram.
 * Swap for real artwork by dropping files in /public and keying off guild.id.
 */
export function GuildCrest({
  guildId,
  size = 'md',
}: {
  guildId: string
  size?: keyof typeof SIZES
}) {
  const g = guildById(guildId)
  // Monogram from the craft name ("The Guild of Stokers" → "ST"); nicknames
  // collide (Stoked / Storm Chasers / Strikers all start "St").
  const craft = g.name.replace(/^The Guild of\s*/i, '')
  const monogram = craft.slice(0, 2).toUpperCase()
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[30%] font-black text-white shadow-inner ${SIZES[size]}`}
      style={{
        background: `linear-gradient(160deg, ${g.colour}, ${shade(g.colour, -18)})`,
      }}
      aria-label={g.name}
    >
      {monogram}
    </span>
  )
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((n >> 16) + amt)
  const gg = clamp(((n >> 8) & 0xff) + amt)
  const b = clamp((n & 0xff) + amt)
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0')}`
}

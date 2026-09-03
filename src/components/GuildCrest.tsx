import { guildById } from '../data/seed'
import stokers from '../assets/crests/stokers.png'
import pyros from '../assets/crests/pyros.png'
import stormchasers from '../assets/crests/stormchasers.png'
import strikers from '../assets/crests/strikers.png'
import gunners from '../assets/crests/gunners.png'
import hammers from '../assets/crests/hammers.png'

// Guild emblems — the symbols from the Guilds deck (furnace, firework burst,
// erupting storm, struck match, flintlock musket, anvil), processed to a white
// silhouette on transparent so they can be tinted to each guild's colour.
const EMBLEMS: Record<string, string> = {
  stokers,
  pyros,
  stormchasers,
  strikers,
  gunners,
  hammers,
}

const SIZES = { sm: 26, md: 40, lg: 66, xl: 112 }

export function GuildCrest({
  guildId,
  size = 'md',
  glow = false,
}: {
  guildId: string
  size?: keyof typeof SIZES
  glow?: boolean
}) {
  const g = guildById(guildId)
  const px = SIZES[size]
  const uid = `${guildId}-${size}`
  const small = px < 34
  const emblem = EMBLEMS[guildId]

  return (
    <svg
      width={px}
      height={px * 1.16}
      viewBox="0 0 100 116"
      className="shrink-0"
      aria-label={g.name}
      role="img"
    >
      <defs>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a332b" />
          <stop offset="0.5" stopColor="#251f18" />
          <stop offset="1" stopColor="#17130f" />
        </linearGradient>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dca0" />
          <stop offset="0.5" stopColor="#d9a94a" />
          <stop offset="1" stopColor="#8a6524" />
        </linearGradient>
        <radialGradient id={`enamel-${uid}`} cx="0.5" cy="0.4" r="0.62">
          <stop offset="0" stopColor={g.colour} stopOpacity="0.22" />
          <stop offset="1" stopColor={g.colour} stopOpacity="0" />
        </radialGradient>
        <mask id={`em-${uid}`} maskUnits="userSpaceOnUse">
          <image
            href={emblem}
            x="24"
            y="27"
            width="52"
            height="52"
            preserveAspectRatio="xMidYMid meet"
          />
        </mask>
        <filter id={`blur-${uid}`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation={small ? 1.8 : 3.4} />
        </filter>
      </defs>

      {glow && (
        <path d={SHIELD} fill={g.colour} opacity="0.3" filter={`url(#blur-${uid})`} />
      )}

      <path
        d={SHIELD}
        fill={`url(#metal-${uid})`}
        stroke={`url(#rim-${uid})`}
        strokeWidth={small ? 5 : 3.5}
      />
      {!small && (
        <path d={SHIELD_INNER} fill="none" stroke="#0d0a08" strokeWidth="1.25" opacity="0.5" />
      )}
      <path d={SHIELD} fill={`url(#enamel-${uid})`} />

      {!small && (
        <rect
          x="18"
          y="20"
          width="64"
          height="70"
          fill={g.colour}
          mask={`url(#em-${uid})`}
          filter={`url(#blur-${uid})`}
          opacity="0.75"
        />
      )}
      <rect x="18" y="20" width="64" height="70" fill={g.colour} mask={`url(#em-${uid})`} />
    </svg>
  )
}

const SHIELD = 'M50 4 L93 18 V57 C93 90 73 106 50 113 C27 106 7 90 7 57 V18 Z'
const SHIELD_INNER = 'M50 12 L86 23 V56 C86 83 70 97 50 104 C30 97 14 83 14 56 V23 Z'

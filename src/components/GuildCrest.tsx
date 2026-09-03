import { guildById } from '../data/seed'

const SIZES = { sm: 26, md: 40, lg: 66, xl: 112 }

/**
 * Heraldic guild crest — a forged-metal shield with a gold rim and the guild's
 * emblem glowing in its accent colour. Pure SVG, themeable, no image assets.
 */
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
          <stop offset="0" stopColor="#39322a" />
          <stop offset="0.5" stopColor="#231d17" />
          <stop offset="1" stopColor="#15110d" />
        </linearGradient>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dca0" />
          <stop offset="0.5" stopColor="#d9a94a" />
          <stop offset="1" stopColor="#8a6524" />
        </linearGradient>
        <radialGradient id={`enamel-${uid}`} cx="0.5" cy="0.42" r="0.65">
          <stop offset="0" stopColor={g.colour} stopOpacity="0.22" />
          <stop offset="1" stopColor={g.colour} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${uid}`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation={small ? 2 : 3.5} />
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
      {!small && <path d={SHIELD_INNER} fill="none" stroke="#0d0a08" strokeWidth="1.25" opacity="0.55" />}
      <path d={SHIELD} fill={`url(#enamel-${uid})`} />

      {!small && (
        <g filter={`url(#blur-${uid})`} opacity="0.85">
          <Emblem id={guildId} colour={g.colour} />
        </g>
      )}
      <Emblem id={guildId} colour={g.colour} />
    </svg>
  )
}

const SHIELD = 'M50 4 L93 18 V57 C93 90 73 106 50 113 C27 106 7 90 7 57 V18 Z'
const SHIELD_INNER = 'M50 12 L86 23 V56 C86 83 70 97 50 104 C30 97 14 83 14 56 V23 Z'

function Emblem({ id, colour }: { id: string; colour: string }) {
  const s = {
    fill: 'none',
    stroke: colour,
    strokeWidth: 7.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (id) {
    case 'stokers': // flame
      return (
        <g>
          <path
            d="M50 22 C62 38 78 48 70 68 C65 81 56 86 50 98 C44 86 35 81 30 68 C22 48 38 38 50 22 Z"
            fill={colour}
          />
          <path
            d="M50 46 C56 55 64 60 60 71 C58 78 54 80 50 87 C46 80 42 78 40 71 C36 60 44 55 50 46 Z"
            fill="#15110d"
            opacity="0.55"
          />
        </g>
      )
    case 'pyros': // firework burst
      return (
        <g {...s}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (Math.PI / 4) * i - Math.PI / 2
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * 13}
                y1={58 + Math.sin(a) * 13}
                x2={50 + Math.cos(a) * 33}
                y2={58 + Math.sin(a) * 33}
              />
            )
          })}
          <circle cx="50" cy="58" r="6" fill={colour} stroke="none" />
        </g>
      )
    case 'stormchasers': // lightning bolt
      return <path d="M58 20 L30 64 H47 L42 96 L72 48 H54 Z" fill={colour} />
    case 'strikers': // struck match
      return (
        <g transform="rotate(12 50 58)">
          <line x1="46" y1="96" x2="54" y2="46" {...s} strokeWidth={9} />
          <path
            d="M54 46 C48 34 56 24 54 14 C66 22 70 34 64 46 C61 52 57 51 54 46 Z"
            fill={colour}
          />
        </g>
      )
    case 'gunners': // crossed muskets
      return (
        <g {...s} strokeWidth={8}>
          <line x1="26" y1="92" x2="72" y2="28" />
          <line x1="74" y1="92" x2="28" y2="28" />
          <circle cx="50" cy="58" r="4.5" fill={colour} stroke="none" />
        </g>
      )
    case 'hammers': // blacksmith's hammer
      return (
        <g transform="rotate(-26 50 58)">
          <rect x="30" y="28" width="40" height="19" rx="4" fill={colour} />
          <line x1="50" y1="47" x2="50" y2="96" {...s} strokeWidth={10} />
        </g>
      )
    default:
      return <circle cx="50" cy="58" r="20" fill={colour} />
  }
}

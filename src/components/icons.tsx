import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const IconHome = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const IconTrophy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" />
    <path d="M10 14.5V18M14 14.5V18M8 21h8M9 18h6" />
  </svg>
)

export const IconSpark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 2.5c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6Z" />
  </svg>
)

export const IconCalendar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const IconGrid = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
)

export const IconDoc = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
)

export const IconUser = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
)

export const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6Z" />
  </svg>
)

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 12l5 5L20 6" />
  </svg>
)

export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconChevron = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6M9 12h11" />
  </svg>
)

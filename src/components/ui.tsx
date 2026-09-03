import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-line bg-surface ${
        onClick ? 'cursor-pointer transition-colors hover:border-ink-faint/40' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between px-0.5">
      <h2 className="label">{children}</h2>
      {action}
    </div>
  )
}

/** Editorial page heading — shown on mobile only; desktop uses the top bar. */
export function PageHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5 md:hidden">
      <h1 className="font-serif text-2xl font-semibold tracking-tight">{title}</h1>
      {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none'
  const sizes = {
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-base w-full',
  }
  const variants = {
    primary: 'bg-maroon text-white hover:bg-maroon-dark',
    secondary: 'border border-line bg-surface text-ink hover:bg-paper',
    ghost: 'text-maroon hover:bg-maroon-wash',
    danger: 'border border-[#e0bcc2] bg-surface text-[#98202f] hover:bg-[#f7ecee]',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export function Pill({
  children,
  colour,
  subtle = true,
}: {
  children: ReactNode
  colour: string
  subtle?: boolean
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={
        subtle
          ? { backgroundColor: `${colour}14`, color: colour }
          : { backgroundColor: colour, color: '#fff' }
      }
    >
      {children}
    </span>
  )
}

export function Bar({ value, max, colour }: { value: number; max: number; colour: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colour }} />
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/60 px-4 py-10 text-center">
      <p className="font-serif text-base font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="label mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm outline-none transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon-wash'

/** Segmented control used for period / view toggles. */
export function Toggle({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-line bg-paper-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`flex-1 rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === o.key ? 'bg-surface text-ink shadow-sm' : 'text-ink-faint hover:text-ink-soft'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

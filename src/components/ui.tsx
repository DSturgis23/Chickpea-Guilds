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
      className={`rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(36,26,23,0.04)] ${
        onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''
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
    <div className="mb-2 flex items-baseline justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
        {children}
      </h2>
      {action}
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
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none'
  const sizes = {
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-base w-full',
  }
  const variants = {
    primary: 'bg-maroon text-white active:bg-maroon-dark',
    secondary: 'bg-paper-2 text-ink active:bg-line',
    ghost: 'text-maroon active:bg-maroon-soft',
    danger: 'bg-white text-[#b3122e] border border-[#e7c3c9] active:bg-[#f7e9eb]',
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
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={
        subtle
          ? { backgroundColor: `${colour}1a`, color: colour }
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper-2">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colour }} />
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-maroon-soft'

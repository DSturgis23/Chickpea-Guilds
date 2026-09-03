import { Link } from 'react-router-dom'
import { isAdminRole, useAuth } from '../auth/AuthProvider'
import { useStore } from '../state/store'
import { Card, SectionTitle } from '../components/ui'
import {
  IconCheck,
  IconChevron,
  IconDoc,
  IconGrid,
  IconShield,
  IconSpark,
  IconUser,
} from '../components/icons'

export function More() {
  const { user, signOut } = useAuth()
  const { pendingCount } = useStore()
  if (!user) return null
  const admin = isAdminRole(user.role)

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">More</h1>

      <section>
        <SectionTitle>For everyone</SectionTitle>
        <Card className="divide-y divide-line">
          <Row to="/documents" icon={<IconDoc width={20} height={20} />} label="Documents" hint="Handbooks, policies, SOPs" />
          <Row to="/profile" icon={<IconUser width={20} height={20} />} label="Your profile" hint="Sparks, guild, details" />
          <Row to="/about" icon={<IconSpark width={20} height={20} />} label="How Guilds work" hint="Sparks, pillars, awards" />
        </Card>
      </section>

      {admin && (
        <section>
          <SectionTitle>People &amp; Culture</SectionTitle>
          <Card className="divide-y divide-line">
            <Row
              to="/admin/approvals"
              icon={<IconCheck width={20} height={20} />}
              label="Approvals"
              hint="Verify nominations before sparks are awarded"
              badge={pendingCount}
            />
            <Row to="/admin/behaviours" icon={<IconSpark width={20} height={20} />} label="Behaviours & points" hint="Add behaviours, amend spark values" />
            <Row to="/admin/people" icon={<IconUser width={20} height={20} />} label="People & guild allocation" hint="Add, move, re-allocate members" />
            <Row to="/admin/reports" icon={<IconGrid width={20} height={20} />} label="Reports" hint="Scoring by month, year, guild and pillar" />
          </Card>
        </section>
      )}

      <button
        onClick={signOut}
        className="w-full rounded-xl bg-paper-2 py-3 text-sm font-semibold text-ink active:bg-line"
      >
        Sign out
      </button>

      <p className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-ink-soft">
        <IconShield width={13} height={13} /> Chickpea Guilds · preview build
      </p>
    </div>
  )
}

function Row({
  to,
  icon,
  label,
  hint,
  badge,
}: {
  to: string
  icon: React.ReactNode
  label: string
  hint: string
  badge?: number
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 active:bg-paper-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-soft text-maroon">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-ink-soft">{hint}</span>
      </span>
      {badge ? (
        <span className="rounded-full bg-maroon px-2 py-0.5 text-xs font-bold text-white">
          {badge}
        </span>
      ) : null}
      <IconChevron width={18} height={18} className="text-ink-soft" />
    </Link>
  )
}

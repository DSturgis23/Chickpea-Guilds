import { Navigate, Route, Routes } from 'react-router-dom'
import { isAdminRole, useAuth } from './auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { Login } from './routes/Login'
import { Home } from './routes/Home'
import { Leaderboard } from './routes/Leaderboard'
import { Nominate } from './routes/Nominate'
import { Events } from './routes/Events'
import { More } from './routes/More'
import { Profile } from './routes/Profile'
import { Documents } from './routes/Documents'
import { About } from './routes/About'
import { Approvals } from './routes/admin/Approvals'
import { Behaviours } from './routes/admin/Behaviours'
import { People } from './routes/admin/People'
import { Reports } from './routes/admin/Reports'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdminRole(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/nominate" element={<Nominate />} />
        <Route path="/events" element={<Events />} />
        <Route path="/more" element={<More />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/admin/approvals"
          element={
            <RequireAdmin>
              <Approvals />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/behaviours"
          element={
            <RequireAdmin>
              <Behaviours />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/people"
          element={
            <RequireAdmin>
              <People />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAdmin>
              <Reports />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-cream)]">
        <div className="text-[color:var(--color-ink-mute)] text-sm">جارٍ التحميل…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/memorize'} replace />
  }

  return children
}

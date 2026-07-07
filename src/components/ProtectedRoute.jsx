import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingOverlay from './LoadingOverlay'

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingOverlay message="جارٍ التحميل" subtext="لحظات ونصلك إلى صفحتك" />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/memorize'} replace />
  }

  return children
}

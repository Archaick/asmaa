import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n/LangContext'
import LoadingOverlay from './LoadingOverlay'

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth()
  const { t } = useLang()
  const location = useLocation()

  if (loading) {
    return <LoadingOverlay message={t('loading.default')} subtext={t('loading.default_sub')} />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/memorize'} replace />
  }

  return children
}

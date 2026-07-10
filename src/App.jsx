import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './i18n/LangContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingOverlay from './components/LoadingOverlay'

// Public pages — small, load eagerly for fastest first paint
import Home from './pages/Home'
import Login from './pages/Login'

// Protected pages — lazy so unauthenticated visitors don't download them
const Memorize            = lazy(() => import('./pages/student/Memorize'))
const BouquetSession      = lazy(() => import('./pages/student/BouquetSession'))
const Achievements        = lazy(() => import('./pages/student/Achievements'))
const Journey             = lazy(() => import('./pages/student/Journey'))
const Welcome             = lazy(() => import('./pages/student/Welcome'))
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'))
const AdminStudents       = lazy(() => import('./pages/admin/Students'))
const AdminStudentDetail  = lazy(() => import('./pages/admin/StudentDetail'))
const AdminInbox          = lazy(() => import('./pages/admin/Inbox'))
const AdminContent        = lazy(() => import('./pages/admin/Content'))

const RouteFallback = <LoadingOverlay message="جارٍ التحميل" />

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={RouteFallback}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/memorize"
                element={
                  <ProtectedRoute>
                    <Memorize />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/welcome"
                element={
                  <ProtectedRoute>
                    <Welcome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/memorize/:bouquetId"
                element={
                  <ProtectedRoute>
                    <BouquetSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <Achievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journey"
                element={
                  <ProtectedRoute>
                    <Journey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/:id"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminStudentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inbox"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminInbox />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminContent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}

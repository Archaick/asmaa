import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './i18n/LangContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Memorize from './pages/student/Memorize'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminStudentDetail from './pages/admin/StudentDetail'
import AdminInbox from './pages/admin/Inbox'
import AdminContent from './pages/admin/Content'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/memorize/*"
              element={
                <ProtectedRoute>
                  <Memorize />
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
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin',            label: 'لوحة التحكم', icon: '🏠', end: true },
  { to: '/admin/students',   label: 'الطلاب',       icon: '👥' },
  { to: '/admin/inbox',      label: 'الرسائل',      icon: '📥' },
  { to: '/admin/content',    label: 'الأسماء',      icon: '📖' },
  { to: '/admin/curriculum', label: 'الدورات',      icon: '🎓' },
]

export default function AdminLayout({ title, subtitle, children }) {
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = user?.displayName || user?.email

  return (
    <div className="min-h-screen bg-[color:var(--color-cream-warm)] flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={
          'fixed lg:sticky top-0 h-screen w-64 bg-white border-s border-[color:var(--color-cream-deep)] flex flex-col z-50 transition-transform ' +
          (mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
        }
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[color:var(--color-cream-deep)]">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-sm text-[color:var(--color-ink)]">
                لوحة المشرف
              </div>
              <div className="text-[11px] text-[color:var(--color-ink-mute)]">
                مشروع أسماء الله الحسنى
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition mb-1 ' +
                (isActive
                  ? 'bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]'
                  : 'text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-warm)] hover:text-[color:var(--color-ink)]')
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[color:var(--color-cream-deep)]">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs font-bold text-[color:var(--color-ink)] truncate">{displayName}</div>
            <div className="text-[10px] text-[color:var(--color-ink-mute)]" dir="ltr">{user?.email}</div>
          </div>
          <button
            onClick={signOut}
            className="w-full px-3 py-2 rounded-xl text-sm font-bold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:bg-[color:var(--color-cream-warm)] transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[color:var(--color-ink)]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[color:var(--color-cream-warm)]/90 backdrop-blur border-b border-[color:var(--color-cream-deep)]">
          <div className="px-5 sm:px-8 py-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white transition"
              aria-label="القائمة"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--color-ink)] leading-tight">{title}</h1>
              {subtitle && <p className="text-sm text-[color:var(--color-ink-soft)]">{subtitle}</p>}
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  )
}

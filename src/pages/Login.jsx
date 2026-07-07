import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { t, lang, toggle } = useLang()
  const { user, role, loading, signInGoogle, signInEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from?.pathname

  useEffect(() => {
    if (!loading && user) {
      const dest = from || (role === 'admin' ? '/admin' : '/memorize')
      navigate(dest, { replace: true })
    }
  }, [user, role, loading, from, navigate])

  const humanError = (code, msg) => {
    const map = {
      'auth/invalid-credential': t('login.err.invalid'),
      'auth/wrong-password': t('login.err.invalid'),
      'auth/user-not-found': t('login.err.invalid'),
      'auth/invalid-email': t('login.err.email'),
      'auth/too-many-requests': t('login.err.too_many'),
      'auth/popup-closed-by-user': t('login.err.popup_closed'),
      'auth/network-request-failed': t('login.err.network'),
    }
    return map[code] || msg || t('login.err.generic')
  }

  const onGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await signInGoogle()
    } catch (e) {
      setError(humanError(e.code, e.message))
    } finally {
      setBusy(false)
    }
  }

  const onEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('login.err.fields'))
      return
    }
    setBusy(true)
    try {
      await signInEmail(email.trim(), password)
    } catch (err) {
      setError(humanError(err.code, err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--color-cream)]">
      {/* Top bar with logo + home link */}
      <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="hidden sm:inline font-display font-bold text-[color:var(--color-ink)]">
            {lang === 'ar' ? 'مشروع أسماء الله الحسنى' : 'The 99 Names of Allah'}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="px-3 py-1.5 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold-deep)] transition"
          >
            {t('nav.lang')}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:bg-[color:var(--color-cream-warm)] transition"
          >
            <span>{lang === 'ar' ? '←' : '→'}</span>
            {t('login.back_home')}
          </Link>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-5 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white border border-[color:var(--color-cream-deep)] rounded-3xl shadow-sm overflow-hidden">
            <div className="text-center px-8 pt-9 pb-6">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
                {t('login.title')}
              </h1>
              <p className="text-[color:var(--color-ink-soft)]">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Role tabs */}
            <div className="px-8">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[color:var(--color-cream-warm)] rounded-2xl">
                <TabButton active={tab === 'student'} onClick={() => setTab('student')}>
                  <span className="text-lg">🎓</span>
                  {t('login.tab.student')}
                </TabButton>
                <TabButton active={tab === 'staff'} onClick={() => setTab('staff')}>
                  <span className="text-lg">🕋</span>
                  {t('login.tab.staff')}
                </TabButton>
              </div>
            </div>

            {/* Form area */}
            <div className="px-8 py-7">
              {tab === 'student' ? (
                <StudentForm onGoogle={onGoogle} busy={busy} t={t} />
              ) : (
                <StaffForm
                  email={email} setEmail={setEmail}
                  password={password} setPassword={setPassword}
                  onSubmit={onEmailSubmit}
                  busy={busy}
                  t={t}
                />
              )}

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer hint */}
          <p className="mt-6 text-center text-xs text-[color:var(--color-ink-mute)]">
            {t('login.footer_hint')}
          </p>
        </div>
      </main>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ' +
        (active
          ? 'bg-white text-[color:var(--color-ink)] shadow-sm'
          : 'text-[color:var(--color-ink-mute)] hover:text-[color:var(--color-ink)]')
      }
    >
      {children}
    </button>
  )
}

function StudentForm({ onGoogle, busy, t }) {
  return (
    <div className="text-center">
      <p className="text-sm text-[color:var(--color-ink-soft)] mb-5">
        {t('login.student.hint')}
      </p>
      <GoogleButton onClick={onGoogle} busy={busy} t={t} label={t('login.google.primary')} />
    </div>
  )
}

function StaffForm({ email, setEmail, password, setPassword, onSubmit, busy, t }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-[color:var(--color-ink-soft)] mb-3 text-center">
        {t('login.staff.hint')}
      </p>
      <div>
        <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
          {t('login.email')}
        </label>
        <input
          type="email"
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-cream-deep)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition text-[color:var(--color-ink)] bg-[color:var(--color-cream)]"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
          {t('login.password')}
        </label>
        <input
          type="password"
          dir="ltr"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-cream-deep)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition text-[color:var(--color-ink)] bg-[color:var(--color-cream)]"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 rounded-xl font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] disabled:opacity-60 transition"
      >
        {busy ? t('login.busy') : t('login.email.primary')}
      </button>
    </form>
  )
}

function GoogleButton({ onClick, busy, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-xl font-semibold bg-white border-2 border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] text-[color:var(--color-ink)] disabled:opacity-60 transition shadow-sm"
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="#4285F4" d="M19.6 10.23c0-.71-.06-1.4-.18-2.05H10v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35z" />
      <path fill="#34A853" d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H1.05v2.6A9.99 9.99 0 0 0 10 20z" />
      <path fill="#FBBC05" d="M4.4 11.9c-.2-.6-.32-1.24-.32-1.9 0-.66.12-1.3.32-1.9V5.5H1.05a10 10 0 0 0 0 9l3.35-2.6z" />
      <path fill="#EA4335" d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.98 9.98 0 0 0 10 0 9.99 9.99 0 0 0 1.05 5.5l3.35 2.6C5.19 5.74 7.4 3.98 10 3.98z" />
    </svg>
  )
}

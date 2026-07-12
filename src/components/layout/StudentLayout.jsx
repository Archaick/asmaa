import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useMilestones } from '../../hooks/useMilestones'
import { useBouquetLessonProgress } from '../../hooks/useBouquetLessons'
import { useLang } from '../../i18n/LangContext'
import { TOTAL_NAMES } from '../../data/bouquets'
import { playChime, isSoundEnabled, setSoundEnabled } from '../../utils/chime'

export default function StudentLayout({ children, showProgress = false, backTo, leftSlot }) {
  const { user, signOut } = useAuth()
  const { memorizedCount, entries, memorized } = useProgress()
  const { milestones, streak } = useMilestones(entries, memorized, memorizedCount)
  const { completedCount: lessonsCompleted } = useBouquetLessonProgress()
  const { t, lang, toggle: toggleLang } = useLang()
  const [sound, setSound] = useState(() => isSoundEnabled())
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const unlocked = milestones.filter((m) => m.unlocked).length
  const pct = Math.round((memorizedCount / TOTAL_NAMES) * 100)
  const displayName = user?.displayName || user?.email

  const toggleSound = () => {
    const v = !sound
    setSound(v); setSoundEnabled(v)
    if (v) playChime()
  }

  // Close menu on outside click / escape
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-40 bg-[color:var(--color-cream)]/95 backdrop-blur border-b border-[color:var(--color-cream-deep)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-5">
          {/* Single row: logo · back · nav · avatar */}
          <div className="flex items-center gap-2 sm:gap-3 py-2.5">
            <div className="flex items-center gap-2 shrink-0">
              {leftSlot || (
                <Link to="/" className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden">
                    <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain" />
                  </div>
                </Link>
              )}
              {backTo && (
                <Link
                  to={backTo}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
                >
                  {lang === 'ar' ? '→' : '←'}
                </Link>
              )}
            </div>

            {/* Primary nav — 3 core destinations, always visible on mobile with labels */}
            <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-2">
              <NavTab to="/memorize" icon="🕋" label={t('student.nav.memorize')} end />
              <NavTab to="/curriculum" icon="🎓" label={t('student.nav.curriculum')} badge={lessonsCompleted > 0 ? `${lessonsCompleted}` : null} />
              <NavTab to="/achievements" icon="🏆" label={t('student.nav.achievements')} badge={unlocked ? `${unlocked}/${milestones.length}` : null} />
            </nav>

            {/* Avatar + dropdown */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full hover:ring-2 hover:ring-[color:var(--color-gold-soft)] transition"
                aria-label={displayName}
                aria-expanded={menuOpen}
              >
                <Avatar name={displayName} photoURL={user?.photoURL} />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     className={'text-[color:var(--color-ink-mute)] transition-transform ' + (menuOpen ? 'rotate-180' : '')}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  className="absolute end-0 mt-2 w-64 bg-white rounded-2xl border border-[color:var(--color-cream-deep)] shadow-xl overflow-hidden"
                >
                  {/* Identity */}
                  <div className="px-4 py-3 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
                    <div className="flex items-center gap-3">
                      <Avatar name={displayName} photoURL={user?.photoURL} big />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[color:var(--color-ink)] truncate">{displayName}</div>
                        {user?.email && <div className="text-[11px] text-[color:var(--color-ink-mute)] truncate" dir="ltr">{user.email}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Secondary destinations */}
                  <Link
                    to="/journey"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--color-cream-warm)] text-start text-sm"
                  >
                    <span className="text-lg w-6">🌙</span>
                    <span className="flex-1 font-semibold text-[color:var(--color-ink)]">
                      {t('student.nav.journey')}
                    </span>
                    {streak > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]">
                        {streak}
                      </span>
                    )}
                  </Link>

                  {/* Toggles */}
                  <button
                    type="button"
                    onClick={() => { toggleSound() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--color-cream-warm)] text-start text-sm border-t border-[color:var(--color-cream-deep)]"
                  >
                    <span className="text-lg w-6">{sound ? '🔔' : '🔕'}</span>
                    <span className="flex-1 font-semibold text-[color:var(--color-ink)]">
                      {sound ? t('student.header.sound_on_aria') : t('student.header.sound_off_aria')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { toggleLang(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--color-cream-warm)] text-start text-sm border-t border-[color:var(--color-cream-deep)]"
                  >
                    <span className="text-lg w-6">🌐</span>
                    <span className="flex-1 font-semibold text-[color:var(--color-ink)]">
                      {t('nav.lang')}
                    </span>
                  </button>

                  {/* Sign out */}
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); signOut() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-start text-sm border-t border-[color:var(--color-cream-deep)] text-red-700 font-semibold"
                  >
                    <span className="text-lg w-6">↩️</span>
                    <span className="flex-1">{t('student.header.signout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Optional progress bar */}
          {showProgress && (
            <div className="pb-3">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[10px] font-bold text-[color:var(--color-ink-soft)] uppercase tracking-wider">
                  📿 {t('student.header.progress_label')}
                </span>
                <span className="text-xs font-bold text-[color:var(--color-ink)]" dir="ltr">
                  {memorizedCount} / {TOTAL_NAMES} · {pct}%
                </span>
              </div>
              <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold) 40%, var(--color-teal) 100%)',
                    boxShadow: pct > 0 ? '0 0 8px rgba(184,148,78,0.35)' : 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}

function NavTab({ to, icon, label, badge, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ' +
        (isActive
          ? 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] shadow-sm'
          : 'text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-warm)] hover:text-[color:var(--color-ink)]')
      }
    >
      <span className="text-sm sm:text-base">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function Avatar({ name, photoURL, big }) {
  const size = big ? 'w-10 h-10 text-base' : 'w-9 h-9 text-sm'
  const initial = (name || '؟').trim()[0] || '؟'

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt=""
        referrerPolicy="no-referrer"
        className={size + ' rounded-full object-cover shrink-0 border-2 border-[color:var(--color-cream-deep)]'}
      />
    )
  }
  return (
    <div
      className={size + ' rounded-full flex items-center justify-center font-bold shrink-0 border-2 border-[color:var(--color-cream-deep)]'}
      style={{
        background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))',
        color: 'var(--color-ink)',
      }}
    >
      {initial}
    </div>
  )
}

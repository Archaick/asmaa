import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useMilestones } from '../../hooks/useMilestones'
import { TOTAL_NAMES } from '../../data/bouquets'
import { playChime, isSoundEnabled, setSoundEnabled } from '../../utils/chime'
import { useState } from 'react'

export default function StudentLayout({ children, showProgress = false, backTo, leftSlot }) {
  const { user, signOut } = useAuth()
  const { memorizedCount, entries, memorized } = useProgress()
  const { milestones, streak } = useMilestones(entries, memorized, memorizedCount)
  const [sound, setSound] = useState(() => isSoundEnabled())

  const unlocked = milestones.filter((m) => m.unlocked).length
  const pct = Math.round((memorizedCount / TOTAL_NAMES) * 100)
  const displayName = user?.displayName || user?.email

  const toggleSound = () => {
    const v = !sound
    setSound(v); setSoundEnabled(v)
    if (v) playChime()
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] flex flex-col" dir="rtl">
      <header className="sticky top-0 z-40 bg-[color:var(--color-cream)]/95 backdrop-blur border-b border-[color:var(--color-cream-deep)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-5">
          {/* Top row: logo + user actions */}
          <div className="flex items-center justify-between py-2.5 gap-3">
            <div className="flex items-center gap-2 min-w-0">
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
                >
                  → الوسيلة
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline text-xs text-[color:var(--color-ink-soft)] truncate max-w-[140px]">
                {displayName}
              </span>
              <button
                type="button" onClick={toggleSound}
                className="w-9 h-9 rounded-full hover:bg-[color:var(--color-cream-warm)] flex items-center justify-center transition"
                aria-label={sound ? 'إسكات' : 'تشغيل الصوت'}
              >{sound ? '🔔' : '🔕'}</button>
              <button
                type="button" onClick={signOut}
                className="px-3 py-1.5 rounded-full text-xs font-bold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
              >خروج</button>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center justify-center gap-1 sm:gap-2 pb-2 overflow-x-auto scrollbar-none">
            <NavTab to="/memorize" icon="🕋" label="الوسيلة" end />
            <NavTab to="/achievements" icon="🏆" label="الإنجازات" badge={unlocked ? `${unlocked}/${milestones.length}` : null} />
            <NavTab to="/journey" icon="🌙" label="رحلتي" badge={streak > 0 ? `${streak}` : null} />
          </nav>

          {/* Optional progress bar */}
          {showProgress && (
            <div className="pb-3">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[10px] font-bold text-[color:var(--color-ink-soft)] uppercase tracking-wider">
                  📿 تقدّمك في الوسيلة
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
        'inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ' +
        (isActive
          ? 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] shadow-sm'
          : 'text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-warm)] hover:text-[color:var(--color-ink)]')
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ms-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

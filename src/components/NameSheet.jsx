import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'

// NameSheet — the ceremonial modal for a single Name of Allah.
//
// UX principles:
//   • Commitment matters: no "unmark" here. The bouquet's Reset button is
//     the escape hatch, so a stray tap in the sheet can't undo learning.
//   • The primary action IS progression: tapping "حفظت — التالي" marks the
//     name memorized AND advances to the next name in a single move.
//   • Big, gold, top of the modal — never hidden.
//   • Every transition between names has a gentle pop so it feels playful,
//     not clinical.
export default function NameSheet({ name, isMemorized, onClose, onAdvance, onNav }) {
  const { t, lang } = useLang()
  const [glowing, setGlowing] = useState(false)

  useEffect(() => {
    document.body.style.overflow = name ? 'hidden' : ''
    const onKey = (e) => {
      if (!name) return
      if (e.key === 'Escape') onClose?.()
      // Arrow keys still allow non-committal review browsing
      if (e.key === 'ArrowLeft' && !name.isDua)  onNav?.(lang === 'ar' ? 'next' : 'prev')
      if (e.key === 'ArrowRight' && !name.isDua) onNav?.(lang === 'ar' ? 'prev' : 'next')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [name, onClose, onNav, lang])

  // Reset the glow flourish on every name change so it can fire fresh.
  useEffect(() => { setGlowing(false) }, [name?.id])

  if (!name) return null

  const handleAdvance = async () => {
    if (name.isDua) { onClose?.(); return }
    if (!isMemorized) {
      setGlowing(true)
      // Give the glow a beat to be seen, then advance and let the next name
      // bloom in — feels like a satisfying commitment moment, not a snap.
      setTimeout(() => onAdvance?.(), 340)
    } else {
      onAdvance?.()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[color:var(--color-ink)]/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] bg-[color:var(--color-cream)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[color:var(--color-cream-deep)] flex flex-col overflow-hidden animate-fade-in-up"
        dir="rtl"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--color-ink-soft)]">
            <span>
              {isMemorized ? t('name.badge.memorized') : name.isDua ? t('name.badge.dua') : t('name.badge.name')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/70 transition flex items-center justify-center text-[color:var(--color-ink-soft)]"
            aria-label={t('name.sheet.close_aria')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Content — re-mounts on every name change so it bloom-pops in */}
        <div key={name.id} className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 animate-fade-swap">
          {/* Name calligraphy — glows briefly when memorized */}
          <h2
            className={
              'font-serif text-5xl sm:text-6xl font-bold text-center text-[color:var(--color-ink)] mb-6 rounded-2xl ' +
              (glowing ? 'animate-name-glow' : '')
            }
          >
            {name.name}
          </h2>

          {/* Primary action — memorize + advance in one, top of content */}
          {!name.isDua && (
            <div className="mb-7">
              {isMemorized ? (
                <button
                  type="button"
                  onClick={handleAdvance}
                  className="w-full py-4 rounded-2xl text-base sm:text-lg font-bold bg-white border-2 border-[color:var(--color-teal)] text-[color:var(--color-teal-deep)] shadow-sm hover:shadow-md active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-lg">✓</span>
                  <span>{t('name.action.memorized_next')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={glowing}
                  className="w-full py-4 rounded-2xl text-base sm:text-lg font-bold text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))',
                  }}
                >
                  <span className="text-xl">🌟</span>
                  <span>{t('name.action.memorize_next')}</span>
                </button>
              )}
            </div>
          )}

          {/* Facets */}
          <Facet icon="💡" label={t('name.acts.meaning')} text={loc(name, 'meaning', lang)} accent="gold" />
          <Facet icon="🌟" label={t('name.acts.thanaa')} text={loc(name, 'thanaa',  lang)} accent="teal" />
          <Facet icon="🤲" label={t('name.acts.talab')}  text={loc(name, 'talab',   lang)} accent="gold" last />
        </div>
      </div>
    </div>
  )
}

function loc(name, field, lang) {
  if (lang === 'en') {
    const en = name[field + 'En']
    if (en && en.trim()) return en
  }
  return name[field] || ''
}

function Facet({ icon, label, text, accent, last }) {
  const color = accent === 'gold' ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)'
  return (
    <div className={'flex gap-3 ' + (last ? '' : 'pb-4 mb-4 border-b border-dashed border-[color:var(--color-cream-deep)]')}>
      <div className="text-xl shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color }}>
          {label}
        </div>
        <div className="text-base leading-relaxed text-[color:var(--color-ink)]">
          {text}
        </div>
      </div>
    </div>
  )
}

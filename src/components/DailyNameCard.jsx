import { useMemo } from 'react'
import { BOUQUETS } from '../data/bouquets'
import { useLang } from '../i18n/LangContext'

// Deterministic day-of-year index — same name for every student on the same calendar day.
// Cycles through all 99 names every 99 days (matches the wird التسعوني milestone).
function dayIndex() {
  return Math.floor(Date.now() / 86400000)
}

export default function DailyNameCard({ names, memorized, onOpen }) {
  const { t, lang } = useLang()

  const todayName = useMemo(() => {
    const real = names.filter((n) => !n.isDua)
    if (real.length === 0) return null
    return real[dayIndex() % real.length]
  }, [names])

  if (!todayName) return null

  const bouquet = BOUQUETS.find((b) => b.id === todayName.bouquet)
  const isGold = bouquet?.color === 'gold'
  const isMemorized = memorized.has(todayName.id)
  const meaning = pickLang(todayName, 'meaning', lang)

  return (
    <button
      type="button"
      onClick={() => onOpen(todayName.id)}
      className="w-full text-start group relative overflow-hidden rounded-3xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:shadow-xl transition-all mb-6 animate-fade-in-up"
      dir="rtl"
    >
      {/* Glow accent from the name's bouquet color */}
      <div
        className="absolute -top-16 -end-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-70"
        style={{ background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: isGold ? 'var(--color-gold)' : 'var(--color-teal)' }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{
                background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
              }}
            >
              ✨ {t('memorize.today.eyebrow')}
            </div>
            <div className="text-[11px] text-[color:var(--color-ink-mute)] mt-1.5">
              {bouquet?.title}
            </div>
          </div>
          {isMemorized && (
            <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-deep)] shrink-0">
              ✓ {t('name.badge.memorized')}
            </div>
          )}
        </div>

        <h2 className="font-serif text-5xl sm:text-6xl font-bold text-[color:var(--color-ink)] mb-3 leading-tight">
          {todayName.name}
        </h2>

        {meaning && (
          <p className="text-sm sm:text-base text-[color:var(--color-ink-soft)] leading-relaxed line-clamp-2 mb-4">
            {meaning}
          </p>
        )}

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--color-gold-deep)] group-hover:gap-2.5 transition-all">
          {t('memorize.today.cta_hint')} ←
        </div>
      </div>
    </button>
  )
}

function pickLang(obj, field, lang) {
  if (lang === 'en') {
    const en = obj[field + 'En']
    if (en && en.trim()) return en
  }
  return obj[field] || ''
}

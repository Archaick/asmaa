import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'

export default function BouquetTile({ bouquet, memorizedCount, total, complete }) {
  const { t, lang } = useLang()
  const isGold = bouquet.color === 'gold'
  const pct = total > 0 ? Math.round((memorizedCount / total) * 100) : 0
  const started = memorizedCount > 0

  const actionKey = complete ? 'bouquet.tile.review' : started ? 'bouquet.tile.continue' : 'bouquet.tile.start'

  return (
    <Link
      to={`/memorize/${bouquet.id}`}
      className="group block w-full relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white border transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="absolute -top-10 -end-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-70"
        style={{ background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />

      {complete && (
        <div className="absolute top-4 start-4 text-2xl animate-crown-shimmer" title={t('bouquet.tile.complete_hint')}>
          👑
        </div>
      )}

      <div className="relative">
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
        >
          {t('bouquet.tag')}
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--color-ink)] mb-4 leading-tight">
          {bouquet.title}
        </h3>

        <div className="flex items-center justify-between text-sm font-bold text-[color:var(--color-ink-soft)] mb-2">
          <span dir="ltr">{memorizedCount} / {total}</span>
          <span dir="ltr">{pct}%</span>
        </div>

        {/* The bouquet blooms — one flower per memorized name */}
        <FlowerStrip count={total} bloomed={memorizedCount} isGold={isGold} />

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-transform group-hover:-translate-x-1"
          style={{ background: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
        >
          {t(actionKey)} {lang === 'ar' ? '←' : '→'}
        </div>
      </div>
    </Link>
  )
}

// A strip of buds that bloom into flowers as names are memorized.
// The most recently bloomed flower pops in with a small bloom animation.
function FlowerStrip({ count, bloomed, isGold }) {
  const prevBloomedRef = useRef(bloomed)
  const [justBloomed, setJustBloomed] = useState(-1)

  useEffect(() => {
    if (bloomed > prevBloomedRef.current) {
      setJustBloomed(bloomed - 1)
      const to = setTimeout(() => setJustBloomed(-1), 700)
      prevBloomedRef.current = bloomed
      return () => clearTimeout(to)
    }
    prevBloomedRef.current = bloomed
  }, [bloomed])

  if (count <= 0) return null

  const color = isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)'

  return (
    <div className="flex flex-wrap items-center gap-1 mb-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const isBloomed = i < bloomed
        return (
          <span
            key={i}
            className={
              'inline-flex items-center justify-center w-5 h-5 text-sm leading-none select-none transition-all duration-300 ' +
              (i === justBloomed ? 'animate-flower-bloom' : '')
            }
            style={{
              color: isBloomed ? color : 'var(--color-cream-deep)',
              transform: isBloomed ? 'none' : 'scale(0.8)',
            }}
          >
            {isBloomed ? '✿' : '❀'}
          </span>
        )
      })}
    </div>
  )
}

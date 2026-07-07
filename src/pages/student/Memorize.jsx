import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH, TOTAL_NAMES } from '../../data/bouquets'
import { REAL_NAME_IDS } from '../../data/names99'
import NameSheet from '../../components/NameSheet'
import { GoldDivider } from '../../components/Ornament'

export default function Memorize() {
  const { user, signOut } = useAuth()
  const { memorized, memorizedCount, markMemorized, unmarkMemorized } = useProgress()
  const { names, byBouquet, findName } = useNames()
  const [openId, setOpenId] = useState(null)

  const openName = useMemo(() => findName(openId), [findName, openId])
  const isMemorized = openName ? memorized.has(openName.id) : false

  const orderedRealIds = REAL_NAME_IDS
  const currentIdx = openName ? orderedRealIds.indexOf(openName.id) : -1

  const nav = (dir) => {
    if (currentIdx < 0) return
    const next = dir === 'next' ? currentIdx + 1 : currentIdx - 1
    const wrapped = (next + orderedRealIds.length) % orderedRealIds.length
    setOpenId(orderedRealIds[wrapped])
  }

  const toggle = async () => {
    if (!openName) return
    if (isMemorized) await unmarkMemorized(openName.id)
    else await markMemorized(openName.id)
  }

  const displayName = user?.displayName || user?.email

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] flex flex-col">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-[color:var(--color-cream)]/90 backdrop-blur border-b border-[color:var(--color-cream-deep)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:inline font-bold text-[color:var(--color-ink)] text-sm">
              الوسيلة
            </span>
          </Link>

          <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4">
            <ProgressPill count={memorizedCount} total={TOTAL_NAMES} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-xs text-[color:var(--color-ink-soft)] truncate max-w-[140px]">
              {displayName}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="px-3 py-1.5 rounded-full text-xs font-bold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Opening hadith */}
          <HadithBlock hadith={OPENING_HADITH} label="حديث الافتتاح" />

          <GoldDivider />

          {/* Famous names — bouquet 0 */}
          <BouquetBlock
            bouquet={BOUQUETS[0]}
            names={byBouquet.famous || []}
            memorized={memorized}
            onOpen={setOpenId}
            variant="famous"
          />

          {/* 6 main bouquets (1-6) in a 2-col grid on desktop */}
          <div className="grid md:grid-cols-2 gap-5 mt-6">
            {BOUQUETS.slice(1, 7).map((b) => (
              <BouquetBlock
                key={b.id}
                bouquet={b}
                names={byBouquet[b.id] || []}
                memorized={memorized}
                onOpen={setOpenId}
              />
            ))}
          </div>

          {/* Closing 4 names */}
          <BouquetBlock
            bouquet={BOUQUETS[7]}
            names={byBouquet.khitam || []}
            memorized={memorized}
            onOpen={setOpenId}
            variant="row"
          />

          {/* 4 dua phrases */}
          <BouquetBlock
            bouquet={BOUQUETS[8]}
            names={byBouquet.duaa || []}
            memorized={memorized}
            onOpen={setOpenId}
            variant="dua"
          />

          <GoldDivider />

          {/* Closing hadith */}
          <HadithBlock hadith={CLOSING_HADITH} label="حديث الاختتام" />
        </div>
      </main>

      <NameSheet
        name={openName}
        isMemorized={isMemorized}
        onClose={() => setOpenId(null)}
        onToggleMemorized={toggle}
        onNav={nav}
      />
    </div>
  )
}

/* ─── Progress pill ─────────────────────────────────────────── */

function ProgressPill({ count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-[color:var(--color-cream-deep)] shadow-sm">
      <span className="text-lg">📿</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[color:var(--color-ink)]" dir="ltr">
          {count} / {total}
        </span>
        <div className="hidden sm:block w-24 h-1.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Hadith block ──────────────────────────────────────────── */

function HadithBlock({ hadith, label }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-2">
        {label}
      </div>
      <p className="font-serif text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink)]" dir="rtl">
        «{hadith.text}»
      </p>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{hadith.source}</p>
    </div>
  )
}

/* ─── Bouquet block ─────────────────────────────────────────── */

function BouquetBlock({ bouquet, names, memorized, onOpen, variant }) {
  const isGold = bouquet.color === 'gold'
  const memorizedInBouquet = names.filter((n) => memorized.has(n.id) && !n.isDua).length
  const totalRealInBouquet = names.filter((n) => !n.isDua).length

  return (
    <section
      className="relative p-5 sm:p-6 rounded-3xl border bg-white"
      style={{
        borderColor: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
      }}
      dir="rtl"
    >
      {/* Corner glow */}
      <div
        className="absolute -top-6 -end-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-50"
        style={{ background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}>
            {bouquet.isDua ? 'أدعية' : `الباقة`}
          </div>
          <h3 className="font-display font-bold text-lg text-[color:var(--color-ink)]">
            {bouquet.title}
          </h3>
        </div>
        {!bouquet.isDua && (
          <div className="text-xs font-bold text-[color:var(--color-ink-soft)]" dir="ltr">
            {memorizedInBouquet} / {totalRealInBouquet}
          </div>
        )}
      </div>

      {/* Optional "أنت الله" divider */}
      {!bouquet.isDua && bouquet.id !== 'famous' && bouquet.id !== 'khitam' && (
        <div className="relative text-center mb-3">
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-serif font-bold"
                style={{
                  background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                  color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
                }}>
            أنتَ الله
          </span>
        </div>
      )}

      {/* Grid */}
      <div className={
        variant === 'dua'
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
          : variant === 'famous'
            ? 'grid grid-cols-5 gap-2'
            : variant === 'row'
              ? 'grid grid-cols-4 gap-2'
              : 'grid grid-cols-5 gap-1.5'
      }>
        {names.map((n) => {
          const isMem = memorized.has(n.id)
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onOpen(n.id)}
              className={
                'relative rounded-lg font-serif font-bold text-center transition-all border-2 ' +
                (variant === 'dua'
                  ? 'text-sm px-3 py-3'
                  : variant === 'famous'
                    ? 'text-base sm:text-lg py-3 sm:py-4'
                    : 'text-sm sm:text-base py-2.5 sm:py-3') +
                ' ' +
                (isMem
                  ? (isGold
                      ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)]'
                      : 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]')
                  : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:-translate-y-0.5')
              }
            >
              {n.name}
              {isMem && <span className="absolute top-0.5 end-1 text-[10px]">✓</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH, TOTAL_NAMES } from '../../data/bouquets'
import NameSheet from '../../components/NameSheet'
import { GoldDivider } from '../../components/Ornament'
import { playChime, isSoundEnabled, setSoundEnabled } from '../../utils/chime'

const EXPANDED_KEY = 'asmaa.memorize.expanded'

export default function Memorize() {
  const { user, signOut } = useAuth()
  const { memorized, memorizedCount, markMemorized, unmarkMemorized } = useProgress()
  const { byBouquet, findName } = useNames()
  const [openId, setOpenId] = useState(null)
  const [sound, setSound] = useState(() => isSoundEnabled())
  const [openingExp, setOpeningExp] = useState(false)
  const [closingExp, setClosingExp] = useState(false)
  const [expanded, setExpanded] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(EXPANDED_KEY) || '{}')
      return typeof stored === 'object' && stored !== null ? stored : { jamia: true }
    } catch { return { jamia: true } }
  })

  useEffect(() => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded))
  }, [expanded])

  const openName = useMemo(() => findName(openId), [findName, openId])
  const isMemorized = openName ? memorized.has(openName.id) : false

  const toggleBouquet = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  const toggleMem = async () => {
    if (!openName) return
    if (isMemorized) {
      await unmarkMemorized(openName.id)
    } else {
      // Play immediately — don't wait for Firestore round-trip
      playChime()
      await markMemorized(openName.id)
    }
  }

  const nav = (dir) => {
    if (!openName) return
    // Navigate through real names (skip dua phrases)
    const realNames = BOUQUETS.filter((b) => !b.isDua).flatMap((b) => byBouquet[b.id] || [])
    const idx = realNames.findIndex((n) => n.id === openName.id)
    if (idx < 0) return
    const next = dir === 'next' ? idx + 1 : idx - 1
    const wrapped = (next + realNames.length) % realNames.length
    setOpenId(realNames[wrapped].id)
  }

  const toggleSound = () => {
    const newVal = !sound
    setSound(newVal)
    setSoundEnabled(newVal)
    if (newVal) playChime()
  }

  const displayName = user?.displayName || user?.email

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] flex flex-col">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-[color:var(--color-cream)]/95 backdrop-blur border-b border-[color:var(--color-cream-deep)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain" />
            </div>
          </Link>

          <div className="flex-1 mx-2">
            <BigProgress count={memorizedCount} total={TOTAL_NAMES} />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              className="w-9 h-9 rounded-full hover:bg-[color:var(--color-cream-warm)] flex items-center justify-center transition"
              title={sound ? 'إسكات' : 'تشغيل الصوت'}
              aria-label={sound ? 'إسكات' : 'تشغيل الصوت'}
            >
              {sound ? '🔔' : '🔕'}
            </button>
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

      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Opening hadith */}
          <CollapsibleHadith
            hadith={OPENING_HADITH}
            label="حديث الافتتاح"
            expanded={openingExp}
            onToggle={() => setOpeningExp(!openingExp)}
            accent="gold"
          />

          <GoldDivider />

          {/* Famous names — always visible */}
          <BouquetPanel
            bouquet={BOUQUETS[0]}
            names={byBouquet.famous || []}
            memorized={memorized}
            onOpen={setOpenId}
            variant="famous"
            alwaysOpen
          />

          {/* 6 main bouquets — collapsible */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {BOUQUETS.slice(1, 7).map((b) => (
              <BouquetPanel
                key={b.id}
                bouquet={b}
                names={byBouquet[b.id] || []}
                memorized={memorized}
                onOpen={setOpenId}
                isExpanded={!!expanded[b.id]}
                onToggle={() => toggleBouquet(b.id)}
              />
            ))}
          </div>

          {/* Closing 4 names — always visible */}
          <div className="mt-6">
            <BouquetPanel
              bouquet={BOUQUETS[7]}
              names={byBouquet.khitam || []}
              memorized={memorized}
              onOpen={setOpenId}
              variant="row"
              alwaysOpen
            />
          </div>

          {/* 4 dua phrases */}
          <div className="mt-6">
            <BouquetPanel
              bouquet={BOUQUETS[8]}
              names={byBouquet.duaa || []}
              memorized={memorized}
              onOpen={setOpenId}
              variant="dua"
              alwaysOpen
            />
          </div>

          <GoldDivider />

          {/* Closing hadith */}
          <CollapsibleHadith
            hadith={CLOSING_HADITH}
            label="حديث الاختتام"
            expanded={closingExp}
            onToggle={() => setClosingExp(!closingExp)}
            accent="teal"
          />
        </div>
      </main>

      <NameSheet
        name={openName}
        isMemorized={isMemorized}
        onClose={() => setOpenId(null)}
        onToggleMemorized={toggleMem}
        onNav={nav}
      />
    </div>
  )
}

/* ─── Big progress in the header ─────────────────────────── */

function BigProgress({ count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-lg sm:text-xl shrink-0">📿</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-[color:var(--color-ink-soft)] uppercase tracking-wider">
            تقدّمك في الوسيلة
          </span>
          <span className="text-xs sm:text-sm font-bold text-[color:var(--color-ink)]" dir="ltr">
            {count} / {total} · {pct}%
          </span>
        </div>
        <div className="h-2 sm:h-2.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold) 40%, var(--color-teal) 100%)',
              boxShadow: pct > 0 ? '0 0 10px rgba(184,148,78,0.4)' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Collapsible hadith ─────────────────────────────────── */

function CollapsibleHadith({ hadith, label, expanded, onToggle, accent }) {
  const isGold = accent === 'gold'
  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}>
          {label}
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={'transition-transform text-[color:var(--color-ink-mute)] ' + (expanded ? 'rotate-180' : '')}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2 p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] text-center animate-fade-in-up">
          <p className="font-serif text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink)]" dir="rtl">
            «{hadith.text}»
          </p>
          <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{hadith.source}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Bouquet panel (accordion header + name grid) ──────── */

function BouquetPanel({ bouquet, names, memorized, onOpen, isExpanded, onToggle, alwaysOpen, variant }) {
  const isGold = bouquet.color === 'gold'
  const realNames = names.filter((n) => !n.isDua)
  const memInBouquet = realNames.filter((n) => memorized.has(n.id)).length
  const totalInBouquet = realNames.length
  const pct = totalInBouquet > 0 ? (memInBouquet / totalInBouquet) * 100 : 0
  const complete = totalInBouquet > 0 && memInBouquet === totalInBouquet

  const open = alwaysOpen || isExpanded

  return (
    <section
      className="relative overflow-hidden rounded-3xl border bg-white transition-all"
      style={{
        borderColor: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
      }}
      dir="rtl"
    >
      {/* Corner glow */}
      <div
        className="absolute -top-8 -end-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-50"
        style={{ background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />

      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        disabled={alwaysOpen}
        className={
          'relative w-full text-start px-5 sm:px-6 pt-5 pb-3 ' +
          (alwaysOpen ? 'cursor-default' : 'hover:bg-[color:var(--color-cream-warm)]/50 cursor-pointer')
        }
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div
              className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
              style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
            >
              {bouquet.isDua ? 'أدعية' : 'الباقة'}
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[color:var(--color-ink)] truncate">
              {bouquet.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!bouquet.isDua && (
              <div className="flex items-center gap-1.5">
                {complete && <span className="text-lg">🌟</span>}
                <span className="text-sm font-bold text-[color:var(--color-ink)]" dir="ltr">
                  {memInBouquet}/{totalInBouquet}
                </span>
              </div>
            )}
            {!alwaysOpen && (
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={'transition-transform text-[color:var(--color-ink-mute)] ' + (open ? 'rotate-180' : '')}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
          </div>
        </div>

        {/* Per-bouquet progress bar */}
        {!bouquet.isDua && (
          <div className="h-1.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: isGold
                  ? 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))'
                  : 'linear-gradient(90deg, var(--color-teal-soft), var(--color-teal))',
              }}
            />
          </div>
        )}
      </button>

      {/* Names grid */}
      {open && (
        <div className="relative px-5 sm:px-6 pb-5 pt-3">
          {/* "أنت الله" pill for main bouquets */}
          {!bouquet.isDua && bouquet.id !== 'famous' && bouquet.id !== 'khitam' && (
            <div className="text-center mb-3">
              <span
                className="inline-block px-3 py-0.5 rounded-full text-xs font-serif font-bold"
                style={{
                  background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                  color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
                }}
              >
                أنتَ الله
              </span>
            </div>
          )}

          <NameGrid names={names} memorized={memorized} onOpen={onOpen} isGold={isGold} variant={variant} />
        </div>
      )}
    </section>
  )
}

function NameGrid({ names, memorized, onOpen, isGold, variant }) {
  const gridClass =
    variant === 'dua'    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' :
    variant === 'famous' ? 'grid grid-cols-5 gap-2' :
    variant === 'row'    ? 'grid grid-cols-4 gap-2' :
                           'grid grid-cols-5 gap-1.5'

  return (
    <div className={gridClass}>
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
  )
}

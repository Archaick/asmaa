import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { useMilestones } from '../../hooks/useMilestones'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH, TOTAL_NAMES } from '../../data/bouquets'
import NameSheet from '../../components/NameSheet'
import CelebrationOverlay from '../../components/CelebrationOverlay'
import StudentLayout from '../../components/layout/StudentLayout'
import { playChime, playMilestoneChime } from '../../utils/chime'

const SEEN_KEY = 'asmaa.celebrated'

export default function BouquetSession() {
  const { bouquetId } = useParams()
  const navigate = useNavigate()
  const { memorized, memorizedCount, entries, markMemorized, unmarkMemorized } = useProgress()
  const { byBouquet, findName } = useNames()
  const { bouquetCompletion } = useMilestones(entries, memorized, memorizedCount)
  const [openId, setOpenId] = useState(null)
  const [openingExp, setOpeningExp] = useState(false)
  const [closingExp, setClosingExp] = useState(false)
  const [celebrated, setCelebrated] = useState(null)
  const prevCompleteRef = useRef({})

  const bouquet = BOUQUETS.find((b) => b.id === bouquetId)
  const names = byBouquet[bouquetId] || []
  const memInBouquet = names.filter((n) => !n.isDua && memorized.has(n.id)).length
  const total = names.filter((n) => !n.isDua).length
  const complete = total > 0 && memInBouquet === total

  const openName = useMemo(() => findName(openId), [findName, openId])
  const isMemorized = openName ? memorized.has(openName.id) : false

  const idx = BOUQUETS.findIndex((b) => b.id === bouquetId)
  const prev = idx > 0 ? BOUQUETS[idx - 1] : null
  const next = idx >= 0 && idx < BOUQUETS.length - 1 ? BOUQUETS[idx + 1] : null

  // Detect bouquet completion → celebrate
  useEffect(() => {
    if (!bouquet || bouquet.isDua) return
    const wasComplete = prevCompleteRef.current[bouquet.id]
    prevCompleteRef.current[bouquet.id] = complete
    if (!wasComplete && complete) {
      // Check we haven't already celebrated in this session
      const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
      if (!seen[bouquet.id]) {
        seen[bouquet.id] = Date.now()
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
        setCelebrated(bouquet)
        playMilestoneChime()
      }
    }
  }, [complete, bouquet])

  const toggleMem = async () => {
    if (!openName) return
    if (isMemorized) {
      await unmarkMemorized(openName.id)
    } else {
      playChime()
      await markMemorized(openName.id)
    }
  }

  const nav = (dir) => {
    if (!openName) return
    const realInBouquet = names.filter((n) => !n.isDua)
    const i = realInBouquet.findIndex((n) => n.id === openName.id)
    if (i < 0) return
    const nxt = dir === 'next' ? i + 1 : i - 1
    setOpenId(realInBouquet[(nxt + realInBouquet.length) % realInBouquet.length].id)
  }

  if (!bouquet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-cream)]">
        <div className="text-center">
          <p className="mb-4">لم نجد هذه الباقة.</p>
          <Link to="/memorize" className="text-[color:var(--color-gold-deep)] font-bold">← عودة للوسيلة</Link>
        </div>
      </div>
    )
  }

  const isGold = bouquet.color === 'gold'

  return (
    <StudentLayout backTo="/memorize">
      <div className="py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Bouquet header */}
          <div className="text-center mb-6">
            <div
              className="inline-block text-[11px] font-bold uppercase tracking-widest mb-1 px-3 py-0.5 rounded-full"
              style={{
                background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
              }}
            >
              الباقة {complete ? '👑 مكتملة' : ''}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mt-2 mb-3">
              {bouquet.title}
            </h1>
            {!bouquet.isDua && (
              <div className="max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
                  <span dir="ltr">{memInBouquet} / {total}</span>
                  <span dir="ltr">{Math.round((memInBouquet / total) * 100)}%</span>
                </div>
                <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${(memInBouquet / total) * 100}%`,
                      background: isGold ? 'var(--color-gold)' : 'var(--color-teal)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Opening hadith (collapsed) */}
          <CollapsibleHadith
            hadith={OPENING_HADITH} label="حديث الافتتاح"
            expanded={openingExp} onToggle={() => setOpeningExp(!openingExp)}
            accent="gold"
          />

          {/* أنت الله divider */}
          {!bouquet.isDua && bouquet.id !== 'famous' && bouquet.id !== 'khitam' && (
            <div className="text-center my-4">
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-serif font-bold"
                style={{
                  background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                  color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
                }}
              >
                أنتَ الله
              </span>
            </div>
          )}

          {/* Big spacious names grid */}
          <div className={gridClassFor(bouquet)} dir="rtl">
            {names.map((n, i) => {
              const isMem = memorized.has(n.id)
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setOpenId(n.id)}
                  className={
                    'relative rounded-2xl font-serif font-bold text-center transition-all border-2 py-6 sm:py-8 text-lg sm:text-xl animate-fade-in-up ' +
                    (isMem
                      ? (isGold
                          ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)]'
                          : 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]')
                      : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:-translate-y-1 hover:shadow-md')
                  }
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {n.name}
                  {isMem && <span className="absolute top-1.5 end-2 text-sm">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Closing hadith (collapsed) */}
          <div className="mt-6">
            <CollapsibleHadith
              hadith={CLOSING_HADITH} label="حديث الاختتام"
              expanded={closingExp} onToggle={() => setClosingExp(!closingExp)}
              accent="teal"
            />
          </div>

          {/* Prev/Next nav */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {prev ? (
              <Link
                to={`/memorize/${prev.id}`}
                className="flex-1 max-w-xs px-4 py-3 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition text-start"
              >
                <div className="text-[10px] font-bold text-[color:var(--color-ink-mute)] uppercase tracking-wider mb-0.5">
                  → الباقة السابقة
                </div>
                <div className="text-sm font-bold text-[color:var(--color-ink)] truncate">{prev.title}</div>
              </Link>
            ) : <div className="flex-1" />}

            {next ? (
              <Link
                to={`/memorize/${next.id}`}
                className="flex-1 max-w-xs px-4 py-3 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition text-end"
              >
                <div className="text-[10px] font-bold text-[color:var(--color-ink-mute)] uppercase tracking-wider mb-0.5">
                  الباقة التالية ←
                </div>
                <div className="text-sm font-bold text-[color:var(--color-ink)] truncate">{next.title}</div>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </div>
      </div>

      <NameSheet
        name={openName}
        isMemorized={isMemorized}
        onClose={() => setOpenId(null)}
        onToggleMemorized={toggleMem}
        onNav={nav}
      />

      <CelebrationOverlay
        open={!!celebrated}
        title={celebrated ? `🌟 أتممت باقة ${celebrated.title}` : ''}
        subtitle="بارك الله فيك — كل اسم حفظته دعوة استجيبت"
        onClose={() => setCelebrated(null)}
      />
    </StudentLayout>
  )
}

function gridClassFor(bouquet) {
  if (bouquet.isDua) return 'grid grid-cols-1 sm:grid-cols-2 gap-3'
  if (bouquet.id === 'khitam') return 'grid grid-cols-2 sm:grid-cols-4 gap-3'
  if (bouquet.id === 'famous') return 'grid grid-cols-5 gap-2 sm:gap-3'
  return 'grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3'
}

function CollapsibleHadith({ hadith, label, expanded, onToggle, accent }) {
  const isGold = accent === 'gold'
  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}>
          {label}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className={'transition-transform text-[color:var(--color-ink-mute)] ' + (expanded ? 'rotate-180' : '')}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2 p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] text-center animate-fade-in-up">
          <p className="font-serif text-base sm:text-lg leading-relaxed text-[color:var(--color-ink)]" dir="rtl">
            «{hadith.text}»
          </p>
          <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{hadith.source}</p>
        </div>
      )}
    </div>
  )
}

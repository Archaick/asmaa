import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH } from '../../data/bouquets'
import NameSheet from '../../components/NameSheet'
import CelebrationOverlay from '../../components/CelebrationOverlay'
import HadithCard from '../../components/HadithCard'
import StudentLayout from '../../components/layout/StudentLayout'
import { useLang } from '../../i18n/LangContext'
import { playChime, playMilestoneChime } from '../../utils/chime'

const SEEN_KEY = 'asmaa.celebrated'
const RESET_CONFIRM_MS = 3000

export default function BouquetSession() {
  const { bouquetId } = useParams()
  const { memorized, markMemorized, unmarkMemorized } = useProgress()
  const { byBouquet, findName } = useNames()
  const { t } = useLang()

  const [openId, setOpenId] = useState(null)
  const [celebrated, setCelebrated] = useState(null)
  const [resetArmed, setResetArmed] = useState(false)
  const [resetting, setResetting] = useState(false)
  const prevCompleteRef = useRef({})

  const bouquet = BOUQUETS.find((b) => b.id === bouquetId)
  const names = byBouquet[bouquetId] || []
  const memInBouquet = names.filter((n) => !n.isDua && memorized.has(n.id)).length
  const total = names.filter((n) => !n.isDua).length
  const complete = total > 0 && memInBouquet === total

  const openName = useMemo(() => findName(openId), [findName, openId])
  const isMemorized = openName ? memorized.has(openName.id) : false

  // Scroll to top whenever the bouquet changes (fixes landing near the bottom
  // when arriving from a scrolled-down /memorize page).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [bouquetId])

  // Detect bouquet completion → celebrate (once per browser, per bouquet).
  useEffect(() => {
    if (!bouquet || bouquet.isDua) return
    const wasComplete = prevCompleteRef.current[bouquet.id]
    prevCompleteRef.current[bouquet.id] = complete
    if (!wasComplete && complete) {
      const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
      if (!seen[bouquet.id]) {
        seen[bouquet.id] = Date.now()
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
        setCelebrated(bouquet)
        playMilestoneChime()
      }
    }
  }, [complete, bouquet])

  // Reset button de-arms itself after a few seconds so a stray tap can't wipe progress.
  useEffect(() => {
    if (!resetArmed) return
    const to = setTimeout(() => setResetArmed(false), RESET_CONFIRM_MS)
    return () => clearTimeout(to)
  }, [resetArmed])

  const onReset = async () => {
    if (!resetArmed) { setResetArmed(true); return }
    setResetting(true); setResetArmed(false)
    const toUnmark = names.filter((n) => memorized.has(n.id))
    await Promise.all(toUnmark.map((n) => unmarkMemorized(n.id)))
    // Also clear the celebration seen-marker so re-completing celebrates again.
    if (bouquet) {
      const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
      delete seen[bouquet.id]
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
      prevCompleteRef.current[bouquet.id] = false
    }
    setResetting(false)
  }

  // Marks the current name memorized (if it isn't already), then progresses:
  //   • If every real name in this bouquet is now memorized → close the sheet
  //     so the celebration overlay can take centre stage.
  //   • Otherwise advance to the next unmemorized name (cycling if needed).
  const onAdvance = async () => {
    if (!openName) return
    const realInBouquet = names.filter((n) => !n.isDua)
    const alreadyMem = memorized.has(openName.id)

    if (!alreadyMem) {
      playChime()
      await markMemorized(openName.id)
    }

    // Simulate the post-mark set for a synchronous decision (Firestore snapshot
    // hasn't fired yet by the time we advance).
    const wouldBeMemorized = new Set(memorized)
    wouldBeMemorized.add(openName.id)
    if (realInBouquet.every((n) => wouldBeMemorized.has(n.id))) {
      setOpenId(null)
      return
    }

    // Prefer the next UN-memorized name; fall back to strict next-in-order.
    const i = realInBouquet.findIndex((n) => n.id === openName.id)
    for (let step = 1; step <= realInBouquet.length; step++) {
      const cand = realInBouquet[(i + step) % realInBouquet.length]
      if (!wouldBeMemorized.has(cand.id)) { setOpenId(cand.id); return }
    }
    // All memorized fallback (shouldn't hit given the early return above)
    setOpenId(realInBouquet[(i + 1) % realInBouquet.length].id)
  }

  // Non-committal review browsing via keyboard arrows only — no visible buttons.
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
          <p className="mb-4">{t('bouquet.not_found')}</p>
          <Link to="/memorize" className="text-[color:var(--color-gold-deep)] font-bold">← {t('bouquet.back_to_chart')}</Link>
        </div>
      </div>
    )
  }

  const isGold = bouquet.color === 'gold'

  return (
    <StudentLayout backTo="/memorize">
      <div className="py-6 sm:py-8 overflow-x-hidden">
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
              {t('bouquet.tag')} {complete ? t('bouquet.session.complete_badge') : ''}
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

          {/* Opening hadith — always visible, prominent (start of the ceremony) */}
          <HadithCard hadith={OPENING_HADITH} label={t('memorize.hadith.opening_label')} accent="gold" />

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
                {t('bouquet.divider.you_allah')}
              </span>
            </div>
          )}

          {/* Big spacious names grid — staggered reveal after opening hadith */}
          <div key={`grid-${bouquetId}`} className={gridClassFor(bouquet)} dir="rtl">
            {names.map((n, i) => {
              const isMem = memorized.has(n.id)
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setOpenId(n.id)}
                  className={
                    'relative min-w-0 rounded-2xl font-serif font-bold text-center transition-all border-2 px-1 py-5 sm:py-8 text-base sm:text-xl animate-fade-in-up ' +
                    (isMem
                      ? (isGold
                          ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)]'
                          : 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]')
                      : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:-translate-y-1 hover:shadow-md')
                  }
                  style={{ animationDelay: `${500 + i * 50}ms` }}
                >
                  {n.name}
                  {isMem && <span className="absolute top-1.5 end-2 text-sm">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Closing hadith — always visible, prominent (end of the ceremony) */}
          <div className="mt-6">
            <HadithCard hadith={CLOSING_HADITH} label={t('memorize.hadith.closing_label')} accent="teal" />
          </div>

          {/* Reset + back — no auto-jump to next bouquet, student chooses next */}
          {!bouquet.isDua && (
            <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
              <Link
                to="/memorize"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold border border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] transition"
              >
                → {t('bouquet.back_to_chart')}
              </Link>

              {memInBouquet > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={resetting}
                  className={
                    'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold border transition disabled:opacity-60 ' +
                    (resetArmed
                      ? 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100'
                      : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink-mute)]')
                  }
                >
                  {resetting
                    ? '…'
                    : resetArmed
                      ? t('bouquet.reset.confirm')
                      : `↺ ${t('bouquet.reset.label')}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <NameSheet
        name={openName}
        isMemorized={isMemorized}
        onClose={() => setOpenId(null)}
        onAdvance={onAdvance}
        onNav={nav}
      />

      <CelebrationOverlay
        open={!!celebrated}
        bouquetTitle={celebrated?.title || ''}
        onClose={() => setCelebrated(null)}
      />
    </StudentLayout>
  )
}

function gridClassFor(bouquet) {
  if (bouquet.isDua) return 'grid grid-cols-1 sm:grid-cols-2 gap-3'
  if (bouquet.id === 'khitam') return 'grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3'
  // famous + middle bouquets: 3 cols on mobile keeps names readable, 5 on sm+
  return 'grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3'
}


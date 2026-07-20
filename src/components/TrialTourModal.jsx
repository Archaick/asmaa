import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import { useNames } from '../hooks/useNames'
import { BOUQUETS } from '../data/bouquets'
import { playChime, playMilestoneChime } from '../utils/chime'

// Localize a name's field from the الاسماء database (admin-curated):
// prefer the *En variant in English mode, fall back to Arabic.
function loc(name, field, lang) {
  if (lang === 'en') {
    const en = name[field + 'En']
    if (en && en.trim()) return en
  }
  return name[field] || ''
}

function toDigits(n, lang) {
  if (lang !== 'ar') return String(n)
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']
  return String(n).split('').map((d) => ar[+d] ?? d).join('')
}

export default function TrialTourModal({ open, onClose }) {
  const { t, lang } = useLang()
  const { byBouquet } = useNames()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedName, setSelectedName] = useState(null)
  const [glowKey, setGlowKey] = useState(0)

  const finish = () => { onClose?.(); navigate('/login') }

  // The tour walks the whole وسيلة in order, giving each bouquet its own
  // screen: opening hadith → famous 5 → the six bouquets → khitam →
  // closing hadith → summary.
  const steps = useMemo(() => {
    const s = [{ type: 'opening', badge: t('tour.s1.badge') }]
    for (const b of BOUQUETS) {
      if (b.isDua) continue
      s.push({ type: 'bouquet', bouquet: b, badge: b.title })
    }
    s.push({ type: 'closing', badge: t('tour.s3.badge') })
    s.push({ type: 'summary', badge: t('tour.s4.badge') })
    return s
  }, [t])
  const total = steps.length
  const current = steps[Math.min(step, total - 1)]

  useEffect(() => {
    if (open) {
      setStep(0)
      setSelectedName(null)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Fresh start on each screen; celebrate the summary.
  useEffect(() => { setSelectedName(null) }, [step])
  useEffect(() => {
    if (open && step === total - 1) playMilestoneChime()
  }, [open, step, total])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleNameTap = (n) => {
    setSelectedName(n)
    setGlowKey((k) => k + 1)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-[color:var(--color-ink)]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-lg max-h-[92dvh] bg-[color:var(--color-cream)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[color:var(--color-cream-deep)] flex flex-col overflow-hidden animate-fade-in-up">

        {/* Corner star ornaments */}
        <CornerStar className="absolute top-3 right-3 opacity-30" />
        <CornerStar className="absolute top-3 left-3 opacity-30" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]">
              {toDigits(step + 1, lang)} {t('tour.step')} {toDigits(total, lang)}
            </span>
            <span className="text-sm font-bold text-[color:var(--color-ink-soft)] truncate">
              {current.badge}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/70 transition flex items-center justify-center text-[color:var(--color-ink-soft)] shrink-0"
            aria-label={t('tour.close')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
          {current.type === 'opening' && <StepOpening t={t} lang={lang} />}
          {current.type === 'bouquet' && (
            <StepBouquet
              t={t}
              lang={lang}
              bouquet={current.bouquet}
              names={byBouquet[current.bouquet.id] || []}
              selectedName={selectedName}
              onNameTap={handleNameTap}
              glowKey={glowKey}
            />
          )}
          {current.type === 'closing' && <StepClosing t={t} lang={lang} />}
          {current.type === 'summary' && <StepSummary t={t} lang={lang} onClose={onClose} />}
        </div>

        {/* Footer */}
        <div className="border-t border-[color:var(--color-cream-deep)] px-5 sm:px-7 py-3.5 bg-white">
          {/* slim progress bar (dots would be too many with per-bouquet steps) */}
          <div className="h-1.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden mb-3">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((step + 1) / total) * 100}%`,
                background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] text-[color:var(--color-ink-soft)] transition"
              >
                {t('tour.back')}
              </button>
            )}
            {step < total - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition"
              >
                {t('tour.next')} {lang === 'ar' ? '←' : '→'}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all"
                style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))' }}
              >
                <span>✨</span>
                {t('tour.s4.cta')} {lang === 'ar' ? '←' : '→'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Ornaments ─────────────────────────────────────────── */

function CornerStar({ className = '' }) {
  return (
    <svg className={'w-12 h-12 pointer-events-none animate-star-slow ' + className}
         viewBox="0 0 100 100" fill="none">
      <path d="M50 5 L61 39 L96 39 L67 60 L78 95 L50 74 L22 95 L33 60 L4 39 L39 39 Z"
            stroke="var(--color-gold)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d="M50 15 L57 42 L84 42 L62 58 L70 85 L50 70 L30 85 L38 58 L16 42 L43 42 Z"
            stroke="var(--color-gold)" strokeWidth="0.8" fill="none" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}

function GoldFlourish() {
  return (
    <svg className="mx-auto my-3" width="140" height="14" viewBox="0 0 140 14" fill="none">
      <path d="M0 7 L45 7" stroke="var(--color-gold)" strokeWidth="1" />
      <path d="M95 7 L140 7" stroke="var(--color-gold)" strokeWidth="1" />
      <circle cx="70" cy="7" r="3" fill="var(--color-gold)" />
      <circle cx="55" cy="7" r="1.5" fill="var(--color-gold)" opacity="0.7" />
      <circle cx="85" cy="7" r="1.5" fill="var(--color-gold)" opacity="0.7" />
      <path d="M48 4 Q52 7 48 10" stroke="var(--color-gold)" strokeWidth="1" fill="none" />
      <path d="M92 4 Q88 7 92 10" stroke="var(--color-gold)" strokeWidth="1" fill="none" />
    </svg>
  )
}

/* ── Steps ─────────────────────────────────────────────── */

function StepOpening({ t, lang }) {
  return (
    <div className="text-center animate-fade-in-up">
      <div className="text-3xl mb-2">🌒</div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('tour.s1.title')}
      </h3>
      <GoldFlourish />
      <p className="text-[color:var(--color-ink-soft)] leading-relaxed mb-6 max-w-md mx-auto">
        {t('tour.s1.desc')}
      </p>
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[color:var(--color-gold-soft)] shadow-sm" dir="rtl">
        <p className={'font-serif text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink)]'}>
          «{t('tour.s1.hadith')}»
        </p>
      </div>
    </div>
  )
}

// One bouquet gets its own screen: title + its names as tappable tiles
// (5-wide, the method's geometry; 4-wide for khitam), and a live detail
// card from the الاسماء database when a name is tapped.
function StepBouquet({ t, lang, bouquet, names, selectedName, onNameTap, glowKey }) {
  const isGold = bouquet.color === 'gold'
  const accent = isGold ? 'gold' : 'teal'
  const cols = bouquet.id === 'khitam' ? 'grid-cols-4' : 'grid-cols-5'

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-4">
        <div
          className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-3 py-0.5 rounded-full"
          style={{
            background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
            color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
          }}
        >
          {t('bouquet.tag')}
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-1">
          {bouquet.title}
        </h3>
        <GoldFlourish />
        <p className="text-sm text-[color:var(--color-ink-soft)] mb-4">
          {t('tour.bouquet.hint')}
        </p>
      </div>

      {/* Tappable name tiles */}
      <div key={bouquet.id} className={`grid ${cols} gap-1.5 sm:gap-2 mb-5`} dir="rtl">
        {names.map((n) => {
          const active = selectedName?.id === n.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onNameTap(n)}
              className={
                'relative min-w-0 py-3 sm:py-4 px-0.5 rounded-xl border-2 font-serif text-[13px] sm:text-base font-bold leading-tight transition-all ' +
                (active
                  ? (isGold
                      ? 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)] scale-105 shadow-md'
                      : 'border-[color:var(--color-teal)] bg-[color:var(--color-teal-soft)] scale-105 shadow-md')
                  : 'border-[color:var(--color-cream-deep)] bg-white hover:border-[color:var(--color-gold)] hover:-translate-y-0.5')
              }
            >
              <span className="text-[10px] absolute top-0.5 left-1 opacity-50">🔊</span>
              {n.name}
            </button>
          )
        })}
      </div>

      {!selectedName ? (
        <div className="text-center py-8 rounded-2xl bg-[color:var(--color-cream-warm)] border border-dashed border-[color:var(--color-cream-deep)]">
          <div className="text-2xl mb-2">👆</div>
          <p className="text-sm font-semibold text-[color:var(--color-ink-mute)]">
            {t('tour.s2.hint')}
          </p>
        </div>
      ) : (
        <div
          key={glowKey}
          className="rounded-2xl bg-white border p-5 shadow-sm animate-name-glow"
          style={{ borderColor: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
          dir="rtl"
        >
          <h4 className="font-serif text-3xl font-bold text-center text-[color:var(--color-ink)] mb-4">
            {selectedName.name}
          </h4>

          <NameFacet icon="💡" label={t('tour.s2.meaning')} text={loc(selectedName, 'meaning', lang)} accent={accent} />
          <NameFacet icon="🌟" label={t('tour.s2.thanaa')}  text={loc(selectedName, 'thanaa',  lang)} accent={accent === 'gold' ? 'teal' : 'gold'} />
          <NameFacet icon="🤲" label={t('tour.s2.talab')}   text={loc(selectedName, 'talab',   lang)} accent={accent} last />
        </div>
      )}
    </div>
  )
}

function NameFacet({ icon, label, text, accent, last }) {
  const color = accent === 'gold' ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)'
  return (
    <div className={'flex gap-3 ' + (last ? '' : 'pb-3 mb-3 border-b border-dashed border-[color:var(--color-cream-deep)]')}>
      <div className="text-xl shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
          {label}
        </div>
        <div className="text-[15px] leading-relaxed text-[color:var(--color-ink)]">
          {text}
        </div>
      </div>
    </div>
  )
}

function StepClosing({ t, lang }) {
  return (
    <div className="text-center animate-fade-in-up">
      <div className="text-3xl mb-2">🌘</div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('tour.s3.title')}
      </h3>
      <GoldFlourish />
      <p className="text-[color:var(--color-ink-soft)] leading-relaxed mb-6 max-w-md mx-auto">
        {t('tour.s3.desc')}
      </p>
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[color:var(--color-teal-soft)] shadow-sm mb-6" dir="rtl">
        <p className="font-serif text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink)]">
          «{t('tour.s3.hadith')}»
        </p>
      </div>
      <div className="text-sm text-[color:var(--color-ink-mute)] font-semibold">
        ✨ {t('tour.s3.outro')}
      </div>
    </div>
  )
}

function StepSummary({ t, lang, onClose }) {
  return (
    <div className="text-center animate-fade-in-up py-2">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-bold animate-celebrate-pop"
           style={{ background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-teal-soft))', color: 'var(--color-ink)' }}>
        <span className="text-lg">🎉</span>
        {t('tour.s4.done_badge')}
      </div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('tour.s4.title')}
      </h3>
      <GoldFlourish />
      <p className="text-[color:var(--color-ink-soft)] leading-relaxed mb-6 max-w-md mx-auto">
        {t('tour.s4.desc')}
      </p>

      {/* Impact stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatBlock num={t('tour.s4.stat_famous_num')} label={t('tour.s4.stat_famous_label')} accent="gold" />
        <StatBlock num={t('tour.s4.stat_bouquets_num')} label={t('tour.s4.stat_bouquets_label')} accent="teal" big />
        <StatBlock num={t('tour.s4.stat_nadaa_num')} label={t('tour.s4.stat_nadaa_label')} accent="gold" />
      </div>

      {/* Total */}
      <div className="inline-block px-8 py-3 rounded-2xl mb-6"
           style={{ background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-teal-soft))' }}>
        <div className="text-2xl sm:text-3xl font-display font-bold text-[color:var(--color-ink)]">
          = {t('tour.s4.stat_total')}
        </div>
      </div>

      <div className="text-xs text-[color:var(--color-ink-mute)] font-semibold">
        {t('tour.s4.by')}
      </div>
    </div>
  )
}

function StatBlock({ num, label, accent, big }) {
  const gold = accent === 'gold'
  return (
    <div className="p-3 sm:p-4 rounded-xl border"
         style={{
           borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
           background: gold
             ? 'linear-gradient(135deg, rgba(230,212,166,0.35), rgba(230,212,166,0.1))'
             : 'linear-gradient(135deg, rgba(185,212,216,0.4), rgba(185,212,216,0.1))',
         }}>
      <div className={'font-display font-bold text-[color:var(--color-ink)] ' + (big ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl')}>
        {num}
      </div>
      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-ink-soft)] mt-1">
        {label}
      </div>
    </div>
  )
}

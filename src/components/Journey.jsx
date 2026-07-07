import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useInView } from '../hooks/useInView'

const stages = [
  { key: 's1', num: '١', numEn: '1', accent: 'gold' },
  { key: 's2', num: '٢', numEn: '2', accent: 'gold' },
  { key: 's3', num: '٣', numEn: '3', accent: 'teal' },
  { key: 's4', num: '٤', numEn: '4', accent: 'teal' },
]

const STEP_MS = 4000
const TOTAL_LEN = 1000
const KEY_POINTS = [0, 0.33, 0.66, 1]

export default function Journey() {
  const { t, lang } = useLang()
  const [ref, inView] = useInView({ threshold: 0.25 })
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), STEP_MS)
    return () => clearInterval(id)
  }, [inView])

  const stage = stages[active]

  return (
    <section id="method" ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className={'text-center mb-14 max-w-2xl mx-auto ' + (inView ? 'reveal-shown' : 'reveal-hidden')}>
          <span className="inline-block text-[13px] font-bold uppercase tracking-widest text-[color:var(--color-teal-deep)] mb-4">
            {t('journey.eyebrow')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[color:var(--color-ink)] mb-4">
            {t('journey.title')}
          </h2>
          <p className="text-lg text-[color:var(--color-ink-soft)] leading-relaxed">
            {t('journey.subtitle')}
          </p>
        </div>

        {/* Desktop: arc-orbit */}
        <div className="hidden md:block">
          <ArcOrbit
            stages={stages}
            active={active}
            inView={inView}
            lang={lang}
            onSelect={setActive}
          />
          <FocusCard stage={stage} t={t} lang={lang} inView={inView} />
        </div>

        {/* Mobile: compact vertical rhythm */}
        <div className="md:hidden">
          <MobileOrbit
            stages={stages}
            active={active}
            inView={inView}
            lang={lang}
            onSelect={setActive}
          />
          <FocusCard stage={stage} t={t} lang={lang} inView={inView} />
        </div>
      </div>
    </section>
  )
}

/* ── Desktop arc ───────────────────────────────────────── */

// Positions on the arc — computed from the quadratic bezier
// M 80 170 Q 500 -20 920 170  at t = 0, 0.33, 0.66, 1
// In RTL we mirror horizontally so stage 1 is on the right.
const arcPos = [
  { x: 8,  y: 75 },  // t = 0
  { x: 36, y: 25 },  // t = 0.33
  { x: 64, y: 25 },  // t = 0.66
  { x: 92, y: 75 },  // t = 1
]

function ArcOrbit({ stages, active, inView, lang, onSelect }) {
  const isRTL = lang === 'ar'
  // Progress bead position
  const bead = arcPos[active]

  // In RTL we render badges from right → left by mirroring the x-axis.
  const xFor = (x) => (isRTL ? 100 - x : x)

  const progress = KEY_POINTS[active] // 0, 0.33, 0.66, 1
  const drawn = Math.max(0.05, progress) * TOTAL_LEN

  return (
    <div className="relative w-full mx-auto" style={{ height: 260, maxWidth: 900 }}>
      {/* Arc SVG (baseline + progress line) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="arcGrad" x1={isRTL ? '1' : '0'} y1="0" x2={isRTL ? '0' : '1'} y2="0">
            <stop offset="0%"   stopColor="var(--color-gold)" />
            <stop offset="50%"  stopColor="var(--color-gold)" />
            <stop offset="50%"  stopColor="var(--color-teal)" />
            <stop offset="100%" stopColor="var(--color-teal)" />
          </linearGradient>
        </defs>

        {/* Dashed baseline */}
        <path
          d={isRTL ? 'M 920 195 Q 500 -20 80 195' : 'M 80 195 Q 500 -20 920 195'}
          fill="none"
          stroke="var(--color-cream-deep)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        {/* Progress overlay */}
        <path
          d={isRTL ? 'M 920 195 Q 500 -20 80 195' : 'M 80 195 Q 500 -20 920 195'}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="3"
          strokeDasharray={TOTAL_LEN}
          strokeDashoffset={inView ? TOTAL_LEN - drawn : TOTAL_LEN}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeLinecap="round"
        />
      </svg>

      {/* Badges */}
      {stages.map((s, i) => {
        const p = arcPos[i]
        const left = xFor(p.x)
        const isActive = i === active
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(i)}
            className="absolute -translate-x-1/2 -translate-y-1/2 outline-none z-10"
            style={{ left: `${left}%`, top: `${p.y}%` }}
            aria-label={`stage ${i + 1}`}
          >
            <ArcBadge stage={s} lang={lang} isActive={isActive} />
          </button>
        )
      })}

      {/* Traveling bead */}
      <div
        className="tasbih-bead absolute w-5 h-5 rounded-full pointer-events-none z-0"
        style={{
          left: `${xFor(bead.x)}%`,
          top: `${bead.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #FEE9B0 0%, var(--color-gold) 55%, var(--color-gold-deep) 100%)',
          transition: 'left 1s cubic-bezier(0.4, 0.1, 0.2, 1), top 1s cubic-bezier(0.4, 0.1, 0.2, 1)',
        }}
      />
    </div>
  )
}

function ArcBadge({ stage, lang, isActive }) {
  const gold = stage.accent === 'gold'
  return (
    <div
      className={
        'w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center font-display font-bold text-3xl lg:text-4xl border-[6px] border-[color:var(--color-cream)] transition-all duration-500 ' +
        (isActive ? 'scale-115' : 'scale-90 opacity-60')
      }
      style={{
        background: gold
          ? 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))'
          : 'linear-gradient(135deg, var(--color-teal-soft), var(--color-teal))',
        color: 'var(--color-ink)',
        boxShadow: isActive
          ? gold
            ? '0 0 0 10px rgba(184,148,78,0.20), 0 12px 30px rgba(184,148,78,0.40)'
            : '0 0 0 10px rgba(44,110,122,0.20), 0 12px 30px rgba(44,110,122,0.40)'
          : '0 4px 8px rgba(0,0,0,0.08)',
        filter: isActive ? 'brightness(1.12) saturate(1.2)' : 'brightness(0.98)',
      }}
    >
      {lang === 'ar' ? stage.num : stage.numEn}
    </div>
  )
}

/* ── Mobile compact ────────────────────────────────────── */

function MobileOrbit({ stages, active, lang, onSelect }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6" dir="ltr">
      {stages.map((s, i) => {
        const isActive = i === active
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(i)}
            className={
              'transition-all duration-500 outline-none rounded-full flex items-center gap-2 ' +
              (isActive ? 'px-4 py-2' : 'px-2 py-2 opacity-60')
            }
            style={{
              background: isActive
                ? s.accent === 'gold' ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)'
                : 'transparent',
            }}
          >
            <span
              className={
                'w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-lg border-2 border-[color:var(--color-cream)] transition-transform ' +
                (isActive ? 'scale-110' : '')
              }
              style={{
                background: s.accent === 'gold'
                  ? 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))'
                  : 'linear-gradient(135deg, var(--color-teal-soft), var(--color-teal))',
                color: 'var(--color-ink)',
              }}
            >
              {lang === 'ar' ? s.num : s.numEn}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Focus card ────────────────────────────────────────── */

function FocusCard({ stage, t, lang, inView }) {
  const gold = stage.accent === 'gold'
  return (
    <div
      className={
        'relative max-w-2xl mx-auto mt-4 md:mt-6 p-6 sm:p-8 rounded-3xl bg-white border shadow-sm text-center ' +
        (inView ? 'reveal-shown' : 'reveal-hidden')
      }
      style={{
        borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-8 -end-8 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-70"
        style={{ background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />

      <div key={stage.key} className="relative animate-fade-swap">
        <div className="text-xs font-bold uppercase tracking-widest mb-2"
             style={{ color: gold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}>
          {lang === 'ar' ? `المرتبة ${stage.num}` : `Level ${stage.numEn}`}
        </div>
        <h3 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-3">
          {t(`journey.${stage.key}.title`)}
        </h3>
        <p className="text-base sm:text-lg leading-relaxed text-[color:var(--color-ink-soft)] max-w-lg mx-auto">
          {t(`journey.${stage.key}.desc`)}
        </p>
      </div>
    </div>
  )
}

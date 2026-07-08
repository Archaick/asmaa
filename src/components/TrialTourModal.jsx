import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playChime } from '../utils/chime'

const famousNames = [
  {
    id: 'allah',
    name: 'الله',
    meaning: { ar: 'لفظ الجلالة الأعظم، المسمّى بجميع أسمائه الحسنى وصفاته العلى.', en: 'The Supreme Name — the One called by every beautiful name and lofty attribute.' },
    thanaa:  { ar: 'سبحان الله وبحمده، سبحان الله العظيم.', en: 'Glory be to Allah and praise Him, glory be to Allah the Almighty.' },
    talab:   { ar: 'اللهم لك الحمد كله، ولك الملك كله، وإليك يرجع الأمر كله.', en: 'O Allah, all praise is Yours, all sovereignty is Yours, and to You all matters return.' },
  },
  {
    id: 'rahman',
    name: 'الرَّحمن',
    meaning: { ar: 'ذو الرحمة الواسعة التي وسعت كل شيء.', en: 'The Most Merciful — whose mercy encompasses everything.' },
    thanaa:  { ar: 'سبحان الرحمن الذي وسعت رحمته كل شيء.', en: 'Glory be to Ar-Rahman, whose mercy encompasses all things.' },
    talab:   { ar: 'يا رحمن، ارحمني برحمتك التي وسعت كل شيء.', en: 'O Ar-Rahman, have mercy on me by Your mercy which encompasses all things.' },
  },
  {
    id: 'raheem',
    name: 'الرَّحيم',
    meaning: { ar: 'العطوف على عباده المؤمنين برحمة خاصة.', en: 'The Especially Merciful — bestowing special mercy on His believing servants.' },
    thanaa:  { ar: 'سبحان الرحيم، أرحم الراحمين.', en: 'Glory be to Ar-Raheem, the Most Merciful of the merciful.' },
    talab:   { ar: 'يا رحيم، ارحمني واغفر لي وتولّني برحمتك.', en: 'O Ar-Raheem, have mercy on me, forgive me, and take charge of me by Your mercy.' },
  },
  {
    id: 'hayy',
    name: 'الحيّ',
    meaning: { ar: 'ذو الحياة الكاملة الأبدية التي لا تسبقها عدم ولا يلحقها فناء.', en: 'The Ever-Living — with perfect eternal life, preceded by no non-existence and followed by no perishing.' },
    thanaa:  { ar: 'سبحان الحيّ الذي لا يموت.', en: 'Glory be to Al-Hayy — the Living who does not die.' },
    talab:   { ar: 'يا حيّ يا قيّوم برحمتك أستغيث، أصلح لي شأني كلّه.', en: 'O Al-Hayy, O Al-Qayyum, by Your mercy I seek help — set right all my affairs.' },
  },
  {
    id: 'qayyum',
    name: 'القيّوم',
    meaning: { ar: 'القائم بنفسه، المقيم لغيره — قامت به كل الموجودات.', en: 'The Self-Subsisting Sustainer — established in Himself, sustaining all that exists.' },
    thanaa:  { ar: 'سبحان القيّوم الذي قامت به السماوات والأرض.', en: 'Glory be to Al-Qayyum by whom the heavens and earth stand.' },
    talab:   { ar: 'يا قيّوم، اكفني بحفظك، وتولَّ أمري في يومي كلّه.', en: 'O Al-Qayyum, suffice me by Your protection, and take charge of my day.' },
  },
]

const TOTAL = 4

export default function TrialTourModal({ open, onClose }) {
  const { t, lang } = useLang()
  const [step, setStep] = useState(0)
  const [selectedName, setSelectedName] = useState(null)
  const [glowKey, setGlowKey] = useState(0)

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

  // Play affirmation chime when the user reaches the final summary step
  useEffect(() => {
    if (open && step === TOTAL - 1) {
      playChime()
    }
  }, [open, step])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const arDigits = ['١','٢','٣','٤']
  const enDigits = ['1','2','3','4']
  const stepNum = (lang === 'ar' ? arDigits : enDigits)[step]
  const totalNum = lang === 'ar' ? '٤' : '4'

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
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]">
              {stepNum} {t('tour.step')} {totalNum}
            </span>
            <span className="text-sm font-bold text-[color:var(--color-ink-soft)]">
              {t(`tour.s${step + 1}.badge`)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/70 transition flex items-center justify-center text-[color:var(--color-ink-soft)]"
            aria-label={t('tour.close')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
          {step === 0 && <StepOpening t={t} lang={lang} />}
          {step === 1 && (
            <StepNames
              t={t}
              lang={lang}
              names={famousNames}
              selectedName={selectedName}
              onNameTap={handleNameTap}
              glowKey={glowKey}
            />
          )}
          {step === 2 && <StepClosing t={t} lang={lang} />}
          {step === 3 && <StepSummary t={t} lang={lang} onClose={onClose} />}
        </div>

        {/* Footer */}
        <div className="border-t border-[color:var(--color-cream-deep)] px-5 sm:px-7 py-4 flex items-center justify-between gap-3 bg-white">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={
                  'h-2 rounded-full transition-all ' +
                  (i === step
                    ? 'w-6 bg-[color:var(--color-gold)]'
                    : i < step
                      ? 'w-2 bg-[color:var(--color-gold-soft)]'
                      : 'w-2 bg-[color:var(--color-cream-deep)]')
                }
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] text-[color:var(--color-ink-soft)] transition"
              >
                {t('tour.back')}
              </button>
            )}
            {step < TOTAL - 1 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition"
              >
                {t('tour.next')} {lang === 'ar' ? '←' : '→'}
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

function MiniChart() {
  // 6 bouquets, alternating gold/teal, each blooms in sequence
  const bouquets = [
    { color: 'gold', names: ['الأول','الآخر','الظاهر','الباطن','السميع'] },
    { color: 'teal', names: ['البصير','القدوس','السلام','المؤمن','المهيمن'] },
    { color: 'gold', names: ['العزيز','الجبار','المتكبر','الخالق','البارئ'] },
    { color: 'teal', names: ['المصور','الوهاب','الرزاق','الفتاح','العليم'] },
    { color: 'gold', names: ['القابض','الباسط','الخافض','الرافع','المعز'] },
    { color: 'teal', names: ['المذل','الحكم','العدل','اللطيف','الخبير'] },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
      {bouquets.map((b, i) => (
        <div
          key={i}
          className="animate-bouquet-bloom rounded-lg px-2 py-2 border"
          style={{
            animationDelay: `${i * 90}ms`,
            borderColor: b.color === 'gold' ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
            background: b.color === 'gold'
              ? 'linear-gradient(135deg, rgba(230,212,166,0.45), rgba(230,212,166,0.15))'
              : 'linear-gradient(135deg, rgba(185,212,216,0.5), rgba(185,212,216,0.2))',
          }}
        >
          <div className="flex flex-wrap gap-0.5">
            {b.names.map((n, j) => (
              <div key={j}
                   className="text-[7px] leading-none px-1 py-0.5 rounded-sm bg-white/70 font-serif font-bold text-[color:var(--color-ink)]"
                   style={{ opacity: 0.9 }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StepNames({ t, lang, names, selectedName, onNameTap, glowKey }) {
  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-4">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-1">
          {t('tour.s2.title')}
        </h3>
        <GoldFlourish />
        <p className="text-sm text-[color:var(--color-ink-soft)] mb-4">
          {t('tour.s2.desc')}
        </p>
      </div>

      {/* Mini chart preview */}
      <MiniChart />
      <p className="text-center text-[11px] font-semibold text-[color:var(--color-ink-mute)] mb-5">
        {t('tour.s2.chart_caption')}
      </p>

      {/* Interactive famous names */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-5" dir="rtl">
        {names.map((n) => {
          const active = selectedName?.id === n.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onNameTap(n)}
              className={
                'relative py-3 sm:py-4 rounded-xl border-2 font-serif text-sm sm:text-base font-bold transition-all ' +
                (active
                  ? 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)] scale-105 shadow-md'
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
          className="rounded-2xl bg-white border border-[color:var(--color-gold-soft)] p-5 shadow-sm animate-name-glow"
          dir="rtl"
        >
          <h4 className="font-serif text-3xl font-bold text-center text-[color:var(--color-ink)] mb-4">
            {selectedName.name}
          </h4>

          <NameFacet
            icon="💡"
            label={t('tour.s2.meaning')}
            text={selectedName.meaning[lang] || selectedName.meaning.ar}
            accent="gold"
          />
          <NameFacet
            icon="🌟"
            label={t('tour.s2.thanaa')}
            text={selectedName.thanaa[lang] || selectedName.thanaa.ar}
            accent="teal"
          />
          <NameFacet
            icon="🤲"
            label={t('tour.s2.talab')}
            text={selectedName.talab[lang] || selectedName.talab.ar}
            accent="gold"
            last
          />
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
      <div className="text-3xl mb-2">✦</div>
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

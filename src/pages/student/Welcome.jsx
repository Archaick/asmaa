import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n/LangContext'
import { GoldDivider, CornerStar } from '../../components/Ornament'
import { playChime } from '../../utils/chime'

const WELCOMED_KEY = 'asmaa.welcomed'
const TOTAL = 4

export default function Welcome() {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const finish = () => {
    try { localStorage.setItem(WELCOMED_KEY, String(Date.now())) } catch {}
    navigate('/memorize', { replace: true })
  }

  const next = () => {
    if (step < TOTAL - 1) {
      setStep(step + 1)
    } else {
      playChime()
      finish()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-[color:var(--color-cream)] relative overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
           style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-ink) 1px, transparent 0)',
             backgroundSize: '28px 28px',
           }} />
      <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
           style={{ background: 'var(--color-gold-soft)' }} />
      <div className="absolute -bottom-32 -start-32 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
           style={{ background: 'var(--color-teal-soft)' }} />

      {/* Top bar: skip */}
      <div className="relative flex justify-end px-5 py-4 max-w-3xl w-full mx-auto">
        <button
          type="button"
          onClick={finish}
          className="text-sm font-bold text-[color:var(--color-ink-mute)] hover:text-[color:var(--color-ink-soft)] px-3 py-1.5 transition"
        >
          {t('welcome.skip')} ←
        </button>
      </div>

      {/* Main card */}
      <main className="relative flex-1 flex items-center justify-center px-5 pb-8">
        <div className="w-full max-w-2xl">
          <div className="relative bg-white rounded-3xl border-2 border-[color:var(--color-gold-soft)] shadow-2xl overflow-hidden">
            {/* Corner stars */}
            <CornerStar className="absolute top-3 start-3 opacity-25 w-10 h-10" />
            <CornerStar className="absolute top-3 end-3 opacity-25 w-10 h-10" />

            <div key={step} className="animate-fade-in-up p-8 sm:p-12 text-center">
              {step === 0 && <StepWelcome t={t} />}
              {step === 1 && <StepMethod t={t} />}
              {step === 2 && <StepFourActs t={t} />}
              {step === 3 && <StepJourney t={t} />}
            </div>

            {/* Footer navigation */}
            <div className="border-t border-[color:var(--color-cream-deep)] px-6 py-4 flex items-center justify-between gap-3 bg-[color:var(--color-cream-warm)]">
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL }).map((_, i) => (
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
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
                  >
                    {t('welcome.back')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition shadow-md"
                >
                  {step === TOTAL - 1 ? t('welcome.start') : t('welcome.next')}
                  <span className="ms-1">{lang === 'ar' ? '←' : '→'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── Step 1: Welcome ─────────────────────────────────── */

function StepWelcome({ t }) {
  return (
    <>
      <div className="text-6xl mb-3 animate-crown-shimmer inline-block">🌙</div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('welcome.s1.title')}
      </h1>
      <GoldDivider />
      <p className="text-lg text-[color:var(--color-ink-soft)] font-semibold mb-5">
        {t('welcome.s1.subtitle')}
      </p>

      {/* Animated 4-stage chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6" dir="rtl">
        {['journey.s1.title', 'journey.s2.title', 'journey.s3.title', 'journey.s4.title'].map((k, i) => (
          <span
            key={k}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-bold animate-fade-in-up"
            style={{
              background: i < 2 ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
              color: i < 2 ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
              animationDelay: `${300 + i * 200}ms`,
            }}
          >
            {t(k)}
          </span>
        ))}
      </div>

      <p className="text-base text-[color:var(--color-ink-soft)] leading-relaxed max-w-md mx-auto">
        {t('welcome.s1.desc')}
      </p>
    </>
  )
}

/* ─── Step 2: The method ──────────────────────────────── */

function StepMethod({ t }) {
  return (
    <>
      <div className="text-5xl mb-3 animate-fade-in-up">📿</div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('welcome.s2.title')}
      </h1>
      <GoldDivider />
      <p className="text-lg text-[color:var(--color-ink-soft)] font-semibold mb-6">
        {t('welcome.s2.subtitle')}
      </p>

      {/* Sandwich visualization */}
      <div className="max-w-md mx-auto mb-6 space-y-2" dir="rtl">
        <div className="p-3 rounded-2xl bg-[color:var(--color-gold-soft)] border border-[color:var(--color-gold)] animate-fade-in-up"
             style={{ animationDelay: '200ms' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-gold-deep)] mb-0.5">
            {t('welcome.s2.hadith_open_label')}
          </div>
          <div className="text-sm font-serif text-[color:var(--color-ink)]">
            «أنك أنت الله لا إله إلا أنت وحدك لا شريك لك»
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[color:var(--color-cream-warm)] border-2 border-[color:var(--color-cream-deep)] animate-fade-in-up"
             style={{ animationDelay: '450ms' }}>
          <div className="text-xs font-bold text-[color:var(--color-ink-soft)] mb-1">
            {t('welcome.s2.bouquets_label')}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-6 rounded"
                style={{ background: i % 2 === 0 ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
              />
            ))}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[color:var(--color-teal-soft)] border border-[color:var(--color-teal)] animate-fade-in-up"
             style={{ animationDelay: '700ms' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-teal-deep)] mb-0.5">
            {t('welcome.s2.hadith_close_label')}
          </div>
          <div className="text-sm font-serif text-[color:var(--color-ink)]">
            «أسألك بكل اسم هو لك...»
          </div>
        </div>
      </div>

      <p className="text-base text-[color:var(--color-ink-soft)] leading-relaxed max-w-md mx-auto">
        {t('welcome.s2.desc')}
      </p>
    </>
  )
}

/* ─── Step 3: The 4 acts per name ─────────────────────── */

function StepFourActs({ t }) {
  return (
    <>
      <div className="text-5xl mb-3">🕋</div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('welcome.s3.title')}
      </h1>
      <GoldDivider />
      <p className="text-lg text-[color:var(--color-ink-soft)] font-semibold mb-6">
        {t('welcome.s3.subtitle')}
      </p>

      {/* Example name — الرحمن */}
      <div className="max-w-md mx-auto mb-4">
        <div className="mb-3 py-4 rounded-2xl bg-[color:var(--color-gold-soft)] border-2 border-[color:var(--color-gold)] animate-fade-in-up">
          <div className="font-serif text-3xl font-bold text-[color:var(--color-ink)]">الرَّحمن</div>
        </div>

        <div className="grid grid-cols-2 gap-2" dir="rtl">
          <ActCard icon="💡" label={t('welcome.s3.act_meaning')} accent="gold" delay={200} />
          <ActCard icon="🌟" label={t('welcome.s3.act_thanaa')}  accent="teal" delay={350} />
          <ActCard icon="🤲" label={t('welcome.s3.act_talab')}   accent="teal" delay={500} />
          <ActCard icon="✓"  label={t('welcome.s3.act_memorize')} accent="gold" delay={650} />
        </div>
      </div>

      <p className="text-base text-[color:var(--color-ink-soft)] leading-relaxed max-w-md mx-auto mt-4">
        {t('welcome.s3.desc')}
      </p>
    </>
  )
}

function ActCard({ icon, label, accent, delay }) {
  const gold = accent === 'gold'
  return (
    <div
      className="flex items-center gap-2 p-3 rounded-xl bg-white border animate-fade-in-up text-start"
      style={{
        borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="text-xl shrink-0">{icon}</span>
      <span className="text-sm font-bold text-[color:var(--color-ink)]">{label}</span>
    </div>
  )
}

/* ─── Step 4: Your journey ─────────────────────────────── */

function StepJourney({ t }) {
  return (
    <>
      <div className="text-5xl mb-3">🏆</div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-1">
        {t('welcome.s4.title')}
      </h1>
      <GoldDivider />
      <p className="text-lg text-[color:var(--color-ink-soft)] font-semibold mb-6">
        {t('welcome.s4.subtitle')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-lg mx-auto">
        <FeatureBadge icon="🌙" label={t('welcome.s4.badge_streak')}      delay={100} />
        <FeatureBadge icon="🏆" label={t('welcome.s4.badge_milestones')}  delay={280} />
        <FeatureBadge icon="✨" label={t('welcome.s4.badge_chart')}       delay={460} />
      </div>

      <p className="text-base text-[color:var(--color-ink-soft)] leading-relaxed max-w-md mx-auto">
        {t('welcome.s4.desc')}
      </p>
    </>
  )
}

function FeatureBadge({ icon, label, delay }) {
  return (
    <div
      className="p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)] text-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl mb-1 animate-crown-shimmer inline-block">{icon}</div>
      <div className="text-xs font-bold text-[color:var(--color-ink)]">{label}</div>
    </div>
  )
}

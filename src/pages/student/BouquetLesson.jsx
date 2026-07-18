import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import StudentLayout from '../../components/layout/StudentLayout'
import CelebrationOverlay from '../../components/CelebrationOverlay'
import { useLang } from '../../i18n/LangContext'
import { useBouquetLessons, useBouquetLessonProgress } from '../../hooks/useBouquetLessons'
import { useAppConfig } from '../../hooks/useAppConfig'
import { useProgress } from '../../hooks/useProgress'
import { useMilestones } from '../../hooks/useMilestones'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH } from '../../data/bouquets'
import { playMilestoneChime } from '../../utils/chime'
import QuestionRunner from '../../components/questions/QuestionRunner'

// Lean 3-step lesson: opening hadith → interactive practice → closing hadith.
// The individual name walks live on الوسيلة (BouquetSession); the lesson's
// job here is the *interactive* part — the questions the admin authored.
export default function BouquetLesson() {
  const { bouquetId } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { lessons } = useBouquetLessons()
  const { getStep, saveStep, markCompleted } = useBouquetLessonProgress()

  // Respect the curriculum gate on direct navigation to /lesson/:id.
  const { config, loading: configLoading } = useAppConfig()
  const { memorized, memorizedCount, entries } = useProgress()
  const { milestones } = useMilestones(entries, memorized, memorizedCount)
  const allUnlocked = milestones.length > 0 && milestones.every((m) => m.unlocked)
  const locked = config.gateCurriculum && !allUnlocked

  const bouquet = BOUQUETS.find((b) => b.id === bouquetId)
  const lesson = lessons.find((l) => l.id === bouquetId)

  const openingIdx = 0
  const practiceIdx = 1
  const closingIdx = 2
  const totalSteps = 3

  const [step, setStep] = useState(0)
  const [celebrated, setCelebrated] = useState(false)
  const [restored, setRestored] = useState(false)
  const [practiceResult, setPracticeResult] = useState(null) // { score, total }

  useEffect(() => {
    if (!bouquet || restored) return
    const saved = getStep(bouquetId)
    if (saved > 0 && saved < totalSteps) setStep(saved)
    setRestored(true)
  }, [bouquet, bouquetId, getStep, restored])

  useEffect(() => {
    if (!restored || !bouquet) return
    saveStep(bouquetId, step).catch(() => {})
  }, [step, bouquetId, saveStep, restored, bouquet])

  const goPrev = () => setStep((s) => Math.max(0, s - 1))
  const goNext = () => {
    if (step < closingIdx) {
      setStep((s) => Math.min(closingIdx, s + 1))
      return
    }
    playMilestoneChime()
    markCompleted(bouquetId, practiceResult || undefined).catch(() => {})
    setCelebrated(true)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  (lang === 'ar' ? goNext : goPrev)()
      if (e.key === 'ArrowRight') (lang === 'ar' ? goPrev : goNext)()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lang, step]) // eslint-disable-line

  // Gate enforcement — bounce back to the (locked) curriculum landing.
  if (!configLoading && locked) return <Navigate to="/curriculum" replace />

  if (!bouquet) {
    return (
      <StudentLayout>
        <div className="p-8 text-center">
          <p className="mb-4">{t('bouquet.not_found')}</p>
          <Link to="/curriculum" className="text-[color:var(--color-gold-deep)] font-bold">← {t('curriculum.back')}</Link>
        </div>
      </StudentLayout>
    )
  }

  const isGold = bouquet.color === 'gold'
  const phaseLabel =
      step === openingIdx  ? t('lesson.phase.opening')
    : step === practiceIdx ? `🎯 ${t('lesson.phase.practice')}`
    : t('lesson.phase.closing')

  return (
    <StudentLayout backTo="/curriculum">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6" dir="rtl">
        {/* Header */}
        <div className="mb-5 text-center">
          <div
            className="inline-block text-[11px] font-bold uppercase tracking-widest mb-1 px-3 py-0.5 rounded-full"
            style={{
              background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
              color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
            }}
          >
            {t('bouquet.tag')}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mt-1">
            {bouquet.title}
          </h1>
        </div>

        {/* Progress + phase label */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
            <span>
              {t('lesson.step')} {step + 1} / {totalSteps}
              <span className="text-[color:var(--color-ink-mute)]"> · </span>
              <span className="text-[color:var(--color-ink)]">{phaseLabel}</span>
            </span>
            <span dir="ltr">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((step + 1) / totalSteps) * 100}%`,
                background: isGold
                  ? 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))'
                  : 'linear-gradient(90deg, var(--color-teal-soft), var(--color-teal))',
              }}
            />
          </div>
        </div>

        {/* Scene body */}
        <div key={step} className="animate-fade-in-up">
          {step === openingIdx && (
            <OpeningScene lesson={lesson} lang={lang} t={t} />
          )}
          {step === practiceIdx && (
            <QuestionRunner
              bouquetId={bouquet.id}
              onComplete={(result) => { setPracticeResult(result || null); setStep(closingIdx) }}
            />
          )}
          {step === closingIdx && (
            <ClosingScene lesson={lesson} lang={lang} t={t} />
          )}
        </div>

        {/* Bottom nav — on the practice step the runner owns advancement,
             so no Next button here to bypass the questions. */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="px-5 py-3 rounded-2xl text-sm font-bold border border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            → {t('lesson.prev')}
          </button>
          {step !== practiceIdx ? (
            <button
              type="button"
              onClick={goNext}
              className={
                'px-6 py-3 rounded-2xl text-sm font-bold transition ' +
                (step === closingIdx
                  ? 'bg-[color:var(--color-gold-deep)] text-white hover:bg-[color:var(--color-gold)] '
                  : 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)]')
              }
            >
              {step === closingIdx ? t('lesson.seal') : t('lesson.next')} ←
            </button>
          ) : (
            <span className="text-[11px] text-[color:var(--color-ink-mute)] italic max-w-[60%] text-end leading-relaxed">
              {t('lesson.practice_gate_hint')}
            </span>
          )}
        </div>
      </div>

      <CelebrationOverlay
        open={celebrated}
        bouquetTitle={bouquet.title}
        onClose={() => { setCelebrated(false); navigate('/curriculum') }}
      />
    </StudentLayout>
  )
}

/* ─── Scenes ──────────────────────────────────────────── */

function OpeningScene({ lesson, lang, t }) {
  const intro = (lang === 'en' && lesson?.introEn) ? lesson.introEn : (lesson?.introAr || '')
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] text-center">
      <div className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)] mb-4">
        {t('memorize.hadith.opening_label')}
      </div>
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[color:var(--color-ink)] max-w-2xl mx-auto" dir="rtl">
        «{OPENING_HADITH.text}»
      </p>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{OPENING_HADITH.source}</p>

      {intro && (
        <div className="mt-6 p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)]">
          <p className="text-base text-[color:var(--color-ink)] leading-relaxed">{intro}</p>
        </div>
      )}
    </div>
  )
}

function ClosingScene({ lesson, lang, t }) {
  const outro = (lang === 'en' && lesson?.outroEn) ? lesson.outroEn : (lesson?.outroAr || '')
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] text-center">
      <div className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-deep)] mb-4">
        {t('memorize.hadith.closing_label')}
      </div>
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[color:var(--color-ink)] max-w-2xl mx-auto" dir="rtl">
        «{CLOSING_HADITH.text}»
      </p>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{CLOSING_HADITH.source}</p>

      {outro && (
        <div className="mt-6 p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)]">
          <p className="text-base text-[color:var(--color-ink)] leading-relaxed">{outro}</p>
        </div>
      )}
    </div>
  )
}

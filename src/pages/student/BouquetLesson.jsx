import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StudentLayout from '../../components/layout/StudentLayout'
import CelebrationOverlay from '../../components/CelebrationOverlay'
import { useLang } from '../../i18n/LangContext'
import { useNames } from '../../hooks/useNames'
import { useProgress } from '../../hooks/useProgress'
import { useBouquetLessons, useBouquetLessonProgress } from '../../hooks/useBouquetLessons'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH } from '../../data/bouquets'
import { playChime, playMilestoneChime } from '../../utils/chime'
import QuestionRunner from '../../components/questions/QuestionRunner'

// Template runner for /lesson/:bouquetId.
// Every lesson — regardless of bouquet — follows the same 4-scene skeleton
// so the sheikh's method is preserved end-to-end:
//   1. opening (hadith + intro)
//   2. names walk (one step per name, showing all 4 verbs)
//   3. practice placeholder (interactive questions land here later)
//   4. closing (hadith + seal)
export default function BouquetLesson() {
  const { bouquetId } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { byBouquet } = useNames()
  const { memorized, markMemorized, unmarkMemorized } = useProgress()
  const { lessons } = useBouquetLessons()
  const { getStep, saveStep, markCompleted, isCompleted } = useBouquetLessonProgress()

  const bouquet = BOUQUETS.find((b) => b.id === bouquetId)
  const lesson = lessons.find((l) => l.id === bouquetId)
  const names = useMemo(
    () => (byBouquet[bouquetId] || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [byBouquet, bouquetId]
  )

  // Steps: 0 = opening, 1..N = one per name, N+1 = practice, N+2 = closing
  const openingIdx = 0
  const firstNameIdx = 1
  const lastNameIdx = names.length
  const practiceIdx = names.length + 1
  const closingIdx = names.length + 2
  const totalSteps = closingIdx + 1

  const [step, setStep] = useState(0)
  const [celebrated, setCelebrated] = useState(false)
  const [restored, setRestored] = useState(false)

  // Restore last step once, from Firestore
  useEffect(() => {
    if (!bouquet || restored || names.length === 0) return
    const saved = getStep(bouquetId)
    if (saved > 0 && saved < totalSteps) setStep(saved)
    setRestored(true)
  }, [bouquet, bouquetId, getStep, restored, names.length, totalSteps])

  // Persist step (debounced by React re-render only — cheap enough)
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
    // At closing → seal
    if (!isCompleted(bouquetId)) {
      playMilestoneChime()
      markCompleted(bouquetId).catch(() => {})
    }
    setCelebrated(true)
  }

  // Arrow-key nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  (lang === 'ar' ? goNext : goPrev)()
      if (e.key === 'ArrowRight') (lang === 'ar' ? goPrev : goNext)()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lang, step, closingIdx]) // eslint-disable-line

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

  if (names.length === 0) {
    return (
      <StudentLayout backTo="/curriculum">
        <div className="p-8 text-center text-[color:var(--color-ink-mute)]">…</div>
      </StudentLayout>
    )
  }

  const isGold = bouquet.color === 'gold'
  const activeName = step >= firstNameIdx && step <= lastNameIdx ? names[step - 1] : null

  return (
    <StudentLayout backTo="/curriculum">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6" dir="rtl">
        {/* Header: bouquet title + step ribbon */}
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

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
            <span>{t('lesson.step')} {step + 1} / {totalSteps}</span>
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

        {/* Four-verb ribbon (only meaningful during name steps) */}
        {activeName && <FourVerbRibbon />}

        {/* Scene body */}
        <div key={step} className="animate-fade-in-up">
          {step === openingIdx && (
            <OpeningScene lesson={lesson} bouquet={bouquet} lang={lang} t={t} />
          )}

          {activeName && (
            <NameScene
              name={activeName}
              bouquet={bouquet}
              index={step - firstNameIdx}
              total={names.length}
              isMemorized={memorized.has(activeName.id)}
              onMemorize={() => { playChime(); markMemorized(activeName.id) }}
              onUnmemorize={() => unmarkMemorized(activeName.id)}
              lang={lang}
              t={t}
            />
          )}

          {step === practiceIdx && (
            <QuestionRunner
              bouquetId={bouquet.id}
              onComplete={() => setStep(closingIdx)}
            />
          )}

          {step === closingIdx && (
            <ClosingScene lesson={lesson} bouquet={bouquet} lang={lang} t={t} />
          )}
        </div>

        {/* Bottom nav */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="px-5 py-3 rounded-2xl text-sm font-bold border border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            → {t('lesson.prev')}
          </button>
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

/* ─── Scene components ─────────────────────────────────────── */

function FourVerbRibbon() {
  const items = [
    { icon: '📖', label: 'أعرف' },
    { icon: '🌟', label: 'أثني' },
    { icon: '🤲', label: 'أدعو' },
    { icon: '💛', label: 'أتعبد' },
  ]
  return (
    <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
      {items.map((v) => (
        <span
          key={v.label}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[color:var(--color-cream-deep)] text-xs font-bold text-[color:var(--color-ink-soft)]"
        >
          <span>{v.icon}</span>
          <span>{v.label}</span>
        </span>
      ))}
    </div>
  )
}

function OpeningScene({ lesson, bouquet, lang, t }) {
  const intro = (lang === 'en' && lesson?.introEn) ? lesson.introEn : (lesson?.introAr || '')
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-3">
        {t('lesson.opening_label')}
      </div>
      <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">
        {t('memorize.hadith.opening_label')}
      </h2>
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[color:var(--color-ink)] max-w-2xl mx-auto" dir="rtl">
        «{OPENING_HADITH.text}»
      </p>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{OPENING_HADITH.source}</p>

      {intro && (
        <div className="mt-6 p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-soft)] mb-1">
            {t('lesson.intro_label')} — {bouquet.title}
          </div>
          <p className="text-base text-[color:var(--color-ink)] leading-relaxed">{intro}</p>
        </div>
      )}
    </div>
  )
}

function NameScene({ name, bouquet, index, total, isMemorized, onMemorize, onUnmemorize, lang, t }) {
  const meaning = pickLang(name, 'meaning', lang)
  const thanaa  = pickLang(name, 'thanaa',  lang)
  const talab   = pickLang(name, 'talab',   lang)
  const taabbud = pickLang(name, 'taabbud', lang)
  const evidence = pickLang(name, 'evidence', lang)
  const isGold = bouquet.color === 'gold'

  return (
    <div className="space-y-4">
      {/* Name calligraphy card */}
      <div className="p-8 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] text-center relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ background: isGold ? 'var(--color-gold)' : 'var(--color-teal)' }}
        />
        <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-mute)] mb-2">
          {t('lesson.name_step_label')} {index + 1} / {total}
        </div>
        <h2 className="font-serif text-5xl sm:text-6xl font-bold text-[color:var(--color-ink)] mb-4">
          {name.name}
        </h2>
        {!name.isDua && (
          <button
            type="button"
            onClick={isMemorized ? onUnmemorize : onMemorize}
            className={
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ' +
              (isMemorized
                ? 'bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink)] border-2 border-[color:var(--color-cream-deep)]'
                : 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)]')
            }
          >
            {isMemorized ? t('name.action.unmemorize') : t('name.action.memorize')}
          </button>
        )}
      </div>

      {/* Four verbs */}
      <Verb num="①" icon="📖" label={t('name.acts.meaning')} verb={t('lesson.verb.meaning')} text={meaning} accent="gold" />
      <Verb num="②" icon="🌟" label={t('name.acts.thanaa')}  verb={t('lesson.verb.thanaa')}  text={thanaa}  accent="teal" />
      <Verb num="③" icon="🤲" label={t('name.acts.talab')}   verb={t('lesson.verb.talab')}   text={talab}   accent="gold" />
      <Verb num="④" icon="💛" label={t('name.acts.taabbud')} verb={t('lesson.verb.taabbud')} text={taabbud} accent="teal" fallback={t('lesson.taabbud_missing')} />

      {evidence && (
        <div className="p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-dashed border-[color:var(--color-cream-deep)] text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-soft)] mb-1">
            {t('name.acts.evidence')}
          </div>
          <p className="text-sm leading-relaxed text-[color:var(--color-ink)]">{evidence}</p>
        </div>
      )}
    </div>
  )
}

function Verb({ num, icon, label, verb, text, accent, fallback }) {
  const isGold = accent === 'gold'
  const color = isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)'
  return (
    <div className="p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)]">
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-lg font-bold" style={{ color }}>{num}</span>
            <span className="text-xs font-bold" style={{ color }}>{label}</span>
            <span className="text-[11px] font-bold text-[color:var(--color-ink-mute)]">— {verb}</span>
          </div>
          {text ? (
            <p className="text-base leading-relaxed text-[color:var(--color-ink)]">{text}</p>
          ) : (
            <p className="text-sm italic text-[color:var(--color-ink-mute)]">{fallback || '…'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function ClosingScene({ lesson, bouquet, lang, t }) {
  const outro = (lang === 'en' && lesson?.outroEn) ? lesson.outroEn : (lesson?.outroAr || '')
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-teal-deep)] mb-3">
        {t('lesson.closing_label')}
      </div>
      <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">
        {t('memorize.hadith.closing_label')}
      </h2>
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[color:var(--color-ink)] max-w-2xl mx-auto" dir="rtl">
        «{CLOSING_HADITH.text}»
      </p>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-2">{CLOSING_HADITH.source}</p>

      {outro && (
        <div className="mt-6 p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-soft)] mb-1">
            {t('lesson.outro_label')} — {bouquet.title}
          </div>
          <p className="text-base text-[color:var(--color-ink)] leading-relaxed">{outro}</p>
        </div>
      )}
    </div>
  )
}

function pickLang(obj, field, lang) {
  if (lang === 'en') {
    const en = obj[field + 'En']
    if (en && en.trim()) return en
  }
  return obj[field] || ''
}

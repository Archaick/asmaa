import { useEffect, useMemo, useRef, useState } from 'react'
import { useBouquetQuestions, NAME_FIELDS } from '../../hooks/useBouquetQuestions'
import { useNames } from '../../hooks/useNames'
import { useLang } from '../../i18n/LangContext'
import { playChime, playMilestoneChime } from '../../utils/chime'

// How long the correct/wrong feedback modal lingers before auto-advancing.
const ADVANCE_DELAY_CORRECT = 1200
const ADVANCE_DELAY_WRONG = 2200

const CHEER_KEYS = ['practice.cheer.a', 'practice.cheer.b', 'practice.cheer.c', 'practice.cheer.d']
const TRYAGAIN_KEYS = ['practice.tryagain.a', 'practice.tryagain.b']

// Duolingo-style practice block for a bouquet lesson.
// - Reads published questions from /bouquetLessons/{id}/questions/*
// - Renders each with the appropriate type-specific component
// - Shows a progress bar, correct/wrong feedback, and a summary at the end
// - When the student clicks 'أكمل الدرس', onComplete fires so the parent
//   lesson runner can advance to the closing hadith step.
export default function QuestionRunner({ bouquetId, onComplete }) {
  const { questions, loading } = useBouquetQuestions(bouquetId, { publishedOnly: true })
  const { byBouquet, findName } = useNames()
  const bouquetNames = useMemo(
    () => (byBouquet[bouquetId] || []).filter((n) => !n.isDua),
    [byBouquet, bouquetId]
  )
  const { t, lang } = useLang()

  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(null)
  const [score, setScore] = useState(0)
  const advTimer = useRef(null)

  const total = questions.length
  const q = questions[index]
  const done = total > 0 && index >= total

  const onAnswer = (correct) => {
    if (answered) return
    setAnswered(true)
    setWasCorrect(!!correct)
    if (correct) {
      setScore((s) => s + 1)
      playChime()
    }
  }

  // Advance to the next question (or the summary). Single source of truth,
  // called both by the auto-advance timer and a tap-to-continue.
  const advance = () => {
    clearTimeout(advTimer.current)
    const nxt = index + 1
    if (nxt >= total) playMilestoneChime()
    setAnswered(false)
    setWasCorrect(null)
    setIndex(nxt)
  }

  // Duolingo-style: once a question is answered, linger on the feedback for
  // a beat then move on automatically — no manual "next" button.
  useEffect(() => {
    if (!answered) return
    const delay = wasCorrect ? ADVANCE_DELAY_CORRECT : ADVANCE_DELAY_WRONG
    advTimer.current = setTimeout(advance, delay)
    return () => clearTimeout(advTimer.current)
  }, [answered, wasCorrect, index]) // eslint-disable-line

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center text-sm text-[color:var(--color-ink-mute)]">
        …
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="font-display text-xl font-bold text-[color:var(--color-ink)] mb-2">{t('practice.empty.title')}</h2>
        <p className="text-sm text-[color:var(--color-ink-soft)] mb-5">{t('practice.empty.hint')}</p>
        <button
          type="button"
          onClick={() => onComplete(null)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] active:scale-[0.97] transition-all"
        >
          {t('practice.summary.continue')} ←
        </button>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    const perfect = score === total
    const restart = () => {
      setIndex(0); setScore(0); setAnswered(false); setWasCorrect(null)
    }
    return (
      <div className="p-8 rounded-3xl bg-white border-2 border-[color:var(--color-gold)] text-center animate-celebrate-pop">
        <div className="text-5xl mb-3">{perfect ? '🏆' : '🌟'}</div>
        <h2 className="font-display text-2xl font-bold text-[color:var(--color-ink)] mb-1">
          {t('practice.summary.title')}
        </h2>
        <div className="text-3xl font-display font-bold text-[color:var(--color-gold-deep)] mb-1" dir="ltr">
          {score} / {total}
        </div>
        <p className="text-sm text-[color:var(--color-ink-soft)] mb-6" dir="ltr">{pct}%</p>

        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <button
            type="button"
            onClick={restart}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border-2 border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] active:scale-[0.97] transition-all"
          >
            ↺ {t('practice.summary.retake')}
          </button>
          <button
            type="button"
            onClick={() => onComplete({ score, total })}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-base font-bold text-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))' }}
          >
            {t('practice.summary.continue')} ←
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProgressBar filled={index + (answered ? 1 : 0)} total={total} />

      <div key={q.id} className="rounded-3xl bg-white border border-[color:var(--color-cream-deep)] overflow-hidden animate-fade-swap">
        <div className="p-5 sm:p-7">
          <QuestionCard
            question={q}
            answered={answered}
            wasCorrect={wasCorrect}
            onAnswer={onAnswer}
            bouquetNames={bouquetNames}
            findName={findName}
            lang={lang}
            t={t}
          />
        </div>

      </div>

      {/* Duolingo-style feedback — a centered bubble that pops in the middle */}
      {answered && (
        <FeedbackModal correct={wasCorrect} onContinue={advance} t={t} />
      )}
    </div>
  )
}

// Centered celebratory bubble. Green pop + sparkles for correct, gentle red
// shake for wrong — playful and encouraging for all ages.
function FeedbackModal({ correct, onContinue, t }) {
  const cheer = useMemo(() => {
    const keys = correct ? CHEER_KEYS : TRYAGAIN_KEYS
    return keys[Math.floor(Math.random() * keys.length)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct])

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-5"
      onClick={onContinue}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-[color:var(--color-ink)]/35 backdrop-blur-sm animate-fade-swap" />

      <div
        onClick={(e) => e.stopPropagation()}
        className={
          'relative w-full max-w-xs text-center rounded-[2rem] border-2 shadow-2xl px-7 py-8 bg-white animate-celebrate-pop ' +
          (correct ? 'border-[color:var(--color-teal)]' : 'border-red-300')
        }
      >
        {/* sparkle burst on correct */}
        {correct && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute animate-sparkle text-lg"
                style={{ '--r': `${(360 / 8) * i}deg`, animationDelay: `${(i % 4) * 60}ms`,
                         color: i % 2 ? 'var(--color-gold)' : 'var(--color-teal)' }}
              >
                ✦
              </span>
            ))}
          </div>
        )}

        <div
          className={
            'relative w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl text-white shadow-lg ' +
            (correct ? 'animate-feedback-icon' : 'animate-feedback-shake')
          }
          style={{ background: correct ? 'var(--color-teal-deep)' : '#dc2626' }}
        >
          {correct ? '✓' : '✗'}
        </div>

        <h3 className={'font-display text-2xl font-bold mb-1 ' + (correct ? 'text-[color:var(--color-teal-deep)]' : 'text-red-700')}>
          {t(cheer)}
        </h3>
        <p className="text-sm text-[color:var(--color-ink-soft)] mb-6">
          {correct ? t('practice.feedback.correct') : t('practice.feedback.wrong')}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className={
            'w-full py-3.5 rounded-2xl text-base font-bold text-white shadow-md active:scale-[0.96] transition ' +
            (correct ? 'bg-[color:var(--color-teal-deep)] hover:bg-[color:var(--color-teal)]' : 'bg-red-600 hover:bg-red-700')
          }
        >
          {t('practice.tap_continue')} ←
        </button>
      </div>
    </div>
  )
}

function ProgressBar({ filled, total }) {
  const pct = Math.round((filled / total) * 100)
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
        <span>🎯</span>
        <span dir="ltr">{Math.min(filled, total)} / {total}</span>
      </div>
      <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Dispatcher ──────────────────────────────────────── */

function QuestionCard(props) {
  const { question } = props
  if (question.type === 'multipleChoice') return <MCQuestion {...props} />
  if (question.type === 'trueFalse')      return <TFQuestion {...props} />
  if (question.type === 'wordPair')       return <WPQuestion {...props} />
  if (question.type === 'trace')          return <TraceQuestion {...props} />
  return <div className="text-sm text-red-700">نوع تمرين غير مدعوم: {question.type}</div>
}

/* ─── Multiple Choice ─────────────────────────────────── */

function MCQuestion({ question, answered, wasCorrect, onAnswer, bouquetNames, findName, lang, t }) {
  const subject = findName(question.mcSubjectNameId)
  const askField = question.mcAskField || 'meaning'
  const fieldMeta = NAME_FIELDS.find((f) => f.key === askField)
  const localized = (n, f) => (lang === 'en' && n[f + 'En'] ? n[f + 'En'] : n[f]) || ''

  const options = useMemo(() => {
    if (!subject) return []
    const correct = { text: localized(subject, askField), nameId: subject.id, correct: true }
    const distractorPool = question.mcDistractorNameIds?.length
      ? question.mcDistractorNameIds.map(findName).filter(Boolean)
      : bouquetNames.filter((n) => n.id !== subject.id)
    const distractors = shuffle(distractorPool)
      .filter((n) => localized(n, askField) && localized(n, askField) !== correct.text)
      .slice(0, 2)
      .map((n) => ({ text: localized(n, askField), nameId: n.id, correct: false }))
    return shuffle([correct, ...distractors])
  }, [subject?.id, askField, question.mcDistractorNameIds, bouquetNames])

  const [picked, setPicked] = useState(null)

  useEffect(() => { setPicked(null) }, [question.id])

  const prompt = question.mcCustomPrompt?.trim()
    || `ما ${fieldMeta?.label || askField} ${subject?.name || '؟'}؟`

  const pick = (i) => {
    if (answered) return
    setPicked(i)
    onAnswer(options[i]?.correct)
  }

  return (
    <div dir="rtl">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-2">
        {fieldMeta?.icon} {t('practice.type.mc')}
      </div>
      <h3 className="font-display text-lg sm:text-xl font-bold text-[color:var(--color-ink)] mb-5 leading-snug">
        {prompt}
      </h3>
      <div className="space-y-2">
        {options.map((o, i) => {
          const state = !answered
            ? picked === i ? 'picked' : 'idle'
            : o.correct ? 'correct'
              : picked === i ? 'wrong' : 'idle'
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={answered}
              className={
                'w-full text-start p-4 rounded-2xl border-2 font-semibold transition-all disabled:cursor-default ' +
                (state === 'correct'
                  ? 'border-[color:var(--color-teal)] bg-[color:var(--color-teal-soft)] text-[color:var(--color-ink)]'
                  : state === 'wrong'
                    ? 'border-red-400 bg-red-50 text-red-900'
                    : state === 'picked'
                      ? 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)] text-[color:var(--color-ink)]'
                      : 'border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold-soft)] active:scale-[0.99]')
              }
            >
              {o.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── True / False ───────────────────────────────────── */

function TFQuestion({ question, answered, wasCorrect, onAnswer, lang, t }) {
  const statement = (lang === 'en' && question.tfStatementEn?.trim())
    ? question.tfStatementEn
    : question.tfStatementAr

  const [picked, setPicked] = useState(null)
  useEffect(() => { setPicked(null) }, [question.id])

  const pick = (answer) => {
    if (answered) return
    setPicked(answer)
    onAnswer(answer === !!question.tfAnswer)
  }

  const btnState = (answer) => {
    if (!answered) return picked === answer ? 'picked' : 'idle'
    const correct = !!question.tfAnswer
    if (answer === correct) return 'correct'
    if (picked === answer) return 'wrong'
    return 'idle'
  }

  const cls = (state, baseColor) => {
    if (state === 'correct') return 'border-[color:var(--color-teal)] bg-[color:var(--color-teal-soft)] text-[color:var(--color-ink)]'
    if (state === 'wrong')   return 'border-red-400 bg-red-50 text-red-900'
    if (state === 'picked')  return baseColor
    return 'border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold-soft)]'
  }

  return (
    <div dir="rtl">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-2">
        ⚖️ {t('practice.type.tf')}
      </div>
      <div className="p-5 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)] mb-5">
        <p className="font-serif text-base sm:text-lg leading-relaxed text-[color:var(--color-ink)]">
          «{statement || '—'}»
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => pick(true)}
          disabled={answered}
          className={'p-4 rounded-2xl border-2 font-bold transition disabled:cursor-default active:scale-[0.98] ' + cls(btnState(true), 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)]')}
        >
          ✓ {t('practice.tf.true')}
        </button>
        <button
          type="button"
          onClick={() => pick(false)}
          disabled={answered}
          className={'p-4 rounded-2xl border-2 font-bold transition disabled:cursor-default active:scale-[0.98] ' + cls(btnState(false), 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)]')}
        >
          ✗ {t('practice.tf.false')}
        </button>
      </div>
    </div>
  )
}

/* ─── Word Pair (matching) ────────────────────────────── */

// Duolingo-style tile matching — NO connector lines (they scattered on
// resize and never looked good). Tap a name → tap its meaning. Correct pairs
// flash green and lock; wrong pairs shake red and reset. Purely flexbox, so
// resizing can never misplace anything.
function WPQuestion({ question, answered, onAnswer, findName, lang, t }) {
  const field = question.wpField || 'meaning'
  const fieldMeta = NAME_FIELDS.find((f) => f.key === field)
  const names = (question.wpNameIds || []).map(findName).filter(Boolean)
  const localized = (n, f) => (lang === 'en' && n[f + 'En'] ? n[f + 'En'] : n[f]) || ''

  const shuffledValues = useMemo(
    () => shuffle(names.map((n) => ({ id: n.id, text: localized(n, field) }))).filter((x) => x.text),
    [question.id]
  )

  const [selectedName, setSelectedName] = useState(null)  // nameId
  const [selectedValue, setSelectedValue] = useState(null) // valueId
  const [matched, setMatched] = useState(() => new Set())  // matched ids (name & value share id)
  const [wrongFlash, setWrongFlash] = useState(null)       // { nameId, valueId }
  const [wrongAttempts, setWrongAttempts] = useState(0)

  useEffect(() => {
    setSelectedName(null); setSelectedValue(null)
    setMatched(new Set()); setWrongFlash(null); setWrongAttempts(0)
  }, [question.id])

  // Whenever both a name and value are selected, resolve the attempt.
  useEffect(() => {
    if (selectedName == null || selectedValue == null) return
    if (selectedName === selectedValue) {
      const id = selectedName
      setMatched((m) => new Set(m).add(id))
      setSelectedName(null); setSelectedValue(null)
      playChime()
    } else {
      const flash = { nameId: selectedName, valueId: selectedValue }
      setWrongFlash(flash)
      setWrongAttempts((w) => w + 1)
      const to = setTimeout(() => {
        setWrongFlash(null); setSelectedName(null); setSelectedValue(null)
      }, 520)
      return () => clearTimeout(to)
    }
  }, [selectedName, selectedValue])

  // Completion.
  useEffect(() => {
    if (answered) return
    if (names.length > 0 && matched.size === names.length) {
      const to = setTimeout(() => onAnswer(wrongAttempts === 0), 450)
      return () => clearTimeout(to)
    }
  }, [matched, names.length, answered, wrongAttempts])

  // Stable pair number per name (1-based, order of the names list). Matched
  // values reveal the same number so the pairing reads at a glance.
  const numberOf = (id) => names.findIndex((n) => n.id === id) + 1

  const tileCls = (state) => {
    switch (state) {
      case 'matched':  return 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]'
      case 'wrong':    return 'bg-red-50 border-red-400 text-red-900 animate-feedback-shake'
      case 'selected': return 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)] scale-[1.03] shadow-md ring-2 ring-[color:var(--color-gold-soft)]'
      default:         return 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:shadow-sm active:scale-[0.98]'
    }
  }

  const nameState = (id) =>
    matched.has(id) ? 'matched'
    : wrongFlash?.nameId === id ? 'wrong'
    : selectedName === id ? 'selected'
    : 'idle'

  const valueState = (id) =>
    matched.has(id) ? 'matched'
    : wrongFlash?.valueId === id ? 'wrong'
    : selectedValue === id ? 'selected'
    : 'idle'

  return (
    <div dir="rtl">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-2">
        🔗 {t('practice.type.wp')} · {fieldMeta?.label}
      </div>
      <h3 className="font-display text-sm sm:text-base font-bold text-[color:var(--color-ink-soft)] mb-4">
        {t('practice.wp.hint')}
      </h3>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Names column */}
        <div className="space-y-2.5">
          {names.map((n) => {
            const state = nameState(n.id)
            const num = numberOf(n.id)
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => { if (!answered && state !== 'matched') setSelectedName((s) => (s === n.id ? null : n.id)) }}
                disabled={answered || state === 'matched'}
                className={'group relative w-full flex items-center gap-2.5 py-3.5 pe-3 ps-2 rounded-2xl border-2 transition-all ' + tileCls(state)}
              >
                <PairNumber n={num} state={state} />
                <span className="flex-1 font-serif text-lg font-bold text-center">{n.name}</span>
              </button>
            )
          })}
        </div>

        {/* Values column */}
        <div className="space-y-2.5">
          {shuffledValues.map((v) => {
            const state = valueState(v.id)
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => { if (!answered && state !== 'matched') setSelectedValue((s) => (s === v.id ? null : v.id)) }}
                disabled={answered || state === 'matched'}
                className={'group relative w-full flex items-center gap-2.5 py-3.5 pe-3 ps-2 rounded-2xl border-2 transition-all text-start ' + tileCls(state)}
              >
                <PairNumber n={state === 'matched' ? numberOf(v.id) : null} state={state} />
                <span className="flex-1 text-xs sm:text-sm font-semibold leading-snug">{v.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {names.map((n) => (
          <span
            key={n.id}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ background: matched.has(n.id) ? 'var(--color-teal)' : 'var(--color-cream-deep)' }}
          />
        ))}
        {wrongAttempts > 0 && (
          <span className="ms-2 text-[11px] font-bold text-red-500" dir="ltr">{wrongAttempts} ✗</span>
        )}
      </div>
    </div>
  )
}

// The round number chip on a pairing tile. Shows the pair number, a check
// when matched, or a hollow dot placeholder for an unmatched value tile.
function PairNumber({ n, state }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 transition-all'
  if (state === 'matched') {
    return (
      <span className={base + ' bg-[color:var(--color-teal)] border-[color:var(--color-teal)] text-white'}>
        {n != null ? n : '✓'}
      </span>
    )
  }
  if (n == null) {
    // unmatched value tile — subtle placeholder dot
    return <span className={base + ' border-dashed border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-mute)]'} />
  }
  const selected = state === 'selected'
  return (
    <span
      className={
        base + ' ' +
        (selected
          ? 'bg-[color:var(--color-gold)] border-[color:var(--color-gold)] text-white'
          : 'bg-[color:var(--color-cream-warm)] border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-soft)]')
      }
    >
      {n}
    </span>
  )
}

/* ─── Trace ──────────────────────────────────────────── */

// Trace with real hit-testing + off-letter clipping:
//   • One canvas, two layers of drawing:
//     1. Guide letter (light slate) rendered as base.
//     2. Blue dots painted at every interpolated pointer position — but
//        ONLY if that position falls inside a letter cell. Drags across
//        empty space render nothing at all, so the student sees no
//        progress unless their finger is actually on the letters.
//   • The letter is centred using measureText's actualBoundingBox so
//     Arabic serifs sit visually centred rather than at the em-baseline.
//   • Coverage % (touched-letter-cells / total-letter-cells) gates the
//     'أنجزت' button at COMPLETION_THRESHOLD.
const CELL_SIZE = 8
const COMPLETION_THRESHOLD = 0.85
const STROKE_RADIUS = 14
const INTERP_STEP = 2
const TRACE_COLOR = '#2563eb'    // blue-600
// Fully opaque slate-300 — visible as a guide, and its alpha=1 keeps
// source-atop strokes at their full colour instead of muting them.
const GUIDE_COLOR = '#cbd5e1'
const ALPHA_THRESHOLD = 80                    // 0-255; ~30% opaque counts as letter
const FONT_FAMILY = '"Noto Naskh Arabic", "Readex Pro", serif'

function TraceQuestion({ question, answered, onAnswer, findName, t }) {
  const name = findName(question.traceNameId)
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const letterCellsRef = useRef(new Set())
  const touchedCellsRef = useRef(new Set())
  const drawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const dprRef = useRef(1)
  const dimsRef = useRef({ w: 0, h: 0 })
  const [coverage, setCoverage] = useState(0)

  // Rebuild the canvas whenever the question changes or the container resizes.
  useEffect(() => {
    if (!name) return
    let disposed = false

    const setup = () => {
      const wrap = wrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return
      const rect = wrap.getBoundingClientRect()
      const w = Math.floor(rect.width)
      const h = Math.floor(rect.height)
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      dprRef.current = dpr
      dimsRef.current = { w, h }

      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Draw the guide letter — fully opaque light slate. Alpha=1 is
      // essential so source-atop strokes below render at full colour.
      const padY = h * 0.14
      const padX = w * 0.10
      const fontSize = Math.floor(Math.min((h - padY * 2) * 0.80, (w - padX * 2) * 0.65))
      ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.direction = 'rtl'
      ctx.fillStyle = GUIDE_COLOR

      const m = ctx.measureText(name.name)
      const ascent  = m.actualBoundingBoxAscent  ?? fontSize * 0.72
      const descent = m.actualBoundingBoxDescent ?? fontSize * 0.28
      // With textBaseline='middle', the em-middle is at y. Actual glyph
      // top is at y - ascent, bottom at y + descent, so visual centre is
      // at y + (descent - ascent)/2. To land visual centre on h/2, shift
      // y by (ascent - descent)/2. (The old code had this sign backwards
      // and pushed tall Arabic ascenders off the top of the canvas.)
      const yOffset = (ascent - descent) / 2
      ctx.fillText(name.name, w / 2, h / 2 + yOffset)

      // Build the letter-cell set from the alpha channel.
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const cellsX = Math.ceil(w / CELL_SIZE)
      const cellsY = Math.ceil(h / CELL_SIZE)
      const letterCells = new Set()
      for (let cy = 0; cy < cellsY; cy++) {
        for (let cx = 0; cx < cellsX; cx++) {
          const sx = Math.floor((cx + 0.5) * CELL_SIZE * dpr)
          const sy = Math.floor((cy + 0.5) * CELL_SIZE * dpr)
          if (sx >= canvas.width || sy >= canvas.height) continue
          const idx = (sy * canvas.width + sx) * 4
          if (img.data[idx + 3] > ALPHA_THRESHOLD) letterCells.add(`${cx},${cy}`)
        }
      }
      if (disposed) return
      letterCellsRef.current = letterCells
      touchedCellsRef.current = new Set()
      setCoverage(0)

      // Switch to source-atop so subsequent paint only lands on letter
      // pixels — the disc's edges are clipped precisely to the letter
      // shape by the compositing engine, no more paint spilling into
      // empty space around the cell centre.
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = TRACE_COLOR
    }

    setup()
    window.addEventListener('resize', setup)
    return () => { disposed = true; window.removeEventListener('resize', setup) }
  }, [name?.name, question.id])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const src = e.touches?.[0] || e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  // Paints a blue disc at (x, y). Composite is source-atop so parts of
  // the disc that fall on empty (non-letter) pixels are dropped by the
  // compositing engine — the paint precisely follows the letter shape,
  // including anti-aliased edges.
  const paintDot = (x, y) => {
    if (letterCellsRef.current.size === 0) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(x, y, STROKE_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  }

  // Mark every letter-cell within STROKE_RADIUS of (x, y) as touched.
  const markHits = (x, y) => {
    const letterCells = letterCellsRef.current
    if (letterCells.size === 0) return
    const r = STROKE_RADIUS + 2
    const minCX = Math.max(0, Math.floor((x - r) / CELL_SIZE))
    const maxCX = Math.floor((x + r) / CELL_SIZE)
    const minCY = Math.max(0, Math.floor((y - r) / CELL_SIZE))
    const maxCY = Math.floor((y + r) / CELL_SIZE)
    let added = false
    const touched = touchedCellsRef.current
    for (let cy = minCY; cy <= maxCY; cy++) {
      for (let cx = minCX; cx <= maxCX; cx++) {
        const key = `${cx},${cy}`
        if (!letterCells.has(key) || touched.has(key)) continue
        const centerX = (cx + 0.5) * CELL_SIZE
        const centerY = (cy + 0.5) * CELL_SIZE
        if ((centerX - x) ** 2 + (centerY - y) ** 2 <= r * r) {
          touched.add(key); added = true
        }
      }
    }
    if (added) setCoverage(touched.size / letterCells.size)
  }

  // Paints (and hit-registers) along the segment from (fromX,fromY) to
  // (toX,toY) at INTERP_STEP px increments. Ensures continuous colour on
  // fast finger drags without leaving gaps between move events.
  const paintSegment = (fromX, fromY, toX, toY) => {
    const dx = toX - fromX
    const dy = toY - fromY
    const dist = Math.hypot(dx, dy)
    const steps = Math.max(1, Math.ceil(dist / INTERP_STEP))
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const px = fromX + dx * t
      const py = fromY + dy * t
      paintDot(px, py)
      markHits(px, py)
    }
  }

  const start = (e) => {
    e.preventDefault()
    if (answered) return
    drawingRef.current = true
    const { x, y } = getPos(e)
    paintDot(x, y)
    markHits(x, y)
    lastPosRef.current = { x, y }
  }

  const move = (e) => {
    if (!drawingRef.current || answered) return
    e.preventDefault()
    const { x, y } = getPos(e)
    const { x: lx, y: ly } = lastPosRef.current
    paintSegment(lx, ly, x, y)
    lastPosRef.current = { x, y }
  }

  const end = () => { drawingRef.current = false }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas || !name) return
    const { w, h } = dimsRef.current
    const dpr = dprRef.current
    const ctx = canvas.getContext('2d')

    // Reset composite mode + repaint the guide from scratch.
    ctx.globalCompositeOperation = 'source-over'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const padY = h * 0.14
    const padX = w * 0.10
    const fontSize = Math.floor(Math.min((h - padY * 2) * 0.80, (w - padX * 2) * 0.65))
    ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = 'rtl'
    ctx.fillStyle = GUIDE_COLOR
    const m = ctx.measureText(name.name)
    const ascent  = m.actualBoundingBoxAscent  ?? fontSize * 0.72
    const descent = m.actualBoundingBoxDescent ?? fontSize * 0.28
    ctx.fillText(name.name, w / 2, h / 2 + (ascent - descent) / 2)

    // Back to clip-mode + trace colour for the next round of strokes.
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillStyle = TRACE_COLOR

    touchedCellsRef.current = new Set()
    setCoverage(0)
  }

  const pct = Math.min(100, Math.round(coverage * 100))
  const canFinish = coverage >= COMPLETION_THRESHOLD

  return (
    <div dir="rtl">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-2">
        ✍️ {t('practice.type.trace')}
      </div>
      <h3 className="font-display text-sm sm:text-base font-bold text-[color:var(--color-ink-soft)] mb-4">
        {t('practice.trace.hint')}
      </h3>

      <div
        ref={wrapRef}
        className="relative rounded-3xl bg-[color:var(--color-cream-warm)] border-2 border-dashed border-[color:var(--color-cream-deep)] overflow-hidden"
        style={{ height: 360 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </div>

      {/* Coverage bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1">
          <span>{t('practice.trace.coverage')}</span>
          <span dir="ltr">{pct}%</span>
        </div>
        <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-150"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, #93c5fd, ${TRACE_COLOR})`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={answered || coverage === 0}
          className="px-4 py-2 rounded-full text-xs font-bold border border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink-mute)] disabled:opacity-40 transition"
        >
          ↺ {t('practice.trace.clear')}
        </button>
        <button
          type="button"
          onClick={() => onAnswer(true)}
          disabled={answered || !canFinish}
          className="px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-sm hover:shadow-md active:scale-[0.97] disabled:opacity-40 transition-all"
          style={{ background: canFinish ? TRACE_COLOR : '#94a3b8' }}
        >
          {canFinish ? `✓ ${t('practice.trace.done')}` : t('practice.trace.trace_more')}
        </button>
      </div>
    </div>
  )
}

/* ─── util ────────────────────────────────────────────── */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

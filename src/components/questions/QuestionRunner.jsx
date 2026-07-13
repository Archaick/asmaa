import { useEffect, useMemo, useRef, useState } from 'react'
import { useBouquetQuestions, NAME_FIELDS } from '../../hooks/useBouquetQuestions'
import { useNames } from '../../hooks/useNames'
import { useLang } from '../../i18n/LangContext'
import { playChime, playMilestoneChime } from '../../utils/chime'

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

  const onNext = () => {
    if (index + 1 >= total) {
      playMilestoneChime()
      setIndex(index + 1)
    } else {
      setIndex((i) => i + 1)
      setAnswered(false)
      setWasCorrect(null)
    }
  }

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
        <p className="text-sm text-[color:var(--color-ink-soft)]">{t('practice.empty.hint')}</p>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    return (
      <div className="p-8 rounded-3xl bg-white border-2 border-[color:var(--color-gold)] text-center animate-celebrate-pop">
        <div className="text-5xl mb-3">🌟</div>
        <h2 className="font-display text-2xl font-bold text-[color:var(--color-ink)] mb-2">
          {t('practice.summary.title')}
        </h2>
        <p className="text-[color:var(--color-ink-soft)] mb-4" dir="ltr">
          {score} / {total} · {pct}%
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-bold text-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all"
          style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))' }}
        >
          {t('practice.summary.continue')} ←
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProgressBar index={index} total={total} />

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

        {answered && (
          <div className={'px-5 sm:px-7 py-4 border-t border-[color:var(--color-cream-deep)] flex items-center justify-between gap-3 ' + (wasCorrect ? 'bg-[color:var(--color-teal-soft)]' : 'bg-red-50')}>
            <div className={'text-sm font-bold ' + (wasCorrect ? 'text-[color:var(--color-teal-deep)]' : 'text-red-800')}>
              {wasCorrect ? `✓ ${t('practice.feedback.correct')}` : `✗ ${t('practice.feedback.wrong')}`}
            </div>
            <button
              type="button"
              onClick={onNext}
              className={
                'px-5 py-2 rounded-full text-sm font-bold shadow-sm active:scale-[0.97] transition ' +
                (wasCorrect
                  ? 'bg-[color:var(--color-teal-deep)] text-white hover:bg-[color:var(--color-teal)]'
                  : 'bg-red-700 text-white hover:bg-red-800')
              }
            >
              {index + 1 >= total ? t('practice.finish') : t('practice.next')} ←
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgressBar({ index, total }) {
  const pct = Math.round((index / total) * 100)
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
        <span>🎯</span>
        <span dir="ltr">{index} / {total}</span>
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

function WPQuestion({ question, answered, wasCorrect, onAnswer, findName, lang, t }) {
  const field = question.wpField || 'meaning'
  const fieldMeta = NAME_FIELDS.find((f) => f.key === field)
  const names = (question.wpNameIds || []).map(findName).filter(Boolean)
  const localized = (n, f) => (lang === 'en' && n[f + 'En'] ? n[f + 'En'] : n[f]) || ''

  const shuffledValues = useMemo(
    () => shuffle(names.map((n) => ({ id: n.id, text: localized(n, field) }))).filter((x) => x.text),
    [question.id]
  )

  const [selectedName, setSelectedName] = useState(null) // nameId
  const [matched, setMatched] = useState({}) // { nameId: true }
  const [wrongFlash, setWrongFlash] = useState(null) // { nameId, valueId }
  const [attempts, setAttempts] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [lines, setLines] = useState([]) // [{ id, x1, y1, x2, y2 }]

  // Refs to compute connector line endpoints per matched pair.
  const gridRef = useRef(null)
  const nameRefs = useRef({})
  const valueRefs = useRef({})
  const setNameRef = (id) => (el) => { if (el) nameRefs.current[id] = el }
  const setValueRef = (id) => (el) => { if (el) valueRefs.current[id] = el }

  useEffect(() => {
    setSelectedName(null); setMatched({}); setWrongFlash(null)
    setAttempts(0); setWrongAttempts(0); setLines([])
  }, [question.id])

  // Detect completion
  useEffect(() => {
    if (answered) return
    if (names.length > 0 && Object.keys(matched).length === names.length * 2) {
      // Small delay so the last connector line finishes drawing before feedback
      const to = setTimeout(() => {
        onAnswer(wrongAttempts === 0)
      }, 550)
      return () => clearTimeout(to)
    }
  }, [matched, names.length, answered, wrongAttempts])

  // Adds a connector line between the two matched boxes. Coordinates are
  // relative to the grid container so the SVG can position them cleanly.
  const addLine = (nameId, valueId) => {
    const grid = gridRef.current
    const nameEl = nameRefs.current[nameId]
    const valueEl = valueRefs.current[valueId]
    if (!grid || !nameEl || !valueEl) return
    const gr = grid.getBoundingClientRect()
    const nr = nameEl.getBoundingClientRect()
    const vr = valueEl.getBoundingClientRect()
    // Names live in the RTL-first (right) column, values in the second (left).
    // Line runs from the name box's LEFT edge to the value box's RIGHT edge.
    const x1 = nr.left  - gr.left
    const y1 = nr.top   - gr.top + nr.height / 2
    const x2 = vr.right - gr.left
    const y2 = vr.top   - gr.top + vr.height / 2
    setLines((prev) => [...prev, { id: `${nameId}-${valueId}`, x1, y1, x2, y2 }])
  }

  const onPickName = (nameId) => {
    if (answered || matched[nameId]) return
    setSelectedName((s) => (s === nameId ? null : nameId))
  }

  const onPickValue = (valueId) => {
    if (answered || !selectedName) return
    if (matched[valueId] || matched[selectedName]) return
    setAttempts((a) => a + 1)
    if (selectedName === valueId) {
      const pickedName = selectedName
      addLine(pickedName, valueId)
      setMatched((m) => ({ ...m, [pickedName]: true, [valueId]: true }))
      setSelectedName(null)
      playChime()
    } else {
      setWrongAttempts((w) => w + 1)
      setWrongFlash({ nameId: selectedName, valueId })
      setTimeout(() => setWrongFlash(null), 500)
      setSelectedName(null)
    }
  }

  return (
    <div dir="rtl">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-2">
        🔗 {t('practice.type.wp')} · {fieldMeta?.label}
      </div>
      <h3 className="font-display text-sm sm:text-base font-bold text-[color:var(--color-ink-soft)] mb-4">
        {t('practice.wp.hint')}
      </h3>

      <div ref={gridRef} className="relative grid grid-cols-2 gap-3">
        {/* Connector lines overlay — drawn top of columns, ignores clicks */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5, overflow: 'visible' }}
          aria-hidden="true"
        >
          {lines.map((line) => {
            const length = Math.hypot(line.x2 - line.x1, line.y2 - line.y1)
            return (
              <line
                key={line.id}
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke="var(--color-teal-deep)"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-pair-line"
                style={{ strokeDasharray: length, strokeDashoffset: length }}
              />
            )
          })}
        </svg>

        {/* Names column */}
        <div className="space-y-2 relative" style={{ zIndex: 1 }}>
          {names.map((n) => {
            const isMatched = matched[n.id]
            const isSelected = selectedName === n.id
            const isWrong = wrongFlash?.nameId === n.id
            return (
              <button
                key={n.id}
                ref={setNameRef(n.id)}
                type="button"
                onClick={() => onPickName(n.id)}
                disabled={answered || isMatched}
                className={
                  'w-full py-3 px-2 rounded-xl font-serif text-base font-bold border-2 transition ' +
                  (isMatched
                    ? 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]'
                    : isWrong
                      ? 'bg-red-50 border-red-400 text-red-900'
                      : isSelected
                        ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)] scale-[1.02]'
                        : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold-soft)]')
                }
              >
                {n.name}
              </button>
            )
          })}
        </div>

        {/* Values column */}
        <div className="space-y-2 relative" style={{ zIndex: 1 }}>
          {shuffledValues.map((v) => {
            const isMatched = matched[v.id]
            const isWrong = wrongFlash?.valueId === v.id
            return (
              <button
                key={v.id}
                ref={setValueRef(v.id)}
                type="button"
                onClick={() => onPickValue(v.id)}
                disabled={answered || isMatched}
                className={
                  'w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold border-2 transition text-start leading-snug ' +
                  (isMatched
                    ? 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]'
                    : isWrong
                      ? 'bg-red-50 border-red-400 text-red-900'
                      : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold-soft)]')
                }
              >
                {v.text}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[color:var(--color-ink-mute)] text-center" dir="ltr">
        {Object.keys(matched).length / 2} / {names.length}
        {wrongAttempts > 0 && ` · ${wrongAttempts} ✗`}
      </div>
    </div>
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

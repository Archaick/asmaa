import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { useNames } from '../../hooks/useNames'
import {
  useBouquetQuestions, addQuestion, updateQuestion, deleteQuestion,
  reorderQuestions, defaultsFor, QUESTION_TYPES, NAME_FIELDS,
} from '../../hooks/useBouquetQuestions'
import { BOUQUETS } from '../../data/bouquets'

// Admin authoring page for practice questions on a single bouquet lesson.
// All 4 types (multi-choice, true/false, word pair, trace) authored here.
// Answers reference the الاسماء database — admin picks a name, we pull the
// canonical meaning/thanaa/talab/taabbud/audio automatically.
export default function BouquetLessonQuestions() {
  const { bouquetId } = useParams()
  const bouquet = BOUQUETS.find((b) => b.id === bouquetId)
  const { byBouquet } = useNames()
  const { questions, loading } = useBouquetQuestions(bouquetId)
  const [addingType, setAddingType] = useState(null)

  const bouquetNames = useMemo(
    () => (byBouquet[bouquetId] || []).filter((n) => !n.isDua),
    [byBouquet, bouquetId]
  )

  const published = questions.filter((q) => q.published).length

  const onAdd = async (type) => {
    await addQuestion(bouquetId, defaultsFor(type))
    setAddingType(null)
  }

  if (!bouquet) {
    return <AdminLayout title="—"><div className="p-6">لم نجد الباقة</div></AdminLayout>
  }

  return (
    <AdminLayout
      title={`تمارين — ${bouquet.title}`}
      subtitle={`${questions.length} تمرين · ${published} منشور`}
    >
      <Link to="/admin/curriculum" className="inline-flex items-center gap-1 text-sm font-bold text-[color:var(--color-gold-deep)] hover:underline mb-5">
        ← عودة لقائمة الدروس
      </Link>

      {/* Add-question tray */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-[color:var(--color-cream-deep)]">
        <div className="font-bold text-sm text-[color:var(--color-ink)] mb-3">إضافة تمرين جديد</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onAdd(t.key)}
              disabled={addingType === t.key}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-[color:var(--color-cream-deep)] bg-white hover:border-[color:var(--color-gold)] hover:bg-[color:var(--color-cream-warm)] transition text-center disabled:opacity-60"
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-bold text-[color:var(--color-ink)]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[color:var(--color-ink-mute)]">جارٍ التحميل…</div>
      ) : questions.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="space-y-3">
          {questions.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              bouquetId={bouquetId}
              bouquetNames={bouquetNames}
              onMoveUp={() => reorderQuestions(bouquetId, questions, i, i - 1)}
              onMoveDown={() => reorderQuestions(bouquetId, questions, i, i + 1)}
            />
          ))}
        </ol>
      )}
    </AdminLayout>
  )
}

/* ─── Row ─────────────────────────────────────────────── */

function QuestionRow({ question, index, total, bouquetId, bouquetNames, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)

  const togglePublish = async () => {
    setBusy(true)
    try { await updateQuestion(bouquetId, question.id, { published: !question.published }) }
    finally { setBusy(false) }
  }

  const onDelete = async () => {
    if (!window.confirm('حذف هذا التمرين نهائياً؟')) return
    setBusy(true)
    try { await deleteQuestion(bouquetId, question.id) }
    finally { setBusy(false) }
  }

  const typeMeta = QUESTION_TYPES.find((t) => t.key === question.type)

  return (
    <li className="rounded-2xl bg-white border border-[color:var(--color-cream-deep)] overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-lg bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)] flex items-center justify-center font-display font-bold text-sm text-[color:var(--color-ink-soft)] shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{typeMeta?.icon}</span>
            <span className="font-bold text-sm text-[color:var(--color-ink)]">{typeMeta?.label || question.type}</span>
            {question.published ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-deep)]">منشور</span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-mute)]">مسودّة</span>
            )}
          </div>
          <QuestionSummary question={question} bouquetNames={bouquetNames} />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconBtn onClick={onMoveUp} disabled={index === 0} label="↑">↑</IconBtn>
          <IconBtn onClick={onMoveDown} disabled={index === total - 1} label="↓">↓</IconBtn>
          <button
            type="button"
            onClick={togglePublish}
            disabled={busy}
            className={
              'px-3 py-1.5 rounded-lg text-xs font-bold transition ' +
              (question.published
                ? 'bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-deep)] border border-[color:var(--color-cream-deep)]'
                : 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)]')
            }
          >
            {question.published ? 'إخفاء' : 'نشر'}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg hover:bg-[color:var(--color-cream-warm)] transition flex items-center justify-center"
            aria-label="تحرير"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 className={'transition-transform ' + (expanded ? 'rotate-180' : '')}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 border-t border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]" dir="rtl">
          <QuestionForm
            question={question}
            bouquetId={bouquetId}
            bouquetNames={bouquetNames}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="px-4 py-2 rounded-full text-xs font-bold border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition disabled:opacity-60"
            >
              🗑️ حذف
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function QuestionSummary({ question, bouquetNames }) {
  const nameOf = (id) => bouquetNames.find((n) => n.id === id)?.name || id
  if (question.type === 'multipleChoice') {
    const name = nameOf(question.mcSubjectNameId)
    const field = NAME_FIELDS.find((f) => f.key === question.mcAskField)?.label || question.mcAskField
    return <div className="text-xs text-[color:var(--color-ink-soft)] mt-0.5 truncate">{field} · {name || '—'}</div>
  }
  if (question.type === 'trueFalse') {
    return <div className="text-xs text-[color:var(--color-ink-soft)] mt-0.5 truncate">«{question.tfStatementAr || '—'}»</div>
  }
  if (question.type === 'wordPair') {
    const field = NAME_FIELDS.find((f) => f.key === question.wpField)?.label || question.wpField
    return <div className="text-xs text-[color:var(--color-ink-soft)] mt-0.5">{field} · {(question.wpNameIds || []).length} أزواج</div>
  }
  if (question.type === 'trace') {
    return <div className="text-xs text-[color:var(--color-ink-soft)] mt-0.5">اسم: {nameOf(question.traceNameId) || '—'}</div>
  }
  return null
}

/* ─── Forms per type ──────────────────────────────────── */

function QuestionForm({ question, bouquetId, bouquetNames }) {
  if (question.type === 'multipleChoice') {
    return <MCForm question={question} bouquetId={bouquetId} bouquetNames={bouquetNames} />
  }
  if (question.type === 'trueFalse') {
    return <TFForm question={question} bouquetId={bouquetId} />
  }
  if (question.type === 'wordPair') {
    return <WPForm question={question} bouquetId={bouquetId} bouquetNames={bouquetNames} />
  }
  if (question.type === 'trace') {
    return <TraceForm question={question} bouquetId={bouquetId} bouquetNames={bouquetNames} />
  }
  return null
}

function MCForm({ question, bouquetId, bouquetNames }) {
  const saved = useAutoSave(bouquetId, question)
  const [form, setForm] = saved

  const subject = bouquetNames.find((n) => n.id === form.mcSubjectNameId)
  const correctText = subject?.[form.mcAskField] || ''

  return (
    <>
      <Label>الاسم موضوع السؤال</Label>
      <NameSelect
        value={form.mcSubjectNameId}
        onChange={(v) => setForm({ ...form, mcSubjectNameId: v })}
        options={bouquetNames}
      />

      <Label>المطلوب</Label>
      <SegmentedField
        value={form.mcAskField}
        onChange={(v) => setForm({ ...form, mcAskField: v })}
      />

      <Label>الإجابة الصحيحة (تلقائية من قاعدة الأسماء)</Label>
      <ReadonlyBox text={correctText || '—'} tone="correct" />

      <Label>سؤال مخصّص (اختياري)</Label>
      <TextInput
        value={form.mcCustomPrompt || ''}
        onChange={(v) => setForm({ ...form, mcCustomPrompt: v })}
        placeholder={`ما ${NAME_FIELDS.find((f) => f.key === form.mcAskField)?.label} ${subject?.name || '…'}؟ (يُولَّد تلقائياً إن تُرك فارغاً)`}
      />

      <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-1">
        الخيارات المشتّتة تُختار تلقائياً من أسماء الباقة نفسها.
      </p>
    </>
  )
}

function TFForm({ question, bouquetId }) {
  const saved = useAutoSave(bouquetId, question)
  const [form, setForm] = saved

  return (
    <>
      <Label>العبارة</Label>
      <TextArea
        value={form.tfStatementAr || ''}
        onChange={(v) => setForm({ ...form, tfStatementAr: v })}
        placeholder="مثال: معنى الرحمن هو ذو الرحمة الواسعة."
      />

      <Label>العبارة بالإنجليزية (اختيارية)</Label>
      <TextArea
        value={form.tfStatementEn || ''}
        onChange={(v) => setForm({ ...form, tfStatementEn: v })}
        placeholder="Optional English translation"
      />

      <Label>الإجابة الصحيحة</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, tfAnswer: true })}
          className={
            'flex-1 py-2.5 rounded-xl font-bold border-2 transition ' +
            (form.tfAnswer
              ? 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-teal-deep)]'
              : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-soft)]')
          }
        >
          ✓ صحيح
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, tfAnswer: false })}
          className={
            'flex-1 py-2.5 rounded-xl font-bold border-2 transition ' +
            (!form.tfAnswer
              ? 'bg-red-50 border-red-400 text-red-800'
              : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-soft)]')
          }
        >
          ✗ خطأ
        </button>
      </div>
    </>
  )
}

function WPForm({ question, bouquetId, bouquetNames }) {
  const saved = useAutoSave(bouquetId, question)
  const [form, setForm] = saved
  const selected = new Set(form.wpNameIds || [])

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else if (next.size < 5) next.add(id) // cap at 5 pairs
    setForm({ ...form, wpNameIds: Array.from(next) })
  }

  return (
    <>
      <Label>الحقل المطابق</Label>
      <SegmentedField
        value={form.wpField}
        onChange={(v) => setForm({ ...form, wpField: v })}
      />

      <Label>الأسماء المشاركة (اختر ٣ إلى ٥)</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {bouquetNames.map((n) => {
          const on = selected.has(n.id)
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => toggle(n.id)}
              className={
                'p-2.5 rounded-xl font-serif text-sm font-bold border-2 transition ' +
                (on
                  ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)]'
                  : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold-soft)]')
              }
            >
              {n.name}
              {on && <span className="block text-[10px] font-normal mt-0.5">✓</span>}
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-2">
        ستُعرض للطالب أزواج (اسم ↔ {NAME_FIELDS.find((f) => f.key === form.wpField)?.label}) مُبعثرة، ليطابقها.
      </p>
    </>
  )
}

function TraceForm({ question, bouquetId, bouquetNames }) {
  const saved = useAutoSave(bouquetId, question)
  const [form, setForm] = saved
  const subject = bouquetNames.find((n) => n.id === form.traceNameId)

  return (
    <>
      <Label>الاسم المطلوب تتبّعه</Label>
      <NameSelect
        value={form.traceNameId}
        onChange={(v) => setForm({ ...form, traceNameId: v })}
        options={bouquetNames}
      />

      {subject && (
        <div className="mt-4 p-6 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-mute)] mb-2">معاينة</div>
          <div className="font-serif text-6xl font-bold text-[color:var(--color-ink)] opacity-30">
            {subject.name}
          </div>
        </div>
      )}
      <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-2">
        سيرى الطالب الاسم بخطٍّ باهت ويرسم فوقه بإصبعه/مؤشره.
      </p>
    </>
  )
}

/* ─── Small helpers / atoms ───────────────────────────── */

// Auto-save form fields to Firestore with a 500ms debounce.
function useAutoSave(bouquetId, question) {
  const [form, setLocal] = useState(() => stripMeta(question))
  const [saveTimer, setSaveTimer] = useState(null)

  const setForm = (next) => {
    setLocal(next)
    if (saveTimer) clearTimeout(saveTimer)
    const t = setTimeout(() => {
      updateQuestion(bouquetId, question.id, stripMeta(next)).catch((e) => {
        console.error('question autosave failed:', e)
      })
    }, 500)
    setSaveTimer(t)
  }

  return [form, setForm]
}

function stripMeta(q) {
  const { id, order, published, createdAt, updatedAt, ...rest } = q
  return rest
}

function Label({ children }) {
  return <div className="text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5 mt-3 first:mt-0">{children}</div>
}

function NameSelect({ value, onChange, options }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm font-serif text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none"
      dir="rtl"
    >
      <option value="">— اختر اسماً —</option>
      {options.map((n) => (
        <option key={n.id} value={n.id}>{n.name}</option>
      ))}
    </select>
  )
}

function SegmentedField({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {NAME_FIELDS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={
            'py-2 rounded-lg text-xs font-bold border-2 transition ' +
            (value === f.key
              ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)]'
              : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-gold-soft)]')
          }
        >
          <span className="block text-base leading-none">{f.icon}</span>
          <span className="block mt-0.5">{f.label}</span>
        </button>
      ))}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none"
    />
  )
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none resize-y"
    />
  )
}

function ReadonlyBox({ text, tone }) {
  const isCorrect = tone === 'correct'
  return (
    <div
      className={
        'px-3 py-2 rounded-lg text-sm ' +
        (isCorrect
          ? 'bg-[color:var(--color-teal-soft)] border border-[color:var(--color-teal)] text-[color:var(--color-ink)]'
          : 'bg-white border border-[color:var(--color-cream-deep)] text-[color:var(--color-ink-soft)]')
      }
    >
      {text}
    </div>
  )
}

function IconBtn({ onClick, disabled, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-8 h-8 rounded-lg hover:bg-[color:var(--color-cream-warm)] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-sm font-bold text-[color:var(--color-ink-soft)]"
    >
      {children}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="p-10 rounded-2xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center">
      <div className="text-3xl mb-2">🎯</div>
      <div className="font-bold text-[color:var(--color-ink)] mb-1">لا توجد تمارين بعد</div>
      <div className="text-sm text-[color:var(--color-ink-soft)]">أضف تمريناً من الأزرار أعلاه — الإجابات تُبنى تلقائياً من محتوى الأسماء.</div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  useBouquetLessons, saveBouquetLesson,
  DEFAULT_QUESTION_TYPES, QUESTION_TYPE_META,
} from '../../hooks/useBouquetLessons'
import { useNames } from '../../hooks/useNames'

// New admin الدورات: fixed 9 bouquet lessons (one per bouquet in the sheikh's method).
// No "add / delete" — bouquets are canonical. Admin just:
//   • toggles publish
//   • edits optional intro/outro copy (AR/EN)
//   • picks which question types the practice block includes
export default function AdminCurriculum() {
  const { lessons, loading } = useBouquetLessons()
  const { byBouquet } = useNames()

  return (
    <AdminLayout title="الدورات" subtitle="٩ دروس — درس لكل باقة">
      <div className="mb-6 p-4 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)]">
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0">📚</div>
          <div className="flex-1 text-sm text-[color:var(--color-ink-soft)] leading-relaxed">
            <div className="font-bold text-[color:var(--color-ink)] mb-1">القالب</div>
            افتتاح ← أسماء الباقة على الأفعال الأربعة (معنى · ثناء · طلب · تعبد) ← تمارين ← ختام
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[color:var(--color-ink-mute)]">جارٍ التحميل…</div>
      ) : (
        <ul className="space-y-3">
          {lessons.map((l) => (
            <LessonRow
              key={l.id}
              lesson={l}
              nameCount={(byBouquet[l.id] || []).length}
            />
          ))}
        </ul>
      )}
    </AdminLayout>
  )
}

function LessonRow({ lesson, nameCount }) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('ar')
  const [form, setForm] = useState(toForm(lesson))
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { setForm(toForm(lesson)) }, [
    lesson.published, lesson.introAr, lesson.introEn, lesson.outroAr, lesson.outroEn,
    JSON.stringify(lesson.questionTypes),
  ])

  const dirty =
    form.published !== lesson.published ||
    form.introAr !== lesson.introAr ||
    form.introEn !== lesson.introEn ||
    form.outroAr !== lesson.outroAr ||
    form.outroEn !== lesson.outroEn ||
    JSON.stringify(form.questionTypes) !== JSON.stringify(lesson.questionTypes)

  const b = lesson.bouquet
  const isGold = b.color === 'gold'

  const togglePublish = async () => {
    setSaving(true); setError(null)
    try {
      await saveBouquetLesson(lesson.id, { published: !lesson.published })
    } catch (e) { setError(e?.message || 'فشل') } finally { setSaving(false) }
  }

  const save = async () => {
    setSaving(true); setError(null)
    try {
      await saveBouquetLesson(lesson.id, {
        published: form.published,
        introAr: form.introAr,
        introEn: form.introEn,
        outroAr: form.outroAr,
        outroEn: form.outroEn,
        questionTypes: form.questionTypes,
      })
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500)
    } catch (e) { setError(e?.message || 'فشل الحفظ') } finally { setSaving(false) }
  }

  const enabledTypeCount = Object.values(form.questionTypes).filter(Boolean).length

  return (
    <li className="rounded-2xl bg-white border border-[color:var(--color-cream-deep)] overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 p-4">
        <div
          className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-display font-bold text-lg"
          style={{
            background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
            color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
          }}
        >
          {b.order + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[color:var(--color-ink)] truncate">{b.title}</span>
            <span className="text-[10px] font-mono text-[color:var(--color-ink-mute)]">/{b.id}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-mute)]">
              {nameCount} {b.isDua ? 'دعاء' : 'اسم'}
            </span>
            {lesson.published ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-deep)]">منشور</span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-mute)]">مسودّة</span>
            )}
          </div>
          <div className="text-xs text-[color:var(--color-ink-soft)] mt-0.5">
            {enabledTypeCount} نوع تمرين مُفعَّل
          </div>
        </div>

        <button
          type="button"
          onClick={togglePublish}
          disabled={saving}
          className={
            'px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ' +
            (lesson.published
              ? 'bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-deep)] border border-[color:var(--color-cream-deep)]'
              : 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)]')
          }
        >
          {lesson.published ? 'إلغاء النشر' : 'نشر'}
        </button>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-9 h-9 rounded-lg hover:bg-[color:var(--color-cream-warm)] transition flex items-center justify-center shrink-0"
          aria-label="تحرير"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className={'transition-transform ' + (expanded ? 'rotate-180' : '')}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="p-5 border-t border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          {/* AR/EN tabs */}
          <div className="flex items-center gap-1 mb-3 p-1 bg-white rounded-xl border border-[color:var(--color-cream-deep)] w-fit">
            <TabBtn active={tab === 'ar'} onClick={() => setTab('ar')}>عربي</TabBtn>
            <TabBtn active={tab === 'en'} onClick={() => setTab('en')}>English</TabBtn>
          </div>

          {tab === 'ar' ? (
            <div dir="rtl">
              <Field
                label="مقدّمة الدرس (اختيارية)"
                value={form.introAr}
                onChange={(v) => setForm({ ...form, introAr: v })}
                hint="سطر أو سطران يمهّدان للباقة — يظهرا بعد حديث الافتتاح."
              />
              <Field
                label="خاتمة الدرس (اختيارية)"
                value={form.outroAr}
                onChange={(v) => setForm({ ...form, outroAr: v })}
                hint="سطر أو سطران قبل الختم — دعوة للعمل بمقتضى الأسماء."
              />
            </div>
          ) : (
            <div dir="ltr">
              <Field
                label="Intro (optional)"
                value={form.introEn}
                onChange={(v) => setForm({ ...form, introEn: v })}
                placeholder={form.introAr}
              />
              <Field
                label="Outro (optional)"
                value={form.outroEn}
                onChange={(v) => setForm({ ...form, outroEn: v })}
                placeholder={form.outroAr}
              />
              <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-1">
                إذا تُركت الحقول فارغة تُستخدم النسخة العربية.
              </p>
            </div>
          )}

          {/* Question type toggles */}
          <div className="mt-5" dir="rtl">
            <div className="font-bold text-sm text-[color:var(--color-ink)] mb-2">أنواع التمارين في كتلة التطبيق</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {QUESTION_TYPE_META.map((q) => {
                const checked = !!form.questionTypes[q.key]
                return (
                  <label
                    key={q.key}
                    className={
                      'flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-sm ' +
                      (checked
                        ? 'border-[color:var(--color-gold)] bg-white'
                        : 'border-[color:var(--color-cream-deep)] bg-white/60 hover:bg-white')
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setForm({
                        ...form,
                        questionTypes: { ...form.questionTypes, [q.key]: e.target.checked },
                      })}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="flex-1 text-[color:var(--color-ink)]">{q.label}</span>
                    <span className="text-[10px] font-bold text-[color:var(--color-ink-mute)]">{q.category}</span>
                  </label>
                )
              })}
            </div>
            <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-2">
              كتلة التطبيق قيد التطوير — التمارين ستُولَّد تلقائياً من هذه الأنواع باستخدام بيانات الأسماء.
            </p>
          </div>

          {error && <div className="mt-3 text-sm text-red-700">{error}</div>}

          <div className="mt-4 flex items-center justify-end gap-2">
            {savedFlash && <span className="text-sm font-bold text-[color:var(--color-teal-deep)]">✓ محفوظ</span>}
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] disabled:opacity-50 transition"
            >
              {saving ? '…' : 'حفظ'}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-3 py-1 rounded-lg text-xs font-bold transition ' +
        (active ? 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)]' : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]')
      }
    >{children}</button>
  )
}

function Field({ label, value, onChange, placeholder, hint }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ? `↳ ${placeholder}` : ''}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition resize-y"
      />
      {hint && <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-1">{hint}</p>}
    </div>
  )
}

function toForm(lesson) {
  return {
    published: !!lesson.published,
    introAr: lesson.introAr || '',
    introEn: lesson.introEn || '',
    outroAr: lesson.outroAr || '',
    outroEn: lesson.outroEn || '',
    questionTypes: { ...DEFAULT_QUESTION_TYPES, ...(lesson.questionTypes || {}) },
  }
}

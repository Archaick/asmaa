import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminLayout from '../../components/layout/AdminLayout'

const FIELDS_AR = ['title', 'body', 'reflectionPrompt']
const FIELDS_EN = ['titleEn', 'bodyEn', 'reflectionPromptEn']
const FIELDS_ALL = [...FIELDS_AR, ...FIELDS_EN, 'order', 'published']

export default function AdminLessonEdit() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [tab, setTab] = useState('ar')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courseId || !lessonId) return
    return onSnapshot(doc(db, 'courses', courseId, 'lessons', lessonId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setLesson(data)
        const f = { published: !!data.published, order: data.order ?? 0 }
        for (const k of FIELDS_AR.concat(FIELDS_EN)) f[k] = data[k] || ''
        setForm(f)
      } else setLesson(null)
    })
  }, [courseId, lessonId])

  const dirty = form && lesson && FIELDS_ALL.some((k) => {
    if (k === 'published') return !!form[k] !== !!lesson[k]
    if (k === 'order') return Number(form[k]) !== (lesson[k] ?? 0)
    return (form[k] || '') !== (lesson[k] || '')
  })

  const save = async () => {
    if (!form) return
    setSaving(true); setError(null)
    try {
      const payload = { updatedAt: serverTimestamp() }
      for (const k of FIELDS_AR.concat(FIELDS_EN)) payload[k] = form[k]
      payload.order = Number(form.order) || 0
      payload.published = !!form.published
      await updateDoc(doc(db, 'courses', courseId, 'lessons', lessonId), payload)
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1600)
    } catch (e) {
      setError(e?.message || 'فشل الحفظ')
    } finally { setSaving(false) }
  }

  const remove = async () => {
    if (!confirm('حذف هذا الدرس نهائياً؟')) return
    await deleteDoc(doc(db, 'courses', courseId, 'lessons', lessonId))
    navigate(`/admin/curriculum/${courseId}`)
  }

  if (!lesson) return <AdminLayout title="…"><div className="p-6">جارٍ التحميل…</div></AdminLayout>

  return (
    <AdminLayout title={lesson.title || 'درس'} subtitle={`دورة: ${courseId} · /${lessonId}`}>
      <Link to={`/admin/curriculum/${courseId}`} className="inline-flex items-center gap-1 text-sm font-bold text-[color:var(--color-gold-deep)] hover:underline mb-5">
        ← عودة للدورة
      </Link>

      {/* Settings row */}
      <div className="mb-4 p-4 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={!!form?.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4"
            />
            <span className={form?.published ? 'text-[color:var(--color-teal-deep)]' : 'text-[color:var(--color-ink-mute)]'}>
              {form?.published ? 'منشور' : 'مسودّة'}
            </span>
          </label>
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-bold text-[color:var(--color-ink-soft)]">الترتيب:</span>
            <input
              type="number"
              value={form?.order ?? 0}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="w-16 px-2 py-1 rounded border border-[color:var(--color-cream-deep)] text-sm text-center"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          className="px-3 py-1.5 rounded-full text-xs font-bold text-red-700 border border-red-200 hover:bg-red-50 transition"
        >
          حذف الدرس
        </button>
      </div>

      {/* Content: AR / EN tabs */}
      <div className="p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)]">
        <div className="flex items-center gap-1 mb-4 p-1 bg-[color:var(--color-cream-warm)] rounded-xl border border-[color:var(--color-cream-deep)] w-fit">
          <TabBtn active={tab === 'ar'} onClick={() => setTab('ar')}>عربي</TabBtn>
          <TabBtn active={tab === 'en'} onClick={() => setTab('en')}>English</TabBtn>
        </div>

        {tab === 'ar' ? (
          <div dir="rtl">
            <Field label="📝 عنوان الدرس" value={form?.title || ''} onChange={(v) => setForm({ ...form, title: v })} />
            <Field
              label="📖 محتوى الدرس (النص التعليمي — استعمل سطراً فارغاً لفصل الفقرات)"
              value={form?.body || ''}
              onChange={(v) => setForm({ ...form, body: v })}
              textarea rows={10}
            />
            <Field
              label="💭 سؤال التأمّل (السؤال الذي يجيب عنه الطالب في نهاية الدرس)"
              value={form?.reflectionPrompt || ''}
              onChange={(v) => setForm({ ...form, reflectionPrompt: v })}
              textarea rows={2}
            />
          </div>
        ) : (
          <div dir="ltr">
            <Field label="📝 Lesson title" value={form?.titleEn || ''} onChange={(v) => setForm({ ...form, titleEn: v })} placeholder={form?.title} />
            <Field
              label="📖 Lesson body (main teaching text — blank line = new paragraph)"
              value={form?.bodyEn || ''}
              onChange={(v) => setForm({ ...form, bodyEn: v })}
              placeholder={form?.body}
              textarea rows={10}
            />
            <Field
              label="💭 Reflection prompt (question the student answers at the end)"
              value={form?.reflectionPromptEn || ''}
              onChange={(v) => setForm({ ...form, reflectionPromptEn: v })}
              placeholder={form?.reflectionPrompt}
              textarea rows={2}
            />
            <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-1">
              إذا تُركت الحقول فارغة يعرض الموقع النسخة العربية بدلاً منها.
            </p>
          </div>
        )}

        {error && <div className="mt-3 text-sm text-red-700">{error}</div>}

        <div className="mt-4 flex items-center justify-end gap-3">
          {savedFlash && <span className="text-sm font-bold text-[color:var(--color-teal-deep)]">✓ محفوظ</span>}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] disabled:opacity-50 transition"
          >
            {saving ? '…' : 'حفظ الدرس'}
          </button>
        </div>
      </div>
    </AdminLayout>
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

function Field({ label, value, onChange, placeholder, textarea, rows = 3 }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder ? `↳ ${placeholder}` : ''}
          className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ''}
          className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition"
        />
      )}
    </div>
  )
}

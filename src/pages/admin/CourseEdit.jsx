import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  collection, doc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore'
import { db } from '../../firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import CreateModal from '../../components/CreateModal'
import { useLessons } from '../../hooks/useCourses'

const AR_FIELDS = ['title', 'description']
const EN_FIELDS = ['titleEn', 'descriptionEn']
const ALL_FIELDS = [...AR_FIELDS, ...EN_FIELDS]

export default function AdminCourseEdit() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { lessons } = useLessons(courseId)
  const [course, setCourse] = useState(null)
  const [tab, setTab] = useState('ar')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState(null)
  const [addLessonOpen, setAddLessonOpen] = useState(false)

  useEffect(() => {
    if (!courseId) return
    return onSnapshot(doc(db, 'courses', courseId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setCourse(data)
        setForm({
          title: data.title || '',
          titleEn: data.titleEn || '',
          description: data.description || '',
          descriptionEn: data.descriptionEn || '',
          published: !!data.published,
          order: data.order ?? 0,
        })
      } else setCourse(null)
    })
  }, [courseId])

  // Keep denormalized lessonsCount in sync
  useEffect(() => {
    if (!course || !lessons) return
    const publishedLessons = lessons.filter((l) => l.published !== false).length
    if (course.lessonsCount !== publishedLessons) {
      updateDoc(doc(db, 'courses', courseId), { lessonsCount: publishedLessons }).catch(() => {})
    }
  }, [lessons, course, courseId])

  const dirty = form && course && (
    ALL_FIELDS.some((f) => form[f] !== (course[f] || '')) ||
    form.published !== !!course.published ||
    form.order !== (course.order ?? 0)
  )

  const save = async () => {
    if (!form) return
    setSaving(true); setError(null)
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        title: form.title,
        titleEn: form.titleEn,
        description: form.description,
        descriptionEn: form.descriptionEn,
        published: !!form.published,
        order: Number(form.order) || 0,
        updatedAt: serverTimestamp(),
      })
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1600)
    } catch (e) {
      setError(e?.message || 'فشل الحفظ')
    } finally { setSaving(false) }
  }

  const createLesson = async ({ title }) => {
    // Auto-generate a numeric ID (1, 2, 3, ...)
    const existing = await getDocs(collection(db, 'courses', courseId, 'lessons'))
    let n = 1
    const used = new Set(existing.docs.map((d) => d.id))
    while (used.has(String(n))) n++
    const lessonId = String(n)
    await setDoc(doc(db, 'courses', courseId, 'lessons', lessonId), {
      title: title.trim(),
      titleEn: '',
      body: '',
      bodyEn: '',
      reflectionPrompt: '',
      reflectionPromptEn: '',
      order: existing.size,
      published: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    setAddLessonOpen(false)
    navigate(`/admin/curriculum/${courseId}/lessons/${lessonId}`)
  }

  if (!course) {
    return <AdminLayout title="…"><div className="p-6">جارٍ التحميل…</div></AdminLayout>
  }

  return (
    <AdminLayout title={course.title || 'دورة'} subtitle={course.description || `/${course.id}`}>
      <Link to="/admin/curriculum" className="inline-flex items-center gap-1 text-sm font-bold text-[color:var(--color-gold-deep)] hover:underline mb-5">
        ← عودة لقائمة الدورات
      </Link>

      {/* Course settings */}
      <div className="mb-8 p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-[color:var(--color-ink)]">إعدادات الدورة</h2>
          <label className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={!!form?.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4"
            />
            <span className={form?.published ? 'text-[color:var(--color-teal-deep)]' : 'text-[color:var(--color-ink-mute)]'}>
              {form?.published ? 'منشورة' : 'مسودّة'}
            </span>
          </label>
        </div>

        {/* AR/EN tabs */}
        <div className="flex items-center gap-1 mb-3 p-1 bg-[color:var(--color-cream-warm)] rounded-xl border border-[color:var(--color-cream-deep)] w-fit">
          <TabBtn active={tab === 'ar'} onClick={() => setTab('ar')}>عربي</TabBtn>
          <TabBtn active={tab === 'en'} onClick={() => setTab('en')}>English</TabBtn>
        </div>

        {tab === 'ar' ? (
          <div dir="rtl">
            <Field label="العنوان" value={form?.title || ''} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="الوصف" value={form?.description || ''} onChange={(v) => setForm({ ...form, description: v })} textarea />
          </div>
        ) : (
          <div dir="ltr">
            <Field label="Title (English)" value={form?.titleEn || ''} onChange={(v) => setForm({ ...form, titleEn: v })} placeholder={form?.title} />
            <Field label="Description (English)" value={form?.descriptionEn || ''} onChange={(v) => setForm({ ...form, descriptionEn: v })} placeholder={form?.description} textarea />
          </div>
        )}

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

      {/* Lessons list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-lg text-[color:var(--color-ink)]">
          الدروس <span className="text-sm text-[color:var(--color-ink-mute)]">· {lessons.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setAddLessonOpen(true)}
          className="px-4 py-2 rounded-xl font-bold text-sm bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition"
        >
          + إضافة درس
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center">
          <div className="text-3xl mb-2">📖</div>
          <p className="text-sm text-[color:var(--color-ink-soft)]">لا توجد دروس بعد — اضغط "إضافة درس" لإنشاء أول درس.</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {lessons.map((l, i) => (
            <li key={l.id}>
              <Link
                to={`/admin/curriculum/${courseId}/lessons/${l.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
              >
                <div className="w-9 h-9 rounded-full bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)] flex items-center justify-center font-display font-bold text-[color:var(--color-ink-soft)]">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[color:var(--color-ink)] truncate">{l.title || 'بلا عنوان'}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-[color:var(--color-ink-mute)]">/{l.id}</span>
                    {l.published === false && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-mute)]">مسودّة</span>
                    )}
                  </div>
                </div>
                <div className="text-[color:var(--color-gold-deep)] text-sm font-bold shrink-0">تحرير ←</div>
              </Link>
            </li>
          ))}
        </ol>
      )}
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

function Field({ label, value, onChange, placeholder, textarea }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
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

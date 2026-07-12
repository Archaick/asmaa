import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import CreateModal from '../../components/CreateModal'
import { useCourses } from '../../hooks/useCourses'

export default function AdminCurriculum() {
  const { courses, loading } = useCourses()
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const onCreate = async ({ slug, title }) => {
    setError(null)
    const cleaned = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (!cleaned) throw new Error('المعرّف غير صالح')
    await setDoc(doc(db, 'courses', cleaned), {
      title: title.trim(),
      titleEn: '',
      description: '',
      descriptionEn: '',
      order: courses.length,
      published: false,
      lessonsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    setModalOpen(false)
    navigate(`/admin/curriculum/${cleaned}`)
  }

  return (
    <AdminLayout title="الدورات" subtitle="إنشاء وتحرير مسارات التعليم">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          كل دورة تحتوي على دروس مرتّبة. يظهر للطلاب فقط ما تختار نشره.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition"
        >
          + إضافة دورة
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}

      {loading ? (
        <div className="text-[color:var(--color-ink-mute)] text-sm">جارٍ التحميل…</div>
      ) : courses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center">
          <div className="text-4xl mb-3">📚</div>
          <div className="font-bold text-[color:var(--color-ink)] mb-1">لم تُنشأ أي دورة بعد</div>
          <div className="text-sm text-[color:var(--color-ink-soft)]">اضغط "إضافة دورة" لإنشاء أول دورة تعليمية.</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                to={`/admin/curriculum/${c.id}`}
                className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:shadow-md transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[color:var(--color-ink-mute)]">/{c.id}</span>
                    {c.published ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-deep)]">منشورة</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-mute)]">مسودّة</span>
                    )}
                  </div>
                  <div className="font-bold text-lg text-[color:var(--color-ink)]">{c.title}</div>
                  {c.description && <div className="text-sm text-[color:var(--color-ink-soft)] truncate mt-0.5">{c.description}</div>}
                  <div className="text-xs text-[color:var(--color-ink-mute)] mt-1">
                    {c.lessonsCount || 0} درساً
                  </div>
                </div>
                <div className="text-[color:var(--color-gold-deep)] font-bold shrink-0">تحرير ←</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateModal
        open={modalOpen}
        title="إنشاء دورة جديدة"
        submitLabel="إنشاء الدورة"
        onCancel={() => setModalOpen(false)}
        onSubmit={onCreate}
        fields={[
          {
            name: 'title',
            label: 'عنوان الدورة',
            placeholder: 'مثل: الدورة التأسيسية',
            required: true,
          },
          {
            name: 'slug',
            label: 'المعرّف (يظهر في الرابط)',
            placeholder: 'foundation',
            dir: 'ltr',
            hint: 'حروف إنجليزية صغيرة وشرطات فقط، بدون مسافات. لا يمكن تعديله لاحقاً.',
            required: true,
          },
        ]}
      />
    </AdminLayout>
  )
}

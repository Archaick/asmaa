import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { useStudents, relativeTime } from '../../hooks/useStudents'
import { TOTAL_NAMES } from '../../data/bouquets'

export default function AdminStudents() {
  const { students, loading } = useStudents()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return students
    return students.filter((s) => {
      const name = (s.displayName || '').toLowerCase()
      const email = (s.email || '').toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [students, q])

  return (
    <AdminLayout title="الطلاب" subtitle={`${students.length} طالب مسجّل`}>
      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم أو البريد…"
            className="w-full ps-11 pe-4 py-3 rounded-2xl border border-[color:var(--color-cream-deep)] bg-white focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition"
          />
          <svg className="absolute inset-y-0 start-3 my-auto w-5 h-5 text-[color:var(--color-ink-mute)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
        </div>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      <div className="bg-white border border-[color:var(--color-cream-deep)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-[color:var(--color-ink-mute)]">جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <EmptyState hasQuery={!!q} />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-ink-mute)] bg-[color:var(--color-cream-warm)]">
                  <th className="text-start px-5 py-3">الطالب</th>
                  <th className="text-start px-5 py-3">التقدّم</th>
                  <th className="text-start px-5 py-3">آخر نشاط</th>
                  <th className="text-start px-5 py-3">تاريخ التسجيل</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-cream-deep)]">
                {filtered.map((s) => (
                  <StudentRow key={s.id} student={s} />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-[color:var(--color-cream-deep)]">
              {filtered.map((s) => (
                <li key={s.id}>
                  <StudentCard student={s} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

function StudentRow({ student: s }) {
  const count = s.stats?.memorized || 0
  return (
    <tr className="hover:bg-[color:var(--color-cream-warm)] transition">
      <td className="px-5 py-4">
        <Link to={`/admin/students/${s.id}`} className="flex items-center gap-3">
          <Avatar name={s.displayName || s.email} photoURL={s.photoURL} />
          <div className="min-w-0">
            <div className="font-bold text-[color:var(--color-ink)] truncate">
              {s.displayName || 'طالب'}
            </div>
            <div className="text-xs text-[color:var(--color-ink-mute)] truncate" dir="ltr">{s.email}</div>
          </div>
        </Link>
      </td>
      <td className="px-5 py-4"><ProgressCell count={count} /></td>
      <td className="px-5 py-4 text-sm text-[color:var(--color-ink-soft)]">{relativeTime(s.lastActive)}</td>
      <td className="px-5 py-4 text-sm text-[color:var(--color-ink-soft)]">{relativeTime(s.createdAt)}</td>
      <td className="px-5 py-4 text-end">
        <Link to={`/admin/students/${s.id}`} className="text-sm font-bold text-[color:var(--color-gold-deep)] hover:underline">
          عرض ←
        </Link>
      </td>
    </tr>
  )
}

function StudentCard({ student: s }) {
  const count = s.stats?.memorized || 0
  return (
    <Link to={`/admin/students/${s.id}`} className="block p-4 hover:bg-[color:var(--color-cream-warm)] transition">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={s.displayName || s.email} photoURL={s.photoURL} />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[color:var(--color-ink)] truncate">{s.displayName || 'طالب'}</div>
          <div className="text-xs text-[color:var(--color-ink-mute)] truncate" dir="ltr">{s.email}</div>
        </div>
      </div>
      <ProgressCell count={count} />
      <div className="mt-2 text-xs text-[color:var(--color-ink-mute)]">
        آخر نشاط: {relativeTime(s.lastActive)}
      </div>
    </Link>
  )
}

function ProgressCell({ count }) {
  const pct = Math.round((count / TOTAL_NAMES) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
          }}
        />
      </div>
      <span className="text-sm font-bold text-[color:var(--color-ink)]" dir="ltr">
        {count} / {TOTAL_NAMES}
      </span>
    </div>
  )
}

function Avatar({ name, photoURL }) {
  const initial = (name || '؟').trim()[0]
  if (photoURL) {
    return <img src={photoURL} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-lg"
      style={{
        background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))',
        color: 'var(--color-ink)',
      }}
    >
      {initial}
    </div>
  )
}

function EmptyState({ hasQuery }) {
  return (
    <div className="p-10 text-center">
      <div className="text-4xl mb-3">{hasQuery ? '🔍' : '🌱'}</div>
      <div className="font-bold text-[color:var(--color-ink)] mb-1">
        {hasQuery ? 'لا نتائج مطابقة' : 'لم يسجّل أي طالب بعد'}
      </div>
      <div className="text-sm text-[color:var(--color-ink-soft)]">
        {hasQuery ? 'جرّب كلمة بحث أخرى' : 'ستظهر بيانات الطلاب فور تسجيلهم أول مرة'}
      </div>
    </div>
  )
}

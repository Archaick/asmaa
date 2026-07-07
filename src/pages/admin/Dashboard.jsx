import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { useStudents, relativeTime } from '../../hooks/useStudents'
import { TOTAL_NAMES } from '../../data/bouquets'

export default function AdminDashboard() {
  const { students, loading } = useStudents()

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const activeToday = students.filter((s) => tsMs(s.lastActive) > now - dayMs).length
  const activeWeek  = students.filter((s) => tsMs(s.lastActive) > now - 7 * dayMs).length
  const totalMemorized = students.reduce((sum, s) => sum + (s.stats?.memorized || 0), 0)

  return (
    <AdminLayout title="لوحة التحكم" subtitle="نظرة عامة على المشروع">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="مجموع الطلاب"      value={loading ? '—' : students.length} icon="👥" accent="gold" />
        <StatTile label="نشطون اليوم"        value={loading ? '—' : activeToday}      icon="🌟" accent="teal" />
        <StatTile label="نشطون هذا الأسبوع"  value={loading ? '—' : activeWeek}       icon="📅" accent="gold" />
        <StatTile label="أسماء محفوظة (كلها)" value={loading ? '—' : totalMemorized}   icon="📿" accent="teal" />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <ActionCard
          to="/admin/students"
          title="عرض الطلاب"
          desc="اطّلع على قائمة الطلاب المسجّلين، وتقدّم كل واحد منهم في حفظ الأسماء."
          icon="👥"
          accent="gold"
        />
        <ActionCard
          to="/admin/content"
          title="تحرير المحتوى"
          desc="عدّل معاني الأسماء وأدلّتها من القرآن والسنة، وأدرج الثناء والدعاء بها."
          icon="📖"
          accent="teal"
        />
      </div>

      {/* Latest students */}
      <div className="bg-white border border-[color:var(--color-cream-deep)] rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[color:var(--color-cream-deep)] flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)]">آخر النشاط</h2>
          <Link to="/admin/students" className="text-sm font-bold text-[color:var(--color-gold-deep)] hover:underline">
            كل الطلاب ←
          </Link>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-[color:var(--color-ink-mute)]">جارٍ التحميل…</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-sm text-[color:var(--color-ink-mute)]">
            لا يوجد طلاب بعد — بمجرد أن يسجّل طالب أول باسمه، ستظهر بياناته هنا.
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-cream-deep)]">
            {students.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link
                  to={`/admin/students/${s.id}`}
                  className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-[color:var(--color-cream-warm)] transition"
                >
                  <Avatar name={s.displayName || s.email} photoURL={s.photoURL} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[color:var(--color-ink)] truncate">
                      {s.displayName || s.email || 'طالب'}
                    </div>
                    <div className="text-xs text-[color:var(--color-ink-mute)]">
                      آخر نشاط: {relativeTime(s.lastActive)}
                    </div>
                  </div>
                  <ProgressBadge count={s.stats?.memorized || 0} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  )
}

function tsMs(ts) {
  if (!ts) return 0
  if (ts.toMillis) return ts.toMillis()
  if (ts.seconds) return ts.seconds * 1000
  return 0
}

function StatTile({ label, value, icon, accent }) {
  const gold = accent === 'gold'
  return (
    <div
      className="relative overflow-hidden p-5 rounded-2xl bg-white border"
      style={{ borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
    >
      <div
        className="absolute -top-8 -end-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-70"
        style={{ background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />
      <div className="relative flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-[color:var(--color-ink-soft)]">{label}</div>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="relative font-display text-3xl font-bold text-[color:var(--color-ink)]">
        {value}
      </div>
    </div>
  )
}

function ActionCard({ to, title, desc, icon, accent }) {
  const gold = accent === 'gold'
  return (
    <Link
      to={to}
      className="group relative overflow-hidden p-6 rounded-2xl bg-white border hover:shadow-md hover:-translate-y-0.5 transition flex items-start gap-4"
      style={{ borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
    >
      <div
        className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-1">{title}</h3>
        <p className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">{desc}</p>
      </div>
      <div className="shrink-0 text-lg font-bold group-hover:-translate-x-1 transition"
           style={{ color: gold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}>
        ←
      </div>
    </Link>
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

function ProgressBadge({ count }) {
  const pct = Math.round((count / TOTAL_NAMES) * 100)
  return (
    <div className="text-end shrink-0">
      <div className="font-bold text-[color:var(--color-ink)]" dir="ltr">{count} / {TOTAL_NAMES}</div>
      <div className="w-24 h-1.5 mt-1 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
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

import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot, collection } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import { relativeTime } from '../../hooks/useStudents'
import { BOUQUETS, TOTAL_NAMES } from '../../data/bouquets'
import { NAMES_BY_BOUQUET, findName, REAL_NAME_IDS } from '../../data/names99'
import {
  computeStreakInfo,
  computeBouquetCompletion,
  computeMilestones,
  tsMs,
} from '../../utils/milestones'

export default function AdminStudentDetail() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [entries, setEntries] = useState([]) // [{ id, memorizedAt }]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const unsubUser = onSnapshot(doc(db, 'users', id), (snap) => {
      setStudent(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    const unsubProg = onSnapshot(collection(db, 'users', id, 'progress'), (snap) => {
      const arr = []
      snap.forEach((d) => {
        const data = d.data()
        if (data?.memorized) arr.push({ id: d.id, memorizedAt: data.memorizedAt || null })
      })
      setEntries(arr)
    })
    return () => { unsubUser(); unsubProg() }
  }, [id])

  const memorizedSet = useMemo(() => new Set(entries.map((e) => e.id)), [entries])
  const memorizedCount = useMemo(
    () => entries.filter((e) => REAL_NAME_IDS.includes(e.id)).length,
    [entries]
  )
  const streakInfo = useMemo(() => computeStreakInfo(entries), [entries])
  const bouquetCompletion = useMemo(() => computeBouquetCompletion(memorizedSet), [memorizedSet])
  const milestones = useMemo(
    () => computeMilestones({ memorizedCount, memorizedSet, streakInfo, bouquetCompletion }),
    [memorizedCount, memorizedSet, streakInfo, bouquetCompletion]
  )
  const unlockedCount = milestones.filter((m) => m.unlocked).length

  const recent = useMemo(() => {
    return [...entries]
      .filter((e) => e.memorizedAt && REAL_NAME_IDS.includes(e.id))
      .sort((a, b) => tsMs(b.memorizedAt) - tsMs(a.memorizedAt))
      .slice(0, 12)
      .map((e) => ({ ...e, name: findName(e.id) }))
      .filter((e) => e.name)
  }, [entries])

  if (loading) {
    return <AdminLayout title="…"><div className="p-6">جارٍ التحميل…</div></AdminLayout>
  }
  if (!student) {
    return (
      <AdminLayout title="طالب غير موجود">
        <Link to="/admin/students" className="text-[color:var(--color-gold-deep)] font-bold">← عودة لقائمة الطلاب</Link>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={student.displayName || 'طالب'} subtitle={student.email}>
      <Link to="/admin/students" className="inline-flex items-center gap-1 text-sm font-bold text-[color:var(--color-gold-deep)] hover:underline mb-5">
        ← عودة لقائمة الطلاب
      </Link>

      {/* Header card */}
      <div className="p-6 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar name={student.displayName || student.email} photoURL={student.photoURL} big />
        <div className="flex-1 min-w-0">
          <div className="font-display text-2xl font-bold text-[color:var(--color-ink)]">
            {student.displayName || 'طالب'}
          </div>
          <div className="text-sm text-[color:var(--color-ink-mute)]" dir="ltr">{student.email}</div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-[color:var(--color-ink-soft)]">
            <span>انضمّ: {relativeTime(student.createdAt)}</span>
            <span>آخر نشاط: {relativeTime(student.lastActive)}</span>
          </div>
        </div>
        <div className="text-end">
          <div className="text-3xl font-display font-bold text-[color:var(--color-ink)]" dir="ltr">
            {memorizedCount} <span className="text-[color:var(--color-ink-mute)] text-lg">/ {TOTAL_NAMES}</span>
          </div>
          <div className="w-40 h-2 mt-1 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
            <div className="h-full transition-all" style={{
              width: `${(memorizedCount / TOTAL_NAMES) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
            }} />
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <MiniStat icon="🌙" label="السلسلة الحالية"  value={streakInfo.streak}   suffix="يوم" accent="gold" />
        <MiniStat icon="🕋" label="أيام الوِرد"        value={streakInfo.uniqueDays} suffix="يوم" accent="teal" />
        <MiniStat icon="🏆" label="إنجازات مُحقَّقة"   value={unlockedCount}      suffix={`/${milestones.length}`} accent="gold" />
        <MiniStat icon="👑" label="باقات مكتملة"     value={Object.values(bouquetCompletion).filter(Boolean).length} suffix="/6" accent="teal" />
      </div>

      {/* Achievements strip */}
      <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">إنجازات الطالب</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8 bg-white border border-[color:var(--color-cream-deep)] rounded-2xl p-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            title={m.desc}
            className={
              'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ' +
              (m.unlocked
                ? 'bg-[color:var(--color-gold-soft)]/50 border-[color:var(--color-gold)]'
                : 'bg-[color:var(--color-cream-warm)] border-[color:var(--color-cream-deep)] opacity-55 grayscale')
            }
          >
            <span className={'text-2xl ' + (m.unlocked ? 'animate-crown-shimmer' : '')}>{m.icon}</span>
            <span className="text-[10px] font-bold text-center text-[color:var(--color-ink)] leading-tight">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Bouquet progress */}
      <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">التقدّم في الباقات</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {BOUQUETS.filter((b) => !b.isDua).map((b) => {
          const names = NAMES_BY_BOUQUET[b.id] || []
          const done = names.filter((n) => memorizedSet.has(n.id)).length
          const total = names.length
          const pct = total > 0 ? (done / total) * 100 : 0
          const gold = b.color === 'gold'
          const complete = bouquetCompletion[b.id]
          return (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-white border relative"
              style={{ borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-[color:var(--color-ink)] flex items-center gap-1.5">
                  {complete && <span>👑</span>}
                  {b.title}
                </div>
                <div className="text-xs font-bold text-[color:var(--color-ink-soft)]" dir="ltr">{done} / {total}</div>
              </div>
              <div className="h-1.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{
                  width: `${pct}%`,
                  background: gold ? 'var(--color-gold)' : 'var(--color-teal)',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent memorized names */}
      <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">الأسماء المحفوظة الأخيرة</h2>
      <div className="bg-white border border-[color:var(--color-cream-deep)] rounded-2xl p-5">
        {recent.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-mute)]">لم يبدأ الطالب بعد.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-cream-deep)]">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5">
                <span className="font-serif font-bold text-base text-[color:var(--color-ink)]">{e.name.name}</span>
                <span className="text-xs text-[color:var(--color-ink-mute)]">{relativeTime(e.memorizedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  )
}

function MiniStat({ icon, label, value, suffix, accent }) {
  const gold = accent === 'gold'
  return (
    <div
      className="relative overflow-hidden p-4 rounded-xl bg-white border"
      style={{ borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-soft)]">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-[color:var(--color-ink)]" dir="ltr">{value}</span>
        <span className="text-xs font-bold text-[color:var(--color-ink-mute)]">{suffix}</span>
      </div>
    </div>
  )
}

function Avatar({ name, photoURL, big }) {
  const initial = (name || '؟').trim()[0]
  const size = big ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-lg'
  if (photoURL) {
    return <img src={photoURL} alt="" className={size + ' rounded-full object-cover shrink-0'} />
  }
  return (
    <div
      className={size + ' rounded-full flex items-center justify-center font-bold shrink-0'}
      style={{
        background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))',
        color: 'var(--color-ink)',
      }}
    >{initial}</div>
  )
}

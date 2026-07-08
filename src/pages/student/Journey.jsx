import { useMemo } from 'react'
import StudentLayout from '../../components/layout/StudentLayout'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { useMilestones } from '../../hooks/useMilestones'
import { BOUQUETS, TOTAL_NAMES } from '../../data/bouquets'

function tsMs(ts) {
  if (!ts) return 0
  if (ts.toMillis) return ts.toMillis()
  if (ts.seconds) return ts.seconds * 1000
  return 0
}

function fmtRelative(ms) {
  if (!ms) return '—'
  const diff = Date.now() - ms
  const min = 60_000, hr = 60 * min, day = 24 * hr
  if (diff < hr)       return 'اليوم'
  if (diff < day)      return `منذ ${Math.floor(diff / hr)} س`
  if (diff < 30 * day) return `منذ ${Math.floor(diff / day)} يوم`
  return new Date(ms).toLocaleDateString('ar-EG')
}

export default function Journey() {
  const { memorized, memorizedCount, entries } = useProgress()
  const { byBouquet, findName } = useNames()
  const { streak, uniqueDays } = useMilestones(entries, memorized, memorizedCount)

  const recent = useMemo(() => {
    return [...entries]
      .filter((e) => e.memorizedAt)
      .sort((a, b) => tsMs(b.memorizedAt) - tsMs(a.memorizedAt))
      .slice(0, 12)
      .map((e) => ({ ...e, name: findName(e.id) }))
      .filter((e) => e.name)
  }, [entries, findName])

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
            رحلتي
          </h1>
          <p className="text-[color:var(--color-ink-soft)]">
            تأمّل مسيرتك مع أسماء الله — أين بدأت، وأين وصلت.
          </p>
        </div>

        {/* Streak highlight */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-white border border-[color:var(--color-gold-soft)] mb-8 text-center">
          <div className="absolute -top-16 -end-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-60"
               style={{ background: 'var(--color-gold-soft)' }} />
          <div className="relative">
            <div className="text-4xl mb-2">🌙</div>
            <div className="font-display text-5xl font-bold text-[color:var(--color-ink)]" dir="ltr">{streak}</div>
            <div className="text-sm font-bold text-[color:var(--color-ink-soft)] mt-1">
              {streak === 0 ? 'ابدأ سلسلتك اليوم' : `يوم متتالٍ في وِردك`}
            </div>
            {uniqueDays > 0 && (
              <div className="text-xs text-[color:var(--color-ink-mute)] mt-3">
                إجمالي أيام الوِرد: <span dir="ltr" className="font-bold">{uniqueDays}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bouquet progress list */}
        <h2 className="font-display text-xl font-bold text-[color:var(--color-ink)] mb-3">
          تقدّمك في الباقات
        </h2>
        <div className="space-y-2 mb-8">
          {BOUQUETS.filter((b) => !b.isDua).map((b) => {
            const names = byBouquet[b.id] || []
            const done = names.filter((n) => !n.isDua && memorized.has(n.id)).length
            const total = names.filter((n) => !n.isDua).length
            const pct = total > 0 ? (done / total) * 100 : 0
            const gold = b.color === 'gold'
            return (
              <div key={b.id} className="p-4 rounded-xl bg-white border border-[color:var(--color-cream-deep)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[color:var(--color-ink)] text-sm">{b.title}</span>
                  <span className="text-xs font-bold text-[color:var(--color-ink-soft)]" dir="ltr">{done}/{total}</span>
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

        {/* Recent memorizations */}
        <h2 className="font-display text-xl font-bold text-[color:var(--color-ink)] mb-3">
          آخر ما حفظت
        </h2>
        {recent.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[color:var(--color-cream-warm)] border border-dashed border-[color:var(--color-cream-deep)]">
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-sm font-bold text-[color:var(--color-ink-soft)]">لم تحفظ أي اسم بعد — ابدأ من الوسيلة</p>
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-cream-deep)] bg-white rounded-2xl border border-[color:var(--color-cream-deep)] overflow-hidden">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-serif font-bold text-lg text-[color:var(--color-ink)]">{e.name.name}</span>
                <span className="text-xs text-[color:var(--color-ink-mute)]">{fmtRelative(tsMs(e.memorizedAt))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudentLayout>
  )
}

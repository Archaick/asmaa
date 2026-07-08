import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useMilestones } from '../../hooks/useMilestones'
import { TOTAL_NAMES } from '../../data/bouquets'
import StudentLayout from '../../components/layout/StudentLayout'

export default function Achievements() {
  const { memorized, memorizedCount, entries } = useProgress()
  const { milestones, streak, uniqueDays, bouquetsDoneCount } = useMilestones(entries, memorized, memorizedCount)

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
            إنجازاتك
          </h1>
          <p className="text-[color:var(--color-ink-soft)]">
            كل خطوة في رحلة الإحصاء أثر يبقى — بارك الله فيك.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <StatCard icon="📿" label="أسماء محفوظة" value={memorizedCount} suffix={`/${TOTAL_NAMES}`} accent="gold" />
          <StatCard icon="🌙" label="السلسلة الحالية" value={streak}       suffix="يوم"           accent="teal" />
          <StatCard icon="🕋" label="أيام الوِرد"     value={uniqueDays}    suffix="يوم"           accent="gold" />
          <StatCard icon="👑" label="باقات مكتملة"   value={bouquetsDoneCount} suffix="من ٦"       accent="teal" />
        </div>

        {/* Milestones detailed */}
        <h2 className="font-display text-2xl font-bold text-[color:var(--color-ink)] mb-4 text-center">
          الإنجازات السبع
        </h2>
        <p className="text-center text-sm text-[color:var(--color-ink-soft)] mb-6 max-w-lg mx-auto">
          كل إنجاز مقصود — لا يُنال إلا بمداومة على الوِرد، وصبر على الحفظ، وحسن التعبد.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {milestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} progress={progressForMilestone(m, { memorizedCount, streak, uniqueDays })} />
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}

function StatCard({ icon, label, value, suffix, accent }) {
  const gold = accent === 'gold'
  return (
    <div
      className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white border"
      style={{ borderColor: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
    >
      <div
        className="absolute -top-8 -end-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-70"
        style={{ background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />
      <div className="relative flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-ink-soft)]">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="relative flex items-baseline gap-1">
        <span className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)]" dir="ltr">
          {value}
        </span>
        <span className="text-sm font-bold text-[color:var(--color-ink-mute)]">{suffix}</span>
      </div>
    </div>
  )
}

function MilestoneCard({ milestone, progress }) {
  const { unlocked, icon, label, desc } = milestone
  return (
    <div
      className={
        'relative overflow-hidden p-5 rounded-3xl border transition-all ' +
        (unlocked
          ? 'bg-white border-[color:var(--color-gold)] shadow-sm'
          : 'bg-[color:var(--color-cream-warm)] border-[color:var(--color-cream-deep)] opacity-75')
      }
    >
      {unlocked && (
        <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-60"
             style={{ background: 'var(--color-gold-soft)' }} />
      )}
      <div className="relative flex items-start gap-4">
        <div className={
          'w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0 ' +
          (unlocked ? 'animate-crown-shimmer' : 'grayscale')
        } style={{
          background: unlocked ? 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))' : 'var(--color-cream-deep)',
        }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-lg text-[color:var(--color-ink)]">{label}</h3>
            {unlocked && <span className="text-xs text-[color:var(--color-gold-deep)] font-bold">✓ مُحقَّق</span>}
          </div>
          <p className="text-sm text-[color:var(--color-ink-soft)] leading-relaxed mb-2">{desc}</p>
          {progress && !unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[color:var(--color-ink-mute)] mb-1" dir="ltr">
                <span>{progress.current}</span><span>{progress.target}</span>
              </div>
              <div className="h-1.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(100, (progress.current / progress.target) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function progressForMilestone(m, { memorizedCount, streak, uniqueDays }) {
  switch (m.id) {
    case 'first-name':   return { current: memorizedCount, target: 1  }
    case 'halfway':      return { current: memorizedCount, target: 50 }
    case 'complete':     return { current: memorizedCount, target: 99 }
    case 'week-streak':  return { current: streak,         target: 7  }
    case 'ninety-days':  return { current: uniqueDays,     target: 99 }
    default:             return null
  }
}

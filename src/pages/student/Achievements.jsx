import { useProgress } from '../../hooks/useProgress'
import { useMilestones } from '../../hooks/useMilestones'
import { useBouquetLessons, useBouquetLessonProgress } from '../../hooks/useBouquetLessons'
import { useLang } from '../../i18n/LangContext'
import { TOTAL_NAMES } from '../../data/bouquets'
import { computeCurriculumMilestones, summarizeLessonProgress } from '../../utils/curriculumMilestones'
import StudentLayout from '../../components/layout/StudentLayout'

export default function Achievements() {
  const { memorized, memorizedCount, entries } = useProgress()
  const { milestones, streak, uniqueDays, bouquetsDoneCount } = useMilestones(entries, memorized, memorizedCount)
  const { lessons } = useBouquetLessons({ publishedOnly: true })
  const { byId } = useBouquetLessonProgress()
  const { t } = useLang()

  const { completedCount, perfectCount } = summarizeLessonProgress(byId)
  const totalLessons = lessons.length
  const cmilestones = computeCurriculumMilestones({ completedCount, totalLessons, perfectCount })

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
            {t('achievements.title')}
          </h1>
          <p className="text-[color:var(--color-ink-soft)]">
            {t('achievements.subtitle')}
          </p>
        </div>

        {/* ── الوسيلة track ───────────────────────────────── */}
        <SectionHeader icon="🕋" title={t('achievements.section.waseela')} accent="gold" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon="📿" label={t('achievements.stat.memorized')} value={memorizedCount} suffix={`/${TOTAL_NAMES}`} accent="gold" />
          <StatCard icon="🌙" label={t('achievements.stat.streak')}    value={streak}         suffix={t('achievements.stat.streak_unit')} accent="teal" />
          <StatCard icon="🕋" label={t('achievements.stat.wird_days')} value={uniqueDays}     suffix={t('achievements.stat.wird_unit')}   accent="gold" />
          <StatCard icon="👑" label={t('achievements.stat.bouquets')}  value={bouquetsDoneCount} suffix={t('achievements.stat.bouquets_of')} accent="teal" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {milestones.map((m) => (
            <MilestoneCard
              key={m.id}
              icon={m.icon}
              unlocked={m.unlocked}
              label={t(`milestone.${m.id}.label`)}
              desc={t(`milestone.${m.id}.desc`)}
              progress={progressForMilestone(m, { memorizedCount, streak, uniqueDays })}
              accent="gold"
              t={t}
            />
          ))}
        </div>

        {/* ── الدورة track ───────────────────────────────── */}
        <SectionHeader icon="🎓" title={t('achievements.section.curriculum')} accent="teal" />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <StatCard icon="📗" label={t('achievements.stat.lessons')} value={completedCount} suffix={totalLessons ? `/${totalLessons}` : ''} accent="teal" />
          <StatCard icon="💯" label={t('achievements.stat.perfect')} value={perfectCount} suffix="" accent="gold" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {cmilestones.map((m) => (
            <MilestoneCard
              key={m.id}
              icon={m.icon}
              unlocked={m.unlocked}
              label={t(`cmilestone.${m.id}.label`)}
              desc={t(`cmilestone.${m.id}.desc`)}
              progress={progressForCurriculum(m, { completedCount, totalLessons })}
              accent="teal"
              t={t}
            />
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}

function SectionHeader({ icon, title, accent }) {
  const gold = accent === 'gold'
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      >
        {icon}
      </div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--color-ink)]">{title}</h2>
      <div className="flex-1 h-px bg-[color:var(--color-cream-deep)]" />
    </div>
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
        {suffix && <span className="text-sm font-bold text-[color:var(--color-ink-mute)]">{suffix}</span>}
      </div>
    </div>
  )
}

function MilestoneCard({ icon, unlocked, label, desc, progress, accent, t }) {
  const gold = accent === 'gold'
  const glow = gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)'
  const border = unlocked ? (gold ? 'var(--color-gold)' : 'var(--color-teal)') : 'var(--color-cream-deep)'
  const iconBg = unlocked
    ? (gold ? 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))'
            : 'linear-gradient(135deg, var(--color-teal-soft), var(--color-teal))')
    : 'var(--color-cream-deep)'

  return (
    <div
      className={'relative overflow-hidden p-5 rounded-3xl border transition-all ' + (unlocked ? 'bg-white shadow-sm' : 'bg-[color:var(--color-cream-warm)] opacity-75')}
      style={{ borderColor: border }}
    >
      {unlocked && (
        <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-60"
             style={{ background: glow }} />
      )}
      <div className="relative flex items-start gap-4">
        <div
          className={'w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0 ' + (unlocked ? '' : 'grayscale')}
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display font-bold text-lg text-[color:var(--color-ink)]">{label}</h3>
            {unlocked && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                  color: gold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
                }}
              >
                {t('achievements.unlocked')}
              </span>
            )}
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
                    background: gold
                      ? 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))'
                      : 'linear-gradient(90deg, var(--color-teal-soft), var(--color-teal))',
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

function progressForCurriculum(m, { completedCount, totalLessons }) {
  switch (m.id) {
    case 'lesson-first': return { current: completedCount, target: 1 }
    case 'lesson-three': return { current: completedCount, target: 3 }
    case 'lesson-all':   return totalLessons ? { current: completedCount, target: totalLessons } : null
    default:             return null
  }
}

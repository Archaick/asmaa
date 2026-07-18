import { Link } from 'react-router-dom'
import StudentLayout from '../../components/layout/StudentLayout'
import { useLang } from '../../i18n/LangContext'
import { useBouquetLessons, useBouquetLessonProgress } from '../../hooks/useBouquetLessons'
import { useAllBouquetsPublishedQuestionCounts } from '../../hooks/useBouquetQuestions'
import { useNames } from '../../hooks/useNames'
import { useProgress } from '../../hooks/useProgress'
import { useMilestones } from '../../hooks/useMilestones'
import { useAppConfig } from '../../hooks/useAppConfig'

// Student view of الدورات: fixed 9-tile grid, one lesson per bouquet,
// each following the sheikh's template (opening → 4-verb per name → practice → closing).
export default function Curriculum() {
  const { t, lang } = useLang()
  const { lessons, loading } = useBouquetLessons({ publishedOnly: true })
  const { isCompleted, getBest } = useBouquetLessonProgress()
  const { byBouquet } = useNames()
  const questionCounts = useAllBouquetsPublishedQuestionCounts()

  // Gate: when enabled by admin, the whole section is locked until every
  // الوسيلة achievement is unlocked.
  const { config } = useAppConfig()
  const { memorized, memorizedCount, entries } = useProgress()
  const { milestones } = useMilestones(entries, memorized, memorizedCount)
  const unlockedCount = milestones.filter((m) => m.unlocked).length
  const allUnlocked = milestones.length > 0 && unlockedCount === milestones.length
  const locked = config.gateCurriculum && !allUnlocked

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{locked ? '🔒' : '🎓'}</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
            {t('curriculum.title')}
          </h1>
          <p className="text-[color:var(--color-ink-soft)] max-w-2xl mx-auto">
            {t('curriculum.subtitle')}
          </p>
        </div>

        {locked ? (
          <LockedState unlocked={unlockedCount} total={milestones.length} lang={lang} t={t} />
        ) : loading ? (
          <div className="text-center text-[color:var(--color-ink-mute)]">…</div>
        ) : lessons.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            {lessons.map((l) => (
              <BouquetLessonCard
                key={l.id}
                lesson={l}
                completed={isCompleted(l.id)}
                best={getBest(l.id)}
                questionCount={questionCounts[l.id] || 0}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

function BouquetLessonCard({ lesson, completed, best, questionCount, lang, t }) {
  const b = lesson.bouquet
  const isGold = b.color === 'gold'
  const pct = completed ? 100 : 0
  const actionKey = completed ? 'curriculum.review' : 'curriculum.start'

  return (
    <Link
      to={`/lesson/${b.id}`}
      className="group relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:-translate-y-1 hover:shadow-xl transition-all"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="absolute -top-10 -end-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-60"
        style={{ background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />
      {completed && (
        <div className="absolute top-4 start-4 text-2xl" title={t('bouquet.tile.complete_hint')}>👑</div>
      )}

      <div className="relative">
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{
              background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
              color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
            }}
          >
            {t('bouquet.tag')} · {b.size} {t('curriculum.names_short')}
          </span>
          {questionCount > 0 && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-soft)]">
              🎯 {questionCount} {t('curriculum.questions_short')}
            </span>
          )}
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--color-ink)] mb-4 leading-tight">
          {b.title}
        </h2>

        <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
          <span>{completed ? `✓ ${t('curriculum.completed')}` : t('curriculum.not_started')}</span>
          {best && (
            <span dir="ltr" className="text-[color:var(--color-gold-deep)]">
              🏆 {best.score}/{best.total}
            </span>
          )}
        </div>
        <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden mb-5">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: isGold
                ? 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))'
                : 'linear-gradient(90deg, var(--color-teal-soft), var(--color-teal))',
            }}
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[color:var(--color-ink)] group-hover:bg-[color:var(--color-teal-deep)] transition-all">
          {t(actionKey)} {lang === 'ar' ? '←' : '→'}
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ t }) {
  return (
    <div className="p-12 rounded-3xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center">
      <div className="text-4xl mb-3">📖</div>
      <h3 className="font-bold text-[color:var(--color-ink)] mb-1">{t('curriculum.empty')}</h3>
      <p className="text-sm text-[color:var(--color-ink-soft)]">{t('curriculum.empty_hint')}</p>
    </div>
  )
}

function LockedState({ unlocked, total, lang, t }) {
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0
  return (
    <div className="max-w-lg mx-auto p-8 sm:p-10 rounded-3xl bg-white border-2 border-[color:var(--color-gold-soft)] text-center relative overflow-hidden">
      <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-60"
           style={{ background: 'var(--color-gold-soft)' }} />
      <div className="relative">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="font-display text-2xl font-bold text-[color:var(--color-ink)] mb-2">
          {t('curriculum.locked.title')}
        </h2>
        <p className="text-[color:var(--color-ink-soft)] leading-relaxed mb-6">
          {t('curriculum.locked.hint')}
        </p>

        <div className="flex items-center justify-between text-sm font-bold text-[color:var(--color-ink-soft)] mb-1.5">
          <span>{t('curriculum.locked.progress')}</span>
          <span dir="ltr">{unlocked} / {total}</span>
        </div>
        <div className="h-2.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden mb-7">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))' }}
          />
        </div>

        <Link
          to="/memorize"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-bold text-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all"
          style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))' }}
        >
          {t('curriculum.locked.cta')} {lang === 'ar' ? '←' : '→'}
        </Link>
      </div>
    </div>
  )
}

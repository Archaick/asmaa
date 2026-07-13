import { Link } from 'react-router-dom'
import StudentLayout from '../../components/layout/StudentLayout'
import { useLang } from '../../i18n/LangContext'
import { useBouquetLessons, useBouquetLessonProgress } from '../../hooks/useBouquetLessons'
import { useAllBouquetsPublishedQuestionCounts } from '../../hooks/useBouquetQuestions'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'

// Student view of الدورات: fixed 9-tile grid, one lesson per bouquet,
// each following the sheikh's template (opening → 4-verb per name → practice → closing).
export default function Curriculum() {
  const { t, lang } = useLang()
  const { lessons, loading } = useBouquetLessons({ publishedOnly: true })
  const { isCompleted } = useBouquetLessonProgress()
  const { memorized } = useProgress()
  const { byBouquet } = useNames()
  const questionCounts = useAllBouquetsPublishedQuestionCounts()

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
            {t('curriculum.title')}
          </h1>
          <p className="text-[color:var(--color-ink-soft)] max-w-2xl mx-auto">
            {t('curriculum.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-[color:var(--color-ink-mute)]">…</div>
        ) : lessons.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            {lessons.map((l) => {
              const names = byBouquet[l.bouquet.id] || []
              const real = names.filter((n) => !n.isDua)
              const mem = real.filter((n) => memorized.has(n.id)).length
              return (
                <BouquetLessonCard
                  key={l.id}
                  lesson={l}
                  memorized={mem}
                  total={real.length || names.length}
                  completed={isCompleted(l.id)}
                  questionCount={questionCounts[l.id] || 0}
                  lang={lang}
                  t={t}
                />
              )
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

function BouquetLessonCard({ lesson, memorized, total, completed, questionCount, lang, t }) {
  const b = lesson.bouquet
  const isGold = b.color === 'gold'
  const pct = total > 0 ? Math.round((memorized / total) * 100) : 0
  const actionKey = completed ? 'curriculum.review' : memorized > 0 ? 'curriculum.continue' : 'curriculum.start'

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
          <span>{t('curriculum.progress')}</span>
          <span dir="ltr">{memorized} / {total} · {pct}%</span>
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

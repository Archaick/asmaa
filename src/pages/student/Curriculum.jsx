import { Link } from 'react-router-dom'
import StudentLayout from '../../components/layout/StudentLayout'
import { useLang } from '../../i18n/LangContext'
import { useCourses } from '../../hooks/useCourses'
import { useLessonProgress, completedInCourse } from '../../hooks/useLessonProgress'

export default function Curriculum() {
  const { t, lang } = useLang()
  const { courses, loading } = useCourses({ publishedOnly: true })
  const { entries } = useLessonProgress()

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
            {t('curriculum.title')}
          </h1>
          <p className="text-[color:var(--color-ink-soft)]">
            {t('curriculum.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-[color:var(--color-ink-mute)]">…</div>
        ) : courses.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} progress={completedInCourse(entries, c.id)} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

function CourseCard({ course, progress, lang, t }) {
  const title = lang === 'en' && course.titleEn ? course.titleEn : course.title
  const desc = lang === 'en' && course.descriptionEn ? course.descriptionEn : course.description
  const total = course.lessonsCount || 0
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0
  const started = progress > 0
  const complete = total > 0 && progress === total
  const actionKey = complete ? 'curriculum.review' : started ? 'curriculum.continue' : 'curriculum.start'

  return (
    <Link
      to={`/curriculum/${course.id}`}
      className="group relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:-translate-y-1 hover:shadow-xl transition-all"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-60"
           style={{ background: 'var(--color-gold-soft)' }} />
      {complete && (
        <div className="absolute top-4 start-4 text-2xl animate-crown-shimmer" title={t('bouquet.tile.complete_hint')}>👑</div>
      )}

      <div className="relative">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-1">
          🎓 {t('curriculum.title')}
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--color-ink)] mb-2 leading-tight">
          {title}
        </h2>
        {desc && (
          <p className="text-sm sm:text-base text-[color:var(--color-ink-soft)] leading-relaxed mb-4 line-clamp-3">
            {desc}
          </p>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
          <span>{total} {t('curriculum.lessons_count')}</span>
          <span dir="ltr">{progress} / {total} · {pct}%</span>
        </div>
        <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden mb-5">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))',
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

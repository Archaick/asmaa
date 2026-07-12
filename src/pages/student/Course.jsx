import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import StudentLayout from '../../components/layout/StudentLayout'
import { useLang } from '../../i18n/LangContext'
import { useLessons } from '../../hooks/useCourses'
import { useLessonProgress } from '../../hooks/useLessonProgress'

export default function Course() {
  const { courseId } = useParams()
  const { t, lang } = useLang()
  const { lessons } = useLessons(courseId, { publishedOnly: true })
  const { isComplete } = useLessonProgress()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    if (!courseId) return
    return onSnapshot(doc(db, 'courses', courseId), (snap) => {
      setCourse(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
  }, [courseId])

  const title = course && (lang === 'en' && course.titleEn ? course.titleEn : course.title)
  const desc  = course && (lang === 'en' && course.descriptionEn ? course.descriptionEn : course.description)
  const doneCount = lessons.filter((l) => isComplete(l.id)).length

  return (
    <StudentLayout backTo="/curriculum">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {course ? (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📚</div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-2">
                {title}
              </h1>
              {desc && (
                <p className="text-[color:var(--color-ink-soft)] leading-relaxed max-w-lg mx-auto">
                  {desc}
                </p>
              )}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[color:var(--color-gold-soft)]">
                <span dir="ltr" className="text-sm font-bold text-[color:var(--color-ink)]">
                  {doneCount} / {lessons.length}
                </span>
                <span className="text-xs font-bold text-[color:var(--color-gold-deep)]">
                  {t('curriculum.progress')}
                </span>
              </div>
            </div>

            {lessons.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-dashed border-[color:var(--color-cream-deep)] text-center text-sm text-[color:var(--color-ink-mute)]">
                {t('course.no_lessons')}
              </div>
            ) : (
              <ol className="space-y-3">
                {lessons.map((l, i) => {
                  const done = isComplete(l.id)
                  const lessonTitle = lang === 'en' && l.titleEn ? l.titleEn : l.title
                  return (
                    <li key={l.id}>
                      <Link
                        to={`/curriculum/${courseId}/${l.id}`}
                        className={
                          'flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border transition-all hover:-translate-y-0.5 hover:shadow-md ' +
                          (done
                            ? 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)]/30'
                            : 'border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)]')
                        }
                      >
                        <div
                          className={
                            'w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 ' +
                            (done ? 'bg-[color:var(--color-gold)] text-[color:var(--color-ink)]' : 'bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-soft)] border border-[color:var(--color-cream-deep)]')
                          }
                        >
                          {done ? '✓' : (lang === 'ar' ? toArabic(i + 1) : (i + 1))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[color:var(--color-ink)] leading-tight">
                            {lessonTitle}
                          </div>
                          {done && (
                            <div className="text-xs font-bold text-[color:var(--color-gold-deep)] mt-0.5">
                              {t('lesson.completed_badge')}
                            </div>
                          )}
                        </div>
                        <div className="text-lg text-[color:var(--color-ink-mute)]">
                          {lang === 'ar' ? '←' : '→'}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            )}
          </>
        ) : (
          <div className="text-center text-[color:var(--color-ink-mute)] py-12">…</div>
        )}
      </div>
    </StudentLayout>
  )
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']
function toArabic(n) {
  return String(n).split('').map((c) => AR_DIGITS[+c] ?? c).join('')
}

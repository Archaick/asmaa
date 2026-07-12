import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import StudentLayout from '../../components/layout/StudentLayout'
import { useLang } from '../../i18n/LangContext'
import { useLessons } from '../../hooks/useCourses'
import { useLessonProgress } from '../../hooks/useLessonProgress'
import { playChime } from '../../utils/chime'

export default function Lesson() {
  const { courseId, lessonId } = useParams()
  const { t, lang } = useLang()
  const { lessons } = useLessons(courseId, { publishedOnly: true })
  const { isComplete, getReflection, saveReflection, markComplete } = useLessonProgress()
  const [lesson, setLesson] = useState(null)
  const [reflection, setReflection] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!courseId || !lessonId) return
    return onSnapshot(doc(db, 'courses', courseId, 'lessons', lessonId), (snap) => {
      setLesson(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
  }, [courseId, lessonId])

  useEffect(() => {
    setReflection(getReflection(lessonId))
  }, [lessonId, getReflection])

  const idx = lessons.findIndex((l) => l.id === lessonId)
  const prev = idx > 0 ? lessons[idx - 1] : null
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null

  const done = isComplete(lessonId)

  const title = lesson && (lang === 'en' && lesson.titleEn ? lesson.titleEn : lesson.title)
  const body  = lesson && (lang === 'en' && lesson.bodyEn ? lesson.bodyEn : lesson.body)
  const prompt = lesson && (lang === 'en' && lesson.reflectionPromptEn ? lesson.reflectionPromptEn : lesson.reflectionPrompt)

  const paragraphs = useMemo(() => (body || '').split(/\n\n+/).map((p) => p.trim()).filter(Boolean), [body])

  const onReflectionBlur = async () => {
    if (!lessonId) return
    await saveReflection(lessonId, courseId, reflection)
  }

  const onComplete = async () => {
    if (done) return
    playChime()
    await markComplete(lessonId, courseId)
    // Also flush the reflection text with completion
    if (reflection) await saveReflection(lessonId, courseId, reflection)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1500)
  }

  return (
    <StudentLayout backTo={`/curriculum/${courseId}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {lesson ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <Link to={`/curriculum/${courseId}`} className="text-xs font-bold text-[color:var(--color-gold-deep)] hover:underline">
                ← {t('lesson.back_to_course')}
              </Link>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mt-3 mb-2">
                {title}
              </h1>
              {done && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)] text-xs font-bold">
                  {t('lesson.completed_badge')}
                </div>
              )}
            </div>

            {/* Reading */}
            <section className="mb-8">
              <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3 flex items-center gap-2">
                📖 {t('lesson.reading_title')}
              </h2>
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] space-y-3 leading-relaxed text-[color:var(--color-ink)]">
                {paragraphs.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-ink-mute)]">{t('lesson.no_body')}</p>
                ) : (
                  paragraphs.map((p, i) => <p key={i} className="text-base sm:text-lg">{p}</p>)
                )}
              </div>
            </section>

            {/* Reflection */}
            {prompt && (
              <section className="mb-8">
                <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3 flex items-center gap-2">
                  💭 {t('lesson.reflection_title')}
                </h2>
                <div className="p-5 rounded-2xl bg-[color:var(--color-cream-warm)] border border-[color:var(--color-gold-soft)]">
                  <p className="text-base text-[color:var(--color-ink-soft)] mb-3 font-semibold">{prompt}</p>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    onBlur={onReflectionBlur}
                    rows={4}
                    placeholder={t('lesson.reflection_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition resize-y"
                  />
                </div>
              </section>
            )}

            {/* Complete + nav */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <button
                type="button"
                onClick={onComplete}
                disabled={done}
                className={
                  'flex-1 py-3 rounded-2xl text-base font-bold transition ' +
                  (done
                    ? 'bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink-soft)] border-2 border-[color:var(--color-cream-deep)] cursor-default'
                    : 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)]')
                }
              >
                {done ? t('lesson.completed_badge') : (savedFlash ? '✓' : t('lesson.mark_complete'))}
              </button>
            </div>

            {/* Prev/Next */}
            <div className="flex items-center justify-between gap-3">
              {prev ? (
                <Link to={`/curriculum/${courseId}/${prev.id}`} className="flex-1 max-w-xs px-4 py-3 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition text-start">
                  <div className="text-[10px] font-bold text-[color:var(--color-ink-mute)] uppercase tracking-wider mb-0.5">
                    {lang === 'ar' ? '→' : '←'} {t('lesson.prev')}
                  </div>
                  <div className="text-sm font-bold text-[color:var(--color-ink)] truncate">
                    {lang === 'en' && prev.titleEn ? prev.titleEn : prev.title}
                  </div>
                </Link>
              ) : <div className="flex-1" />}
              {next ? (
                <Link to={`/curriculum/${courseId}/${next.id}`} className="flex-1 max-w-xs px-4 py-3 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition text-end">
                  <div className="text-[10px] font-bold text-[color:var(--color-ink-mute)] uppercase tracking-wider mb-0.5">
                    {t('lesson.next')} {lang === 'ar' ? '←' : '→'}
                  </div>
                  <div className="text-sm font-bold text-[color:var(--color-ink)] truncate">
                    {lang === 'en' && next.titleEn ? next.titleEn : next.title}
                  </div>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </>
        ) : (
          <div className="text-center text-[color:var(--color-ink-mute)] py-12">…</div>
        )}
      </div>
    </StudentLayout>
  )
}


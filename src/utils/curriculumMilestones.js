// Curriculum (الدورة) achievements — separate track from the الوسيلة
// milestones. Computed from bouquet-lesson progress docs.
// Labels/descriptions live in i18n under `cmilestone.{id}.label|desc`.

export function computeCurriculumMilestones({ completedCount, totalLessons, perfectCount }) {
  const allDone = totalLessons > 0 && completedCount >= totalLessons
  return [
    { id: 'lesson-first',   icon: '📗', unlocked: completedCount >= 1 },
    { id: 'lesson-three',   icon: '📚', unlocked: completedCount >= 3 },
    { id: 'lesson-perfect', icon: '💯', unlocked: perfectCount >= 1 },
    { id: 'lesson-all',     icon: '🎓', unlocked: allDone },
  ]
}

// Summarize a map of /users/{uid}/bouquetLessons/{id} docs.
export function summarizeLessonProgress(byId) {
  const entries = Object.values(byId || {})
  const completedCount = entries.filter((e) => e.completed).length
  const perfectCount = entries.filter(
    (e) => e.completed && e.bestTotal > 0 && (e.bestScore ?? 0) === e.bestTotal
  ).length
  return { completedCount, perfectCount }
}

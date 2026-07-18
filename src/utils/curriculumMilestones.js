// Curriculum (الدورة) achievements — separate track from the الوسيلة
// milestones. Fully dynamic: thresholds scale to however many lessons are
// currently published, so achievements never become unreachable (too few
// lessons) and "complete the course" re-locks honestly when new lessons ship.
// Labels/descriptions live in i18n under `cmilestone.{id}.label|desc`.

export function computeCurriculumMilestones({ completedCount, totalLessons, perfectCount }) {
  const list = []

  // First lesson — meaningful the moment any lesson exists.
  list.push({
    id: 'lesson-first', icon: '📗',
    current: completedCount, target: 1,
    unlocked: completedCount >= 1,
  })

  // Halfway — only shown once there are enough lessons for "half" to be a
  // distinct, non-trivial milestone (avoids duplicating "first"/"all").
  if (totalLessons >= 4) {
    const half = Math.ceil(totalLessons / 2)
    list.push({
      id: 'lesson-half', icon: '📚',
      current: completedCount, target: half,
      unlocked: completedCount >= half,
    })
  }

  // A perfect score on any lesson.
  list.push({
    id: 'lesson-perfect', icon: '💯',
    current: perfectCount, target: 1,
    unlocked: perfectCount >= 1,
  })

  // Whole course — target is the live published count, so it stretches.
  if (totalLessons >= 1) {
    list.push({
      id: 'lesson-all', icon: '🎓',
      current: completedCount, target: totalLessons,
      unlocked: completedCount >= totalLessons,
    })
  }

  return list
}

// Count completed / perfect ONLY among the currently-published lessons, so a
// lesson that was completed then unpublished no longer inflates the totals.
export function summarizeLessonProgress(byId, publishedIds) {
  const ids = publishedIds || Object.keys(byId || {})
  let completedCount = 0
  let perfectCount = 0
  for (const id of ids) {
    const e = byId?.[id]
    if (!e?.completed) continue
    completedCount++
    if (e.bestTotal > 0 && (e.bestScore ?? 0) === e.bestTotal) perfectCount++
  }
  return { completedCount, perfectCount }
}

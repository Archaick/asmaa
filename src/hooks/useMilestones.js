import { useMemo } from 'react'
import { computeStreakInfo, computeBouquetCompletion, computeMilestones } from '../utils/milestones'

export function useMilestones(entries, memorized, memorizedCount) {
  const streakInfo = useMemo(() => computeStreakInfo(entries), [entries])
  const bouquetCompletion = useMemo(() => computeBouquetCompletion(memorized), [memorized])
  const bouquetsDoneCount = Object.values(bouquetCompletion).filter(Boolean).length

  const milestones = useMemo(
    () => computeMilestones({ memorizedCount, memorizedSet: memorized, streakInfo, bouquetCompletion }),
    [memorizedCount, memorized, streakInfo, bouquetCompletion]
  )

  return {
    milestones,
    streak: streakInfo.streak,
    uniqueDays: streakInfo.uniqueDays,
    bouquetCompletion,
    bouquetsDoneCount,
  }
}

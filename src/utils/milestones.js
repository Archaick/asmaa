// Pure milestone / streak computation — shared by student hook and admin views.

import { BOUQUETS, TOTAL_NAMES } from '../data/bouquets'
import { NAMES_BY_BOUQUET } from '../data/names99'

const DAY_MS = 24 * 60 * 60 * 1000

export function tsMs(ts) {
  if (!ts) return 0
  if (ts.toMillis) return ts.toMillis()
  if (ts.seconds) return ts.seconds * 1000
  return 0
}

function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export const FAMOUS_IDS = ['allah', 'ar-rahman', 'ar-raheem', 'al-hayy', 'al-qayyoom']

export function computeStreakInfo(entries) {
  if (!entries || entries.length === 0) return { streak: 0, uniqueDays: 0 }
  const dates = new Set()
  for (const e of entries) {
    const ms = tsMs(e.memorizedAt)
    if (!ms) continue
    dates.add(dayKey(new Date(ms)))
  }
  const uniqueDays = dates.size
  const today = dayKey(new Date())
  const yesterday = dayKey(new Date(Date.now() - DAY_MS))
  let streak = 0
  let cursor
  if (dates.has(today)) cursor = new Date()
  else if (dates.has(yesterday)) cursor = new Date(Date.now() - DAY_MS)
  else return { streak: 0, uniqueDays }
  while (dates.has(dayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return { streak, uniqueDays }
}

export function computeBouquetCompletion(memorizedSet) {
  const complete = {}
  for (const b of BOUQUETS.slice(1, 7)) {
    const names = NAMES_BY_BOUQUET[b.id] || []
    complete[b.id] = names.length > 0 && names.every((n) => memorizedSet.has(n.id))
  }
  return complete
}

export function computeMilestones({ memorizedCount, memorizedSet, streakInfo, bouquetCompletion }) {
  const famousDone = FAMOUS_IDS.every((id) => memorizedSet.has(id))
  const anyBouquetDone = Object.values(bouquetCompletion).some(Boolean)
  return [
    { id: 'first-name',    label: 'أول اسم',           desc: 'حفظت أول اسم من أسماء الله',    icon: '🌱', unlocked: memorizedCount >= 1 },
    { id: 'famous',        label: 'الأسماء المشهورة',    desc: 'أتممت الأسماء الخمسة المشهورة',  icon: '⭐', unlocked: famousDone },
    { id: 'first-bouquet', label: 'أول باقة',           desc: 'أتممت باقة كاملة',              icon: '🎁', unlocked: anyBouquetDone },
    { id: 'halfway',       label: 'نصف الطريق',         desc: 'حفظت ٥٠ اسماً',                 icon: '🌓', unlocked: memorizedCount >= 50 },
    { id: 'week-streak',   label: 'وِرد الأسبوع',        desc: 'وِرد يومي لسبعة أيام',          icon: '🌙', unlocked: streakInfo.streak >= 7 },
    { id: 'complete',      label: 'الوسيلة كاملة',       desc: 'أحصيت التسع والتسعين',          icon: '👑', unlocked: memorizedCount >= TOTAL_NAMES },
    { id: 'ninety-days',   label: 'الوِرد التسعوني',     desc: '٩٩ يوماً من الوِرد',            icon: '🕋', unlocked: streakInfo.uniqueDays >= 99 },
  ]
}

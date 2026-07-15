import { useCallback, useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { BOUQUETS } from '../data/bouquets'

// One bouquet-lesson per bouquet — 9 total, fixed.
// A Firestore doc /bouquetLessons/{bouquetId} stores admin-editable state:
//   { published, introAr, introEn, outroAr, outroEn, questionTypes, ... }
// If a doc doesn't exist, we fall back to sane defaults (unpublished draft).
export function useBouquetLessons({ publishedOnly = false } = {}) {
  const [docs, setDocs] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'bouquetLessons'),
      (snap) => {
        const m = {}
        snap.forEach((d) => { m[d.id] = d.data() })
        setDocs(m)
        setLoading(false)
      },
      (err) => {
        console.warn('[useBouquetLessons] fallback to defaults:', err?.message)
        setDocs({})
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const lessons = useMemo(() => {
    const list = BOUQUETS.map((b) => {
      const d = docs[b.id] || {}
      return {
        id: b.id,
        bouquet: b,
        published: !!d.published,
        introAr: d.introAr || '',
        introEn: d.introEn || '',
        outroAr: d.outroAr || '',
        outroEn: d.outroEn || '',
      }
    })
    return publishedOnly ? list.filter((l) => l.published) : list
  }, [docs, publishedOnly])

  return { lessons, loading }
}

// Admin: upsert a bouquet lesson doc.
export async function saveBouquetLesson(bouquetId, payload) {
  await setDoc(
    doc(db, 'bouquetLessons', bouquetId),
    { ...payload, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// Per-user progress on bouquet lessons: /users/{uid}/bouquetLessons/{bouquetId}
// Tracks the current step in the template + whether the lesson has been sealed.
export function useBouquetLessonProgress() {
  const { user } = useAuth()
  const [byId, setById] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setById({}); setLoading(false); return }
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'bouquetLessons'),
      (snap) => {
        const m = {}
        snap.forEach((d) => { m[d.id] = d.data() })
        setById(m)
        setLoading(false)
      },
      (err) => {
        console.error('[useBouquetLessonProgress] subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  const isCompleted = useCallback((bouquetId) => !!byId[bouquetId]?.completed, [byId])
  const getStep = useCallback((bouquetId) => byId[bouquetId]?.step ?? 0, [byId])
  // Best question score the student has achieved on this lesson, if any.
  const getBest = useCallback(
    (bouquetId) => {
      const e = byId[bouquetId]
      if (!e || e.bestTotal == null) return null
      return { score: e.bestScore ?? 0, total: e.bestTotal }
    },
    [byId]
  )

  const saveStep = useCallback(async (bouquetId, step) => {
    if (!user) return
    await setDoc(
      doc(db, 'users', user.uid, 'bouquetLessons', bouquetId),
      { step, updatedAt: serverTimestamp() },
      { merge: true }
    )
  }, [user])

  // Mark complete, recording the best score seen so far (never lowers it).
  const markCompleted = useCallback(async (bouquetId, result) => {
    if (!user) return
    const payload = { completed: true, completedAt: serverTimestamp(), updatedAt: serverTimestamp() }
    if (result && typeof result.total === 'number') {
      const prev = byId[bouquetId]
      const prevBest = prev?.bestTotal ? (prev.bestScore ?? 0) / prev.bestTotal : -1
      const thisBest = result.total ? (result.score ?? 0) / result.total : 0
      payload.lastScore = result.score ?? 0
      payload.lastTotal = result.total
      if (thisBest >= prevBest) {
        payload.bestScore = result.score ?? 0
        payload.bestTotal = result.total
      }
    }
    await setDoc(doc(db, 'users', user.uid, 'bouquetLessons', bouquetId), payload, { merge: true })
  }, [user, byId])

  const completedCount = useMemo(
    () => Object.values(byId).filter((e) => e.completed).length,
    [byId]
  )

  return { byId, isCompleted, getStep, getBest, saveStep, markCompleted, completedCount, loading }
}


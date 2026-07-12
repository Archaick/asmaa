import { useCallback, useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Tracks the current user's lesson progress across all courses.
// Each entry: { id: lessonId, courseId, completed, reflectionText, completedAt }
export function useLessonProgress() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setEntries([]); setLoading(false); return }
    const col = collection(db, 'users', user.uid, 'lessonProgress')
    const unsub = onSnapshot(
      col,
      (snap) => {
        const arr = []
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }))
        setEntries(arr)
        setLoading(false)
      },
      (err) => {
        console.error('[useLessonProgress] subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  const byId = useMemo(() => Object.fromEntries(entries.map((e) => [e.id, e])), [entries])
  const completedCount = useMemo(() => entries.filter((e) => e.completed).length, [entries])

  const isComplete = (lessonId) => !!byId[lessonId]?.completed
  const getReflection = (lessonId) => byId[lessonId]?.reflectionText || ''

  const saveReflection = useCallback(async (lessonId, courseId, text) => {
    if (!user) return
    await setDoc(
      doc(db, 'users', user.uid, 'lessonProgress', lessonId),
      { courseId, reflectionText: text, updatedAt: serverTimestamp() },
      { merge: true }
    )
  }, [user])

  const markComplete = useCallback(async (lessonId, courseId) => {
    if (!user) return
    await setDoc(
      doc(db, 'users', user.uid, 'lessonProgress', lessonId),
      { courseId, completed: true, completedAt: serverTimestamp() },
      { merge: true }
    )
  }, [user])

  return { entries, byId, completedCount, isComplete, getReflection, saveReflection, markComplete, loading }
}

// Count completed lessons for a given course (client-side filter).
export function completedInCourse(entries, courseId) {
  return entries.filter((e) => e.courseId === courseId && e.completed).length
}

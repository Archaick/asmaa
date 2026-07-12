import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

// Live-subscribed list of courses.
// { publishedOnly: true } filters out drafts — use for student views.
export function useCourses({ publishedOnly = false } = {}) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('order'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        let arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (publishedOnly) arr = arr.filter((c) => c.published)
        setCourses(arr)
        setLoading(false)
      },
      (err) => {
        console.error('[useCourses] subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [publishedOnly])

  return { courses, loading }
}

export function useLessons(courseId, { publishedOnly = false } = {}) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) { setLessons([]); setLoading(false); return }
    const q = query(collection(db, 'courses', courseId, 'lessons'), orderBy('order'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        let arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (publishedOnly) arr = arr.filter((l) => l.published !== false)
        setLessons(arr)
        setLoading(false)
      },
      (err) => {
        console.error('[useLessons] subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [courseId, publishedOnly])

  return { lessons, loading }
}

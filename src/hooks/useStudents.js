import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

// Live-subscribed list of student users. Sorted by most recent activity.
export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        rows.sort((a, b) => tsMs(b.lastActive) - tsMs(a.lastActive))
        setStudents(rows)
        setLoading(false)
      },
      (err) => {
        console.error('students subscribe failed:', err)
        setError(err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return { students, loading, error }
}

function tsMs(ts) {
  if (!ts) return 0
  if (ts.toMillis) return ts.toMillis()
  if (ts.seconds) return ts.seconds * 1000
  return 0
}

export function relativeTime(ts) {
  const ms = tsMs(ts)
  if (!ms) return 'لم يبدأ'
  const diff = Date.now() - ms
  const min = 60_000, hr = 60 * min, day = 24 * hr
  if (diff < min)       return 'الآن'
  if (diff < hr)        return `منذ ${Math.floor(diff / min)} د`
  if (diff < day)       return `منذ ${Math.floor(diff / hr)} س`
  if (diff < 30 * day)  return `منذ ${Math.floor(diff / day)} يوم`
  return new Date(ms).toLocaleDateString('ar-EG')
}

import { useEffect, useState, useCallback, useMemo } from 'react'
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { REAL_NAME_IDS } from '../data/names99'

// Live-subscribes to /users/{uid}/progress/*.
// Returns full entries (with timestamps) so streaks + milestones can be computed.
export function useProgress() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([]) // [{ id, memorizedAt }]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    const col = collection(db, 'users', user.uid, 'progress')
    const unsub = onSnapshot(
      col,
      (snap) => {
        const arr = []
        snap.forEach((d) => {
          const data = d.data()
          if (data?.memorized) {
            arr.push({ id: d.id, memorizedAt: data.memorizedAt || null })
          }
        })
        setEntries(arr)
        setLoading(false)
      },
      (err) => {
        console.error('progress subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  const memorized = useMemo(() => new Set(entries.map((e) => e.id)), [entries])
  const memorizedCount = useMemo(
    () => entries.filter((e) => REAL_NAME_IDS.includes(e.id)).length,
    [entries]
  )

  const markMemorized = useCallback(async (nameId) => {
    if (!user) return
    if (memorized.has(nameId)) return
    await setDoc(
      doc(db, 'users', user.uid, 'progress', nameId),
      { memorized: true, memorizedAt: serverTimestamp() },
      { merge: true }
    )
    if (REAL_NAME_IDS.includes(nameId)) {
      await setDoc(
        doc(db, 'users', user.uid),
        { 'stats.memorized': increment(1), lastActive: serverTimestamp() },
        { merge: true }
      )
    }
  }, [user, memorized])

  const unmarkMemorized = useCallback(async (nameId) => {
    if (!user) return
    if (!memorized.has(nameId)) return
    await deleteDoc(doc(db, 'users', user.uid, 'progress', nameId))
    if (REAL_NAME_IDS.includes(nameId)) {
      await setDoc(
        doc(db, 'users', user.uid),
        { 'stats.memorized': increment(-1), lastActive: serverTimestamp() },
        { merge: true }
      )
    }
  }, [user, memorized])

  return { memorized, memorizedCount, entries, loading, markMemorized, unmarkMemorized }
}

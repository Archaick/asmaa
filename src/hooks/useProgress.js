import { useEffect, useState, useCallback } from 'react'
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { REAL_NAME_IDS } from '../data/names99'

// Subscribes to /users/{uid}/progress/*, returns a Set of memorized nameIds
// and functions to mark/unmark. Skips actual writes until a user is present.

export function useProgress() {
  const { user } = useAuth()
  const [memorized, setMemorized] = useState(() => new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMemorized(new Set())
      setLoading(false)
      return
    }
    setLoading(true)
    const col = collection(db, 'users', user.uid, 'progress')
    const unsub = onSnapshot(
      col,
      (snap) => {
        const s = new Set()
        snap.forEach((d) => {
          if (d.data()?.memorized) s.add(d.id)
        })
        setMemorized(s)
        setLoading(false)
      },
      (err) => {
        console.error('progress subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  const markMemorized = useCallback(async (nameId) => {
    if (!user) return
    if (memorized.has(nameId)) return // idempotent
    await setDoc(
      doc(db, 'users', user.uid, 'progress', nameId),
      { memorized: true, memorizedAt: serverTimestamp() },
      { merge: true }
    )
    // Denormalized counter on the user doc — for the admin students list
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

  // Derived stats
  const memorizedCount = [...memorized].filter((id) => REAL_NAME_IDS.includes(id)).length

  return { memorized, memorizedCount, loading, markMemorized, unmarkMemorized }
}

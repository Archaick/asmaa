import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const DEFAULTS = {
  // When true, students must unlock every الوسيلة achievement before the
  // الدورة (curriculum) section opens.
  gateCurriculum: false,
}

// Global app configuration, stored in a single Firestore doc /config/app.
export function useAppConfig() {
  const [config, setConfig] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config', 'app'),
      (snap) => {
        setConfig({ ...DEFAULTS, ...(snap.exists() ? snap.data() : {}) })
        setLoading(false)
      },
      (err) => {
        console.warn('[useAppConfig] fallback to defaults:', err?.message)
        setConfig(DEFAULTS)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return { config, loading }
}

// Admin-only write (guarded by Firestore rules).
export async function saveAppConfig(patch) {
  await setDoc(
    doc(db, 'config', 'app'),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

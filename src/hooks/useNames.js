import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { NAMES as STATIC_NAMES } from '../data/names99'
import { BOUQUETS } from '../data/bouquets'

// Live-subscribed 99 names. When the Firestore `names` collection is empty
// (before it's been seeded), falls back to the static file so the app
// always renders. Once seeded, Firestore becomes the source of truth and
// admin edits are visible to students within seconds.
export function useNames() {
  const [names, setNames] = useState(STATIC_NAMES)
  const [source, setSource] = useState('static')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'names'),
      (snap) => {
        if (snap.empty) {
          setNames(STATIC_NAMES)
          setSource('static')
        } else {
          const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          const bouquetOrder = Object.fromEntries(BOUQUETS.map((b) => [b.id, b.order]))
          arr.sort((a, b) => {
            const bo = (bouquetOrder[a.bouquet] ?? 99) - (bouquetOrder[b.bouquet] ?? 99)
            if (bo !== 0) return bo
            return (a.order ?? 0) - (b.order ?? 0)
          })
          setNames(arr)
          setSource('firestore')
        }
        setLoading(false)
      },
      (err) => {
        console.warn('[useNames] fallback to static (Firestore unreachable):', err?.message)
        setNames(STATIC_NAMES)
        setSource('static')
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const byBouquet = useMemo(() => {
    const m = {}
    for (const n of names) {
      if (!m[n.bouquet]) m[n.bouquet] = []
      m[n.bouquet].push(n)
    }
    Object.values(m).forEach((arr) => arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    return m
  }, [names])

  const findName = (id) => names.find((n) => n.id === id)

  return { names, byBouquet, findName, loading, source }
}

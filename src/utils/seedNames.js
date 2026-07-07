import { collection, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { NAMES } from '../data/names99'

// Idempotent seed: creates any name docs missing from Firestore.
// Never overwrites an existing edited doc.
export async function seedNames() {
  const namesCol = collection(db, 'names')
  const existing = await getDocs(namesCol)
  const existingIds = new Set(existing.docs.map((d) => d.id))

  const missing = NAMES.filter((n) => !existingIds.has(n.id))
  if (missing.length === 0) {
    return { created: 0, existing: existing.size, total: NAMES.length }
  }

  const batch = writeBatch(db)
  for (const n of missing) {
    batch.set(doc(db, 'names', n.id), {
      order: n.order ?? 0,
      bouquet: n.bouquet,
      name: n.name,
      meaning: n.meaning || '',
      thanaa: n.thanaa || '',
      talab: n.talab || '',
      evidence: n.evidence || '',
      audioUrl: n.audioUrl || '',
      isDua: !!n.isDua,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  }
  await batch.commit()
  return { created: missing.length, existing: existing.size, total: NAMES.length }
}

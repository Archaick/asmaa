import { useEffect, useState } from 'react'
import {
  collection, collectionGroup, doc, onSnapshot, orderBy, query, where,
  serverTimestamp, setDoc, updateDoc, deleteDoc, getDocs, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

// Realtime subscription to questions for a specific bouquet lesson.
// Each doc lives under /bouquetLessons/{bouquetId}/questions/{qid} and stores:
//   { type, order, published, ...typeSpecificFields, createdAt, updatedAt }
// See QUESTION_TYPES below for the shape of each type.
export function useBouquetQuestions(bouquetId, { publishedOnly = false } = {}) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bouquetId) { setQuestions([]); setLoading(false); return }
    const q = query(
      collection(db, 'bouquetLessons', bouquetId, 'questions'),
      orderBy('order'),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        let arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (publishedOnly) arr = arr.filter((x) => x.published)
        setQuestions(arr)
        setLoading(false)
      },
      (err) => {
        console.error('[useBouquetQuestions] subscribe failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [bouquetId, publishedOnly])

  return { questions, loading }
}

/* ─── CRUD ────────────────────────────────────────────── */

// Creates a new question at the end of the ordered list.
export async function addQuestion(bouquetId, payload) {
  const snap = await getDocs(collection(db, 'bouquetLessons', bouquetId, 'questions'))
  const order = snap.size
  const ref = doc(collection(db, 'bouquetLessons', bouquetId, 'questions'))
  await setDoc(ref, {
    ...payload,
    order,
    published: payload.published ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateQuestion(bouquetId, qId, updates) {
  await updateDoc(
    doc(db, 'bouquetLessons', bouquetId, 'questions', qId),
    { ...updates, updatedAt: serverTimestamp() },
  )
}

export async function deleteQuestion(bouquetId, qId) {
  await deleteDoc(doc(db, 'bouquetLessons', bouquetId, 'questions', qId))
}

// Live counts of published questions grouped by bouquetId. Used by the
// student curriculum grid to show how many questions each bouquet has.
export function useAllBouquetsPublishedQuestionCounts() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const qq = query(
      collectionGroup(db, 'questions'),
      where('published', '==', true),
    )
    const unsub = onSnapshot(
      qq,
      (snap) => {
        const c = {}
        snap.forEach((d) => {
          // path: /bouquetLessons/{bouquetId}/questions/{qid}
          const bouquetId = d.ref.parent.parent?.id
          if (bouquetId) c[bouquetId] = (c[bouquetId] || 0) + 1
        })
        setCounts(c)
      },
      (err) => console.warn('[useAllBouquetsPublishedQuestionCounts]:', err?.message),
    )
    return unsub
  }, [])

  return counts
}

// Reorder: swap two questions' order fields atomically.
export async function reorderQuestions(bouquetId, questions, fromIndex, toIndex) {
  if (fromIndex === toIndex) return
  const next = [...questions]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  const batch = writeBatch(db)
  next.forEach((q, i) => {
    if (q.order !== i) {
      batch.update(doc(db, 'bouquetLessons', bouquetId, 'questions', q.id), {
        order: i, updatedAt: serverTimestamp(),
      })
    }
  })
  await batch.commit()
}

/* ─── Question type registry ──────────────────────────── */

// Field labels — shared by admin editor + student renderer.
export const NAME_FIELDS = [
  { key: 'meaning', label: 'المعنى', icon: '💡' },
  { key: 'thanaa',  label: 'الثناء', icon: '🌟' },
  { key: 'talab',   label: 'الطلب',  icon: '🤲' },
  { key: 'taabbud', label: 'التعبد', icon: '💛' },
]

export const QUESTION_TYPES = [
  {
    key: 'multipleChoice',
    label: 'اختيار من متعدد',
    icon: '⚡',
    defaults: {
      mcSubjectNameId: '',
      mcAskField: 'meaning',
      mcCustomPrompt: '',
      mcDistractorNameIds: [], // empty = auto-pick from same bouquet
    },
  },
  {
    key: 'trueFalse',
    label: 'صح أم خطأ',
    icon: '⚖️',
    defaults: {
      tfStatementAr: '',
      tfStatementEn: '',
      tfAnswer: true,
    },
  },
  {
    key: 'wordPair',
    label: 'مطابقة الكلمات',
    icon: '🔗',
    defaults: {
      wpField: 'meaning',
      wpNameIds: [],
    },
  },
  {
    key: 'trace',
    label: 'تتبّع الاسم',
    icon: '✍️',
    defaults: {
      traceNameId: '',
    },
  },
]

// Returns default payload for a fresh question of the given type.
export function defaultsFor(type) {
  const meta = QUESTION_TYPES.find((t) => t.key === type)
  return meta ? { type, ...meta.defaults } : { type }
}

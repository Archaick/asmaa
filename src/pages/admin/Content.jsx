import { useEffect, useState } from 'react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import { useNames } from '../../hooks/useNames'
import { seedNames } from '../../utils/seedNames'
import { BOUQUETS } from '../../data/bouquets'
import { NAMES as STATIC_NAMES } from '../../data/names99'

export default function AdminContent() {
  const { byBouquet, source, names } = useNames()
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState(null)
  const [seedError, setSeedError] = useState(null)

  const inFirestore = source === 'firestore' ? names.length : 0
  const missing = STATIC_NAMES.length - inFirestore

  const doSeed = async () => {
    setSeeding(true)
    setSeedError(null)
    try {
      const r = await seedNames()
      setSeedResult(r)
    } catch (e) {
      console.error('seed failed:', e)
      setSeedError(e?.message || 'خطأ غير معروف')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <AdminLayout title="محتوى الأسماء" subtitle="عرض وتعديل معاني الأسماء والدعاء بها">
      {/* Publish state */}
      <div className="mb-6 p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: source === 'firestore' ? 'var(--color-teal)' : 'var(--color-gold)' }}
            />
            <div className="font-bold text-[color:var(--color-ink)]">
              {source === 'firestore' ? 'المحتوى منشور في Firestore' : 'المحتوى غير منشور بعد'}
            </div>
          </div>
          <p className="text-sm text-[color:var(--color-ink-soft)]">
            {source === 'firestore'
              ? `${inFirestore} من ${STATIC_NAMES.length} مبثوثة${missing > 0 ? ` — ${missing} ما زالت غير منشورة` : ' — الكل جاهز للتحرير'}`
              : 'الأسماء الظاهرة حاليًا من ملف ثابت. اضغط "نشر" لنقلها إلى Firestore وتفعيل التحرير المباشر.'}
          </p>
          {seedResult && (
            <p className="text-sm text-[color:var(--color-teal-deep)] mt-2 font-bold">
              ✓ تمّ نشر {seedResult.created} اسم — الإجمالي الآن في Firestore: {seedResult.created + seedResult.existing}
            </p>
          )}
          {seedError && (
            <p className="text-sm text-red-700 mt-2">فشل النشر: {seedError}</p>
          )}
        </div>
        {(source !== 'firestore' || missing > 0) && (
          <button
            type="button"
            onClick={doSeed}
            disabled={seeding}
            className="shrink-0 px-6 py-3 rounded-xl font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] disabled:opacity-60 transition"
          >
            {seeding ? 'جارٍ النشر…' : source === 'firestore' ? 'نشر المفقود' : 'نشر المحتوى المبدئي'}
          </button>
        )}
      </div>

      {/* Editor / preview */}
      {source === 'firestore' ? (
        <EditorMode byBouquet={byBouquet} />
      ) : (
        <ReadonlyPreview />
      )}
    </AdminLayout>
  )
}

/* ─── Editor mode (live Firestore) ───────────────────────── */

function EditorMode({ byBouquet }) {
  return (
    <>
      {BOUQUETS.map((b) => (
        <section key={b.id} className="mb-8">
          <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">
            {b.title} <span className="text-sm text-[color:var(--color-ink-mute)]">· {(byBouquet[b.id] || []).length} اسم</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" dir="rtl">
            {(byBouquet[b.id] || []).map((n) => (
              <NameEditor key={n.id} name={n} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function NameEditor({ name }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState({
    meaning: name.meaning || '',
    thanaa: name.thanaa || '',
    talab: name.talab || '',
    evidence: name.evidence || '',
  })
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState(null)

  // Sync form when Firestore updates (e.g. from another tab)
  useEffect(() => {
    setForm({
      meaning: name.meaning || '',
      thanaa: name.thanaa || '',
      talab: name.talab || '',
      evidence: name.evidence || '',
    })
  }, [name.id, name.meaning, name.thanaa, name.talab, name.evidence])

  const dirty =
    form.meaning !== (name.meaning || '') ||
    form.thanaa !== (name.thanaa || '') ||
    form.talab !== (name.talab || '') ||
    form.evidence !== (name.evidence || '')

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'names', name.id), {
        meaning: form.meaning,
        thanaa: form.thanaa,
        talab: form.talab,
        evidence: form.evidence,
        updatedAt: serverTimestamp(),
      })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1600)
    } catch (e) {
      setError(e?.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl bg-white border border-[color:var(--color-cream-deep)] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-cream-warm)] transition text-start"
      >
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-lg text-[color:var(--color-ink)]">{name.name}</span>
          {dirty && !savedFlash && (
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-gold)]" title="غير محفوظ" />
          )}
          {savedFlash && (
            <span className="text-xs text-[color:var(--color-teal-deep)] font-bold">✓ محفوظ</span>
          )}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={'transition-transform ' + (expanded ? 'rotate-180' : '')}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 border-t border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          <Field label="المعنى" value={form.meaning} onChange={(v) => setForm({ ...form, meaning: v })} />
          <Field label="الثناء" value={form.thanaa}  onChange={(v) => setForm({ ...form, thanaa: v })} />
          <Field label="الطلب"  value={form.talab}   onChange={(v) => setForm({ ...form, talab: v })} />
          <Field label="الدليل (اختياري)" value={form.evidence} onChange={(v) => setForm({ ...form, evidence: v })} />

          {error && <div className="mt-2 text-sm text-red-700">{error}</div>}

          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] disabled:opacity-50 transition"
            >
              {saving ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition resize-y"
      />
    </div>
  )
}

/* ─── Read-only preview (before seed) ────────────────────── */

function ReadonlyPreview() {
  return (
    <>
      {BOUQUETS.map((b) => (
        <section key={b.id} className="mb-8 opacity-70">
          <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-3">
            {b.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" dir="rtl">
            {(STATIC_NAMES.filter((n) => n.bouquet === b.id)).map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-white border border-[color:var(--color-cream-deep)]">
                <div className="font-serif font-bold text-lg text-[color:var(--color-ink)] mb-1">{n.name}</div>
                <div className="text-sm text-[color:var(--color-ink-soft)] leading-relaxed">{n.meaning}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

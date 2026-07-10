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
  const [tab, setTab] = useState('ar')
  const [form, setForm] = useState(emptyForm(name))
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState(null)

  // Sync form when Firestore updates (e.g. from another tab)
  useEffect(() => {
    setForm(emptyForm(name))
  }, [name.id, name.meaning, name.thanaa, name.talab, name.evidence,
      name.meaningEn, name.thanaaEn, name.talabEn, name.evidenceEn])

  const dirty = FIELDS_ALL.some((f) => form[f] !== (name[f] || ''))

  // Has any English content been added?
  const hasEn = ['meaningEn', 'thanaaEn', 'talabEn', 'evidenceEn'].some((f) => (name[f] || '').trim())

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = { updatedAt: serverTimestamp() }
      for (const f of FIELDS_ALL) payload[f] = form[f]
      await updateDoc(doc(db, 'names', name.id), payload)
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
          {hasEn && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-deep)] font-bold" title="ترجمة موجودة">EN</span>
          )}
          {dirty && !savedFlash && (
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-gold)]" title="غير محفوظ" />
          )}
          {savedFlash && (
            <span className="text-xs text-[color:var(--color-teal-deep)] font-bold">✓ محفوظ</span>
          )}
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className={'transition-transform ' + (expanded ? 'rotate-180' : '')}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 border-t border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          {/* AR / EN tabs */}
          <div className="flex items-center gap-1 mb-3 p-1 bg-white rounded-xl border border-[color:var(--color-cream-deep)] w-fit">
            <TabBtn active={tab === 'ar'} onClick={() => setTab('ar')}>عربي</TabBtn>
            <TabBtn active={tab === 'en'} onClick={() => setTab('en')}>English</TabBtn>
          </div>

          {tab === 'ar' ? (
            <div dir="rtl">
              <Field label="المعنى" value={form.meaning} onChange={(v) => setForm({ ...form, meaning: v })} />
              <Field label="الثناء" value={form.thanaa}  onChange={(v) => setForm({ ...form, thanaa: v })} />
              <Field label="الطلب"  value={form.talab}   onChange={(v) => setForm({ ...form, talab: v })} />
              <Field label="الدليل (اختياري)" value={form.evidence} onChange={(v) => setForm({ ...form, evidence: v })} />
            </div>
          ) : (
            <div dir="ltr">
              <Field label="Meaning"      value={form.meaningEn}  onChange={(v) => setForm({ ...form, meaningEn: v })} placeholder={form.meaning}  />
              <Field label="Praise"       value={form.thanaaEn}   onChange={(v) => setForm({ ...form, thanaaEn: v })}  placeholder={form.thanaa}   />
              <Field label="Supplication" value={form.talabEn}    onChange={(v) => setForm({ ...form, talabEn: v })}   placeholder={form.talab}    />
              <Field label="Evidence (optional)" value={form.evidenceEn} onChange={(v) => setForm({ ...form, evidenceEn: v })} placeholder={form.evidence} />
              <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-1">
                إذا تُركت الحقول فارغة يعرض الموقع النسخة العربية بدلاً منها.
              </p>
            </div>
          )}

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

const FIELDS_ALL = ['meaning', 'thanaa', 'talab', 'evidence', 'meaningEn', 'thanaaEn', 'talabEn', 'evidenceEn']

function emptyForm(name) {
  const f = {}
  for (const k of FIELDS_ALL) f[k] = name[k] || ''
  return f
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-3 py-1 rounded-lg text-xs font-bold transition ' +
        (active ? 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)]' : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]')
      }
    >{children}</button>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ? `↳ ${placeholder}` : ''}
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

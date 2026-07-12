import { useEffect, useState } from 'react'

// Small reusable modal for quick creation flows (new course, new lesson, etc.)
// Renders a form with the given fields and returns their values on submit.
//
// Props:
//   open: bool
//   title: string
//   fields: [{ name, label, placeholder?, required?, hint? }]
//   submitLabel: string ('حفظ' by default)
//   onCancel: () => void
//   onSubmit: (values) => Promise<void>
export default function CreateModal({ open, title, fields = [], submitLabel = 'حفظ', onCancel, onSubmit }) {
  const [values, setValues] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      const init = {}
      for (const f of fields) init[f.name] = ''
      setValues(init)
      setError(null)
      setBusy(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, fields])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const submit = async (e) => {
    e?.preventDefault?.()
    setError(null)
    // Validate required
    for (const f of fields) {
      if (f.required && !(values[f.name] || '').trim()) {
        setError(`الحقل "${f.label}" مطلوب`)
        return
      }
    }
    setBusy(true)
    try {
      await onSubmit?.(values)
    } catch (err) {
      setError(err?.message || 'فشل الحفظ')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[color:var(--color-ink)]/60 backdrop-blur-sm" onClick={onCancel} />

      <form
        onSubmit={submit}
        className="relative w-full sm:max-w-md bg-[color:var(--color-cream)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[color:var(--color-cream-deep)] flex flex-col animate-fade-in-up overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)] flex items-center justify-between">
          <h3 className="font-display font-bold text-[color:var(--color-ink)]">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-white/70 flex items-center justify-center text-[color:var(--color-ink-soft)]"
            aria-label="إغلاق"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 sm:px-6 py-5 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-[color:var(--color-ink-soft)] mb-1.5">
                {f.label}{f.required && ' *'}
              </label>
              <input
                type="text"
                value={values[f.name] ?? ''}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                placeholder={f.placeholder || ''}
                dir={f.dir || 'auto'}
                autoFocus={fields.indexOf(f) === 0}
                className="w-full px-3 py-2.5 rounded-xl border border-[color:var(--color-cream-deep)] bg-white text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold-soft)] transition"
              />
              {f.hint && <p className="text-[11px] text-[color:var(--color-ink-mute)] mt-1">{f.hint}</p>}
            </div>
          ))}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-[color:var(--color-cream-deep)] bg-white flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] disabled:opacity-60 transition"
          >
            {busy ? '…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

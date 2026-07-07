import { useEffect } from 'react'

export default function NameSheet({ name, isMemorized, onClose, onToggleMemorized, onNav }) {
  useEffect(() => {
    document.body.style.overflow = name ? 'hidden' : ''
    const onKey = (e) => {
      if (!name) return
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft' && !name.isDua)  onNav?.('next')
      if (e.key === 'ArrowRight' && !name.isDua) onNav?.('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [name, onClose, onNav])

  if (!name) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[color:var(--color-ink)]/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] bg-[color:var(--color-cream)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[color:var(--color-cream-deep)] flex flex-col overflow-hidden animate-fade-in-up"
        dir="rtl"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--color-ink-soft)]">
            <span>{isMemorized ? '✅ محفوظ' : name.isDua ? '🤲 دعاء' : 'اسم'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/70 transition flex items-center justify-center text-[color:var(--color-ink-soft)]"
            aria-label="إغلاق"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-center text-[color:var(--color-ink)] mb-6">
            {name.name}
          </h2>

          <Facet icon="💡" label="المعنى" text={name.meaning} accent="gold" />
          <Facet icon="🌟" label="الثناء" text={name.thanaa} accent="teal" />
          <Facet icon="🤲" label="الطلب"  text={name.talab}  accent="gold" last />

          {!name.isDua && (
            <div className="mt-8">
              <button
                type="button"
                onClick={onToggleMemorized}
                className={
                  'w-full py-4 rounded-2xl text-lg font-bold transition ' +
                  (isMemorized
                    ? 'bg-[color:var(--color-cream-warm)] text-[color:var(--color-ink)] border-2 border-[color:var(--color-cream-deep)]'
                    : 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)]')
                }
              >
                {isMemorized ? '↩️ إلغاء العلامة' : '✅ حفظت هذا الاسم'}
              </button>
            </div>
          )}
        </div>

        {/* Footer: prev / next (not for dua group) */}
        {!name.isDua && (
          <div className="border-t border-[color:var(--color-cream-deep)] px-5 sm:px-7 py-3 flex items-center justify-between gap-3 bg-white">
            <button
              type="button"
              onClick={() => onNav?.('prev')}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
            >
              → السابق
            </button>
            <button
              type="button"
              onClick={() => onNav?.('next')}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
            >
              التالي ←
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Facet({ icon, label, text, accent, last }) {
  const color = accent === 'gold' ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)'
  return (
    <div className={'flex gap-3 ' + (last ? '' : 'pb-4 mb-4 border-b border-dashed border-[color:var(--color-cream-deep)]')}>
      <div className="text-xl shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color }}>
          {label}
        </div>
        <div className="text-base leading-relaxed text-[color:var(--color-ink)]">
          {text}
        </div>
      </div>
    </div>
  )
}

// Always-visible hadith card — the opening and closing of the ceremonial "sandwich"
// that wraps every bouquet (and the whole وسيلة). Bigger, bolder, unhidden.
export default function HadithCard({ hadith, label, accent }) {
  const isGold = accent === 'gold'
  return (
    <div className="max-w-3xl mx-auto mb-6 relative overflow-hidden rounded-3xl bg-white border border-[color:var(--color-cream-deep)]">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: isGold ? 'var(--color-gold)' : 'var(--color-teal)' }}
      />
      <div className="p-6 sm:p-8 text-center">
        <div
          className="inline-block text-[11px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
          style={{
            background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
            color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
          }}
        >
          {label}
        </div>
        <p className="font-serif text-xl sm:text-2xl leading-loose text-[color:var(--color-ink)]" dir="rtl">
          «{hadith.text}»
        </p>
        <p className="text-xs text-[color:var(--color-ink-mute)] mt-3">{hadith.source}</p>
      </div>
    </div>
  )
}

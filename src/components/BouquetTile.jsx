import { Link } from 'react-router-dom'

export default function BouquetTile({ bouquet, memorizedCount, total, complete }) {
  const isGold = bouquet.color === 'gold'
  const pct = total > 0 ? Math.round((memorizedCount / total) * 100) : 0
  const started = memorizedCount > 0

  return (
    <Link
      to={`/memorize/${bouquet.id}`}
      className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white border transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      dir="rtl"
    >
      {/* Corner glow */}
      <div
        className="absolute -top-10 -end-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-70"
        style={{ background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
      />

      {/* Crown badge on complete */}
      {complete && (
        <div className="absolute top-4 start-4 text-2xl animate-crown-shimmer" title="مكتملة">
          👑
        </div>
      )}

      <div className="relative">
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
        >
          الباقة
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--color-ink)] mb-4 leading-tight">
          {bouquet.title}
        </h3>

        <div className="flex items-center justify-between text-sm font-bold text-[color:var(--color-ink-soft)] mb-2">
          <span dir="ltr">{memorizedCount} / {total}</span>
          <span dir="ltr">{pct}%</span>
        </div>
        <div className="h-2 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden mb-5">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: isGold
                ? 'linear-gradient(90deg, var(--color-gold-soft), var(--color-gold))'
                : 'linear-gradient(90deg, var(--color-teal-soft), var(--color-teal))',
            }}
          />
        </div>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-transform group-hover:-translate-x-1"
          style={{ background: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
        >
          {complete ? 'مراجعة' : started ? 'متابعة' : 'ابدأ'} ←
        </div>
      </div>
    </Link>
  )
}

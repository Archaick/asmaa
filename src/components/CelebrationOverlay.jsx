import { useEffect } from 'react'

const SPARKLES = 20

export default function CelebrationOverlay({ open, title, subtitle, onClose }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose?.(), 3200)
    return () => clearTimeout(t)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-5 pointer-events-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[color:var(--color-ink)]/45 backdrop-blur-sm" />

      {/* Sparkles fan out from center */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {Array.from({ length: SPARKLES }).map((_, i) => {
          const rot = (360 / SPARKLES) * i
          return (
            <div
              key={i}
              className="absolute animate-sparkle"
              style={{
                '--r': `${rot}deg`,
                animationDelay: `${(i % 5) * 60}ms`,
              }}
            >
              <span className="block text-2xl">✦</span>
            </div>
          )
        })}
      </div>

      {/* Central card */}
      <div className="relative animate-celebrate-pop max-w-md w-full text-center px-8 py-10 rounded-3xl bg-[color:var(--color-cream)] border-2 border-[color:var(--color-gold)] shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center text-5xl animate-crown-shimmer"
             style={{ background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))' }}>
          🌟
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[color:var(--color-ink-soft)] leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-6 text-xs text-[color:var(--color-ink-mute)]">
          اضغط للإغلاق
        </div>
      </div>
    </div>
  )
}

// Full-screen overlay for auth transitions and slow operations.
// Cream background, calligraphic spinner, respectful loading text.

export default function LoadingOverlay({ message, subtext }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[color:var(--color-cream)]/95 backdrop-blur-sm">
      <div className="text-center px-6">
        {/* Spinning gold ring around the logo */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, var(--color-gold), var(--color-cream) 60%, var(--color-gold))',
              animation: 'spin 1.2s linear infinite',
            }}
          />
          <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain p-1" />
          </div>
        </div>

        {message && (
          <div className="font-display text-xl font-bold text-[color:var(--color-ink)] mb-1">
            {message}
          </div>
        )}
        {subtext && (
          <div className="text-sm text-[color:var(--color-ink-soft)]">
            {subtext}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

import { useLang } from '../i18n/LangContext'

const bouquet1 = [
  ['الأول', 'الآخر', 'الظاهر', 'الباطن', 'السميع'],
  ['البصير', 'القدوس', 'السلام', 'المؤمن', 'المهيمن'],
  ['العزيز', 'الجبار', 'المتكبر', 'الخالق', 'البارئ'],
]

export default function ChartMockup() {
  const { t, lang } = useLang()

  return (
    <div className="relative rounded-3xl p-2 bg-white/30 backdrop-blur-xl border border-[color:var(--color-cream-deep)] shadow-2xl animate-swing-float">
      <div className="rounded-2xl overflow-hidden bg-[color:var(--color-cream)] border border-[color:var(--color-cream-deep)]">

        {/* Fake browser chrome */}
        <div className="bg-[color:var(--color-cream-warm)] border-b border-[color:var(--color-cream-deep)] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-md border border-[color:var(--color-cream-deep)]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-gentle-pulse" />
            <span className="text-[10px] text-[color:var(--color-ink-mute)] font-mono">asmaa-allah.app</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 min-h-[420px] relative overflow-hidden" dir="rtl">
          {/* Decorative corner blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[color:var(--color-gold-soft)]/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[color:var(--color-teal-soft)]/40 blur-2xl pointer-events-none" />

          {/* Header row: bouquet title + progress */}
          <div className="relative flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--color-gold)]" />
              <span className="text-sm font-bold text-[color:var(--color-ink)]">
                {t('mock.header')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[color:var(--color-ink-mute)] font-semibold">
                {t('mock.progress')} <span dir="ltr">12 / 99</span>
              </span>
              <div className="w-16 h-1.5 bg-[color:var(--color-cream-deep)] rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-[color:var(--color-gold)]" />
              </div>
            </div>
          </div>

          {/* "أنت الله" divider */}
          <div className="relative text-center mb-4">
            <span className="inline-block px-4 py-1 rounded-full bg-[color:var(--color-gold-soft)]/60 text-[color:var(--color-gold-deep)] font-serif text-sm font-bold">
              أنتَ الله
            </span>
          </div>

          {/* 3 × 5 grid of names */}
          <div className="relative flex flex-col gap-2.5">
            {bouquet1.map((row, ri) => (
              <div key={ri} className="grid grid-cols-5 gap-2">
                {row.map((name, ci) => {
                  const isTarget = ri === 1 && ci === 2 // "السلام"
                  return (
                    <div
                      key={ci}
                      className={
                        'relative flex items-center justify-center py-2.5 rounded-lg border font-serif text-sm sm:text-base font-bold ' +
                        (isTarget
                          ? 'border-[color:var(--color-gold)] animate-name-unlock'
                          : 'border-[color:var(--color-cream-deep)] bg-white/60 text-[color:var(--color-ink)]')
                      }
                    >
                      {name}
                      {isTarget && (
                        <svg
                          className="absolute -bottom-3 -left-3 w-6 h-6 text-[color:var(--color-ink)] animate-tap-cursor drop-shadow-md z-10 pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style={{ transform: 'scaleX(-1)' }}
                        >
                          <path stroke="white" strokeWidth="1" d="M4 2v18l5.5-5.5 4.5 9.5 2-1-4.5-9.5H19L4 2z" />
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer: dua sandwich hint */}
          <div className="relative mt-5 pt-4 border-t border-dashed border-[color:var(--color-cream-deep)] flex items-center justify-between text-[11px]">
            <span className="text-[color:var(--color-teal-deep)] font-semibold">
              ⋯ حديث ابن مسعود
            </span>
            <span className="text-[color:var(--color-ink-mute)] font-mono" dir="ltr">
              15 / bouquet
            </span>
            <span className="text-[color:var(--color-teal-deep)] font-semibold">
              حديث أنس ⋯
            </span>
          </div>
        </div>
      </div>

      {/* Floating success popup */}
      <div
        className="absolute z-30 -bottom-5 left-4 sm:left-8 bg-white rounded-2xl shadow-2xl border border-[color:var(--color-cream-deep)] px-4 py-3 flex items-center gap-3 animate-bounce"
        style={{ animationDuration: '3s' }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-inner"
          style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))' }}
        >
          ✨
        </div>
        <div>
          <div className="text-sm font-bold text-[color:var(--color-ink)] leading-tight">{t('mock.popup.title')}</div>
          <div className="text-[11px] text-[color:var(--color-ink-mute)] font-mono uppercase tracking-wider">{t('mock.popup.desc')}</div>
        </div>
      </div>
    </div>
  )
}

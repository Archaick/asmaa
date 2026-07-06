import { useLang } from '../i18n/LangContext'

const cards = [
  { key: 'c1', href: '#memorize', icon: '📖', accent: 'gold' },
  { key: 'c2', href: '#academy', icon: '🎓', accent: 'teal' },
  { key: 'c3', href: '#library', icon: '📚', accent: 'gold' },
  { key: 'c4', href: '#support', icon: '🤝', accent: 'teal' },
]

export default function CTAGrid() {
  const { t } = useLang()
  return (
    <section className="py-20 sm:py-28 bg-[color:var(--color-cream-warm)] border-t border-[color:var(--color-cream-deep)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[color:var(--color-ink)] mb-3">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-[color:var(--color-ink-soft)]">
            {t('cta.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => {
            const gold = c.accent === 'gold'
            return (
              <a
                key={c.key}
                href={c.href}
                className="group relative p-7 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{
                    background: gold
                      ? 'var(--color-gold-soft)'
                      : 'var(--color-teal-soft)',
                  }}
                >
                  {c.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-[color:var(--color-ink)] mb-2">
                  {t(`cta.${c.key}.title`)}
                </h3>
                <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-soft)] mb-5 flex-1">
                  {t(`cta.${c.key}.desc`)}
                </p>
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all"
                  style={{ color: gold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
                >
                  {t(`cta.${c.key}.action`)}
                  <span>←</span>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

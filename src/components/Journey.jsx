import { useLang } from '../i18n/LangContext'

const stages = [
  { key: 's1', num: '١', numEn: '1', accent: 'gold' },
  { key: 's2', num: '٢', numEn: '2', accent: 'gold' },
  { key: 's3', num: '٣', numEn: '3', accent: 'teal' },
  { key: 's4', num: '٤', numEn: '4', accent: 'teal' },
]

export default function Journey() {
  const { t, lang } = useLang()

  return (
    <section id="method" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="inline-block text-[13px] font-bold uppercase tracking-widest text-[color:var(--color-teal-deep)] mb-4">
            {t('journey.eyebrow')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[color:var(--color-ink)] mb-4">
            {t('journey.title')}
          </h2>
          <p className="text-lg text-[color:var(--color-ink-soft)] leading-relaxed">
            {t('journey.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stages.map((s) => {
            const gold = s.accent === 'gold'
            return (
              <div
                key={s.key}
                className="group relative p-6 rounded-2xl bg-white border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:-translate-y-1 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-2xl font-bold mb-5"
                  style={{
                    background: gold
                      ? 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))'
                      : 'linear-gradient(135deg, var(--color-teal-soft), var(--color-teal))',
                    color: 'var(--color-ink)',
                  }}
                >
                  {lang === 'ar' ? s.num : s.numEn}
                </div>
                <h3 className="font-display text-2xl font-bold text-[color:var(--color-ink)] mb-2">
                  {t(`journey.${s.key}.title`)}
                </h3>
                <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-soft)]">
                  {t(`journey.${s.key}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

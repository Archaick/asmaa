import { useLang } from '../i18n/LangContext'
import { useInView } from '../hooks/useInView'

const cards = [
  { key: 'c1', href: '/login',    icon: '📖', accent: 'gold' },
  { key: 'c2', href: '/login',    icon: '🎓', accent: 'teal' },
  { key: 'c3', href: '#library',  icon: '📚', accent: 'gold' },
  { key: 'c4', href: '#support',  icon: '🤝', accent: 'teal' },
]

export default function CTAGrid() {
  const { t, lang } = useLang()
  const [ref, inView] = useInView({ threshold: 0.1 })

  const hero = cards[0]
  const rest = cards.slice(1)

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 bg-[color:var(--color-cream-warm)] border-t border-[color:var(--color-cream-deep)]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className={'text-center mb-12 ' + (inView ? 'reveal-shown' : 'reveal-hidden')}>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[color:var(--color-ink)] mb-3">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-[color:var(--color-ink-soft)]">
            {t('cta.subtitle')}
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-3 gap-4 sm:gap-5 lg:h-[520px]">
          {/* Big hero card */}
          <HeroCard
            card={hero}
            t={t}
            lang={lang}
            inView={inView}
            delay={0}
          />

          {/* 3 smaller cards */}
          {rest.map((c, i) => (
            <SmallCard
              key={c.key}
              card={c}
              t={t}
              lang={lang}
              inView={inView}
              delay={(i + 1) * 140}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CardShell({ card, children, delay, inView, big }) {
  const gold = card.accent === 'gold'
  return (
    <a
      href={card.href}
      className={
        'group relative overflow-hidden rounded-3xl bg-white border border-[color:var(--color-cream-deep)] transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-xl flex ' +
        (big
          ? 'lg:col-span-2 lg:row-span-3 flex-col justify-between p-8 sm:p-10 '
          : 'flex-row lg:flex-row items-center gap-4 p-5 sm:p-6 ') +
        (inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Shimmer sweep on hover */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-y-0 w-1/3 opacity-0 group-hover:opacity-100 group-hover:animate-border-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent, ' + (gold ? 'rgba(230,212,166,0.55)' : 'rgba(185,212,216,0.55)') + ', transparent)',
          }}
        />
      </div>

      {/* Accent corner glow */}
      <div
        className="absolute -top-16 -end-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-60"
        style={{
          background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
        }}
      />
      {children}
    </a>
  )
}

function HeroCard({ card, t, lang, inView, delay }) {
  const gold = card.accent === 'gold'
  return (
    <CardShell card={card} delay={delay} inView={inView} big>
      <div className="relative">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl mb-8 shadow-inner animate-icon-float"
          style={{ background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
        >
          {card.icon}
        </div>
        <h3 className="font-display text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-4 leading-tight">
          {t(`cta.${card.key}.title`)}
        </h3>
        <p className="text-lg leading-relaxed text-[color:var(--color-ink-soft)] max-w-md">
          {t(`cta.${card.key}.desc`)}
        </p>
      </div>

      <div className="relative flex items-center gap-3 mt-8">
        <span
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-base font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] group-hover:bg-[color:var(--color-teal-deep)] transition-all"
        >
          {t(`cta.${card.key}.action`)}
          <span className="transition-transform group-hover:-translate-x-1">
            {lang === 'ar' ? '←' : '→'}
          </span>
        </span>
      </div>
    </CardShell>
  )
}

function SmallCard({ card, t, lang, inView, delay }) {
  const gold = card.accent === 'gold'
  return (
    <CardShell card={card} delay={delay} inView={inView}>
      <div
        className="relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl animate-icon-float"
        style={{
          background: gold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
          animationDelay: `${delay + 300}ms`,
        }}
      >
        {card.icon}
      </div>
      <div className="relative flex-1 min-w-0">
        <h3 className="font-display text-lg font-bold text-[color:var(--color-ink)] mb-1 leading-tight">
          {t(`cta.${card.key}.title`)}
        </h3>
        <p className="text-[13px] leading-relaxed text-[color:var(--color-ink-soft)] line-clamp-2">
          {t(`cta.${card.key}.desc`)}
        </p>
      </div>
      <div
        className="relative shrink-0 text-2xl font-bold transition-all group-hover:-translate-x-1"
        style={{ color: gold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}
      >
        {lang === 'ar' ? '←' : '→'}
      </div>
    </CardShell>
  )
}

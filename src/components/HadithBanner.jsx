import { useLang } from '../i18n/LangContext'
import { useInView } from '../hooks/useInView'

export default function HadithBanner() {
  const { t, lang } = useLang()
  const [ref, inView] = useInView({ threshold: 0.3 })
  const text = t('hadith.text')
  const words = text.split(/\s+/)

  return (
    <section
      ref={ref}
      className="relative border-y border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]"
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-gold-soft)] mb-5">
          <span className="text-2xl">۞</span>
        </div>

        <p
          className={
            'text-2xl sm:text-3xl lg:text-4xl leading-relaxed font-bold text-[color:var(--color-ink)] mb-4 ' +
            (lang === 'ar' ? 'font-serif' : 'font-display')
          }
          aria-label={text}
        >
          <span aria-hidden="true">«</span>
          {words.map((w, i) => (
            <span
              key={i}
              className={'reveal-word ' + (inView ? 'shown' : '')}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
          <span aria-hidden="true">»</span>
        </p>

        <p className={'text-sm sm:text-base text-[color:var(--color-ink-mute)] transition-opacity duration-700 ' + (inView ? 'opacity-100' : 'opacity-0')}
           style={{ transitionDelay: `${words.length * 90 + 200}ms` }}>
          {t('hadith.source')}
        </p>
      </div>
    </section>
  )
}

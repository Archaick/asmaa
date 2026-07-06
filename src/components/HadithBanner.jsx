import { useLang } from '../i18n/LangContext'

export default function HadithBanner() {
  const { t, lang } = useLang()
  return (
    <section className="relative border-y border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-gold-soft)] mb-5">
          <span className="text-2xl">۞</span>
        </div>
        <p
          className={
            'text-2xl sm:text-3xl lg:text-4xl leading-relaxed font-bold text-[color:var(--color-ink)] mb-4 ' +
            (lang === 'ar' ? 'font-serif' : 'font-display')
          }
        >
          «{t('hadith.text')}»
        </p>
        <p className="text-sm sm:text-base text-[color:var(--color-ink-mute)]">
          {t('hadith.source')}
        </p>
      </div>
    </section>
  )
}

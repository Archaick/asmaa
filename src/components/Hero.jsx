import { useState } from 'react'
import { useLang } from '../i18n/LangContext'
import ChartMockup from './ChartMockup'
import TrialTourModal from './TrialTourModal'

export default function Hero() {
  const { t } = useLang()
  const [tourOpen, setTourOpen] = useState(false)

  const openTour = () => setTourOpen(true)

  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
           style={{
             backgroundImage:
               'radial-gradient(circle at 1px 1px, var(--color-ink) 1px, transparent 0)',
             backgroundSize: '28px 28px',
           }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-24 sm:pt-20 sm:pb-32 grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
        {/* Left: copy */}
        <div className="animate-fade-in-up">
          <span className="inline-block text-[13px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-5">
            {t('hero.eyebrow')}
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-[color:var(--color-ink)] mb-6">
            {t('hero.title')}
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink-soft)] mb-8 max-w-xl">
            {t('hero.subtitle')}
          </p>

          {/* 4-stage progression pill — highlight cycles through each stage */}
          <div className="inline-flex items-center gap-0.5 sm:gap-1 mb-9 px-3 py-1.5 rounded-full bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)] text-xs sm:text-sm font-bold">
            <span
              className="stage-gold px-2.5 sm:px-3 py-1 rounded-full"
              style={{ animationDelay: '0s' }}
            >
              {t('journey.s1.title')}
            </span>
            <span className="stage-arrow text-[color:var(--color-ink-mute)]" style={{ animationDelay: '0.25s' }}>←</span>
            <span
              className="stage-gold px-2.5 sm:px-3 py-1 rounded-full"
              style={{ animationDelay: '1.5s' }}
            >
              {t('journey.s2.title')}
            </span>
            <span className="stage-arrow text-[color:var(--color-ink-mute)]" style={{ animationDelay: '1.75s' }}>←</span>
            <span
              className="stage-teal px-2.5 sm:px-3 py-1 rounded-full"
              style={{ animationDelay: '3s' }}
            >
              {t('journey.s3.title')}
            </span>
            <span className="stage-arrow text-[color:var(--color-ink-mute)]" style={{ animationDelay: '3.25s' }}>←</span>
            <span
              className="stage-teal px-2.5 sm:px-3 py-1 rounded-full"
              style={{ animationDelay: '4.5s' }}
            >
              {t('journey.s4.title')}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#memorize"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-lg font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition shadow-lg hover:-translate-y-0.5"
            >
              {t('hero.cta.primary')}
              <span>←</span>
            </a>
            <button
              type="button"
              onClick={openTour}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-lg font-semibold bg-transparent border-2 border-[color:var(--color-gold)] text-[color:var(--color-gold-deep)] hover:bg-[color:var(--color-gold-soft)]/50 transition"
            >
              {t('hero.cta.secondary')}
            </button>
          </div>
        </div>

        {/* Right: mockup */}
        <div className="relative animate-fade-in-up [animation-delay:150ms]">
          <ChartMockup />

          {/* Mobile-only CTA under the mockup */}
          <div className="mt-12 lg:hidden flex justify-center">
            <button
              type="button"
              onClick={openTour}
              className="w-full max-w-sm inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full text-xl font-bold bg-[color:var(--color-gold)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-gold-deep)] hover:text-[color:var(--color-cream)] transition shadow-xl"
            >
              <span className="text-2xl">✨</span>
              {t('tour.mobile_cta')}
            </button>
          </div>
        </div>
      </div>

      <TrialTourModal open={tourOpen} onClose={() => setTourOpen(false)} />
    </section>
  )
}

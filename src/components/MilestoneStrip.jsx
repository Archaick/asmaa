import { useLang } from '../i18n/LangContext'

export default function MilestoneStrip({ milestones, streak }) {
  const { t } = useLang()
  return (
    <section className="mt-8 p-5 sm:p-6 rounded-3xl bg-white border border-[color:var(--color-cream-deep)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-0.5">
            {t('student.nav.journey')}
          </div>
          <h3 className="font-display text-lg font-bold text-[color:var(--color-ink)]">
            🏆 {t('achievements.title')}
          </h3>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--color-gold-soft)]">
            <span className="text-lg">🌙</span>
            <span className="text-sm font-bold text-[color:var(--color-ink)]" dir="ltr">
              {streak} {t('achievements.stat.streak_unit')}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {milestones.map((m) => (
          <div
            key={m.id}
            title={t(`milestone.${m.id}.desc`)}
            className={
              'flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ' +
              (m.unlocked
                ? 'bg-[color:var(--color-gold-soft)]/50 border-[color:var(--color-gold)] hover:-translate-y-0.5'
                : 'bg-[color:var(--color-cream-warm)] border-[color:var(--color-cream-deep)] opacity-55 grayscale')
            }
          >
            <span className={'text-2xl sm:text-3xl ' + (m.unlocked ? 'animate-crown-shimmer' : '')}>
              {m.icon}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-center text-[color:var(--color-ink)] leading-tight">
              {t(`milestone.${m.id}.label`)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

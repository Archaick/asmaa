import { useMemo, useState } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { useMilestones } from '../../hooks/useMilestones'
import { useLang } from '../../i18n/LangContext'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH } from '../../data/bouquets'
import NameSheet from '../../components/NameSheet'
import { GoldDivider } from '../../components/Ornament'
import BouquetTile from '../../components/BouquetTile'
import StudentLayout from '../../components/layout/StudentLayout'
import { playChime } from '../../utils/chime'

export default function MemorizeOverview() {
  const { memorized, memorizedCount, entries, markMemorized, unmarkMemorized } = useProgress()
  const { byBouquet, findName } = useNames()
  const { bouquetCompletion } = useMilestones(entries, memorized, memorizedCount)
  const { t } = useLang()
  const [openId, setOpenId] = useState(null)

  const openName = useMemo(() => findName(openId), [findName, openId])
  const isMemorized = openName ? memorized.has(openName.id) : false

  const toggleMem = async () => {
    if (!openName) return
    if (isMemorized) {
      await unmarkMemorized(openName.id)
    } else {
      playChime()
      await markMemorized(openName.id)
    }
  }

  const nav = (dir) => {
    if (!openName) return
    const realNames = BOUQUETS.filter((b) => !b.isDua).flatMap((b) => byBouquet[b.id] || [])
    const idx = realNames.findIndex((n) => n.id === openName.id)
    if (idx < 0) return
    const next = dir === 'next' ? idx + 1 : idx - 1
    setOpenId(realNames[(next + realNames.length) % realNames.length].id)
  }

  return (
    <StudentLayout showProgress>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Opening hadith — always visible, prominent */}
        <FullHadith
          hadith={OPENING_HADITH} label={t('memorize.hadith.opening_label')}
          accent="gold"
        />

        {/* Famous 5 names */}
        <NamePillsSection
          title={t('memorize.section.famous')}
          names={byBouquet.famous || []}
          memorized={memorized} onOpen={setOpenId}
          variant="famous" accent="gold"
        />

        <GoldDivider />

        <div className="text-center mb-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--color-gold-deep)] mb-1">
            {t('memorize.chart_eyebrow')}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)]">
            {t('memorize.section.bouquets_title')}
          </h2>
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">
            {t('memorize.section.bouquets_hint')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {BOUQUETS.slice(1, 7).map((b) => {
            const names = byBouquet[b.id] || []
            const done = names.filter((n) => memorized.has(n.id)).length
            return (
              <BouquetTile
                key={b.id}
                bouquet={b}
                memorizedCount={done}
                total={names.length}
                complete={!!bouquetCompletion[b.id]}
              />
            )
          })}
        </div>

        <GoldDivider />

        <NamePillsSection
          title={t('memorize.section.khitam')}
          names={byBouquet.khitam || []}
          memorized={memorized} onOpen={setOpenId}
          variant="row" accent="teal"
        />

        <NamePillsSection
          title={t('memorize.section.duaa')}
          names={byBouquet.duaa || []}
          memorized={memorized} onOpen={setOpenId}
          variant="dua" accent="gold" isDua
        />

        <GoldDivider />

        <FullHadith
          hadith={CLOSING_HADITH} label={t('memorize.hadith.closing_label')}
          accent="teal"
        />
      </div>

      <NameSheet
        name={openName}
        isMemorized={isMemorized}
        onClose={() => setOpenId(null)}
        onToggleMemorized={toggleMem}
        onNav={nav}
      />
    </StudentLayout>
  )
}

function FullHadith({ hadith, label, accent }) {
  const isGold = accent === 'gold'
  return (
    <div className="max-w-3xl mx-auto mb-6 relative overflow-hidden rounded-3xl bg-white border border-[color:var(--color-cream-deep)]">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: isGold ? 'var(--color-gold)' : 'var(--color-teal)' }}
      />
      <div className="p-6 sm:p-8 text-center">
        <div
          className="inline-block text-[11px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
          style={{
            background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
            color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
          }}
        >
          {label}
        </div>
        <p className="font-serif text-xl sm:text-2xl leading-loose text-[color:var(--color-ink)]" dir="rtl">
          «{hadith.text}»
        </p>
        <p className="text-xs text-[color:var(--color-ink-mute)] mt-3">{hadith.source}</p>
      </div>
    </div>
  )
}

function NamePillsSection({ title, names, memorized, onOpen, variant, accent, isDua }) {
  const isGold = accent === 'gold'
  const memInSection = names.filter((n) => !n.isDua && memorized.has(n.id)).length
  const realCount = names.filter((n) => !n.isDua).length
  const gridClass =
    variant === 'dua'    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' :
    variant === 'famous' ? 'grid grid-cols-5 gap-2' :
    variant === 'row'    ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-5 gap-1.5'
  return (
    <section className="mt-6 p-4 sm:p-5 rounded-2xl bg-white border border-[color:var(--color-cream-deep)]" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm sm:text-base text-[color:var(--color-ink)]">{title}</h3>
        {!isDua && realCount > 0 && (
          <span className="text-xs font-bold text-[color:var(--color-ink-soft)]" dir="ltr">
            {memInSection}/{realCount}
          </span>
        )}
      </div>
      <div className={gridClass}>
        {names.map((n) => {
          const isMem = memorized.has(n.id)
          return (
            <button
              key={n.id} type="button" onClick={() => onOpen(n.id)}
              className={
                'relative rounded-lg font-serif font-bold text-center transition-all border-2 ' +
                (variant === 'dua' ? 'text-sm px-3 py-3' : 'text-sm sm:text-base py-2.5 sm:py-3') + ' ' +
                (isMem
                  ? (isGold
                      ? 'bg-[color:var(--color-gold-soft)] border-[color:var(--color-gold)] text-[color:var(--color-ink)]'
                      : 'bg-[color:var(--color-teal-soft)] border-[color:var(--color-teal)] text-[color:var(--color-ink)]')
                  : 'bg-white border-[color:var(--color-cream-deep)] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:-translate-y-0.5')
              }
            >
              {n.name}
              {isMem && <span className="absolute top-0.5 end-1 text-[10px]">✓</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

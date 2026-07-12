import { useMemo, useState } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useNames } from '../../hooks/useNames'
import { useMilestones } from '../../hooks/useMilestones'
import { useLang } from '../../i18n/LangContext'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH } from '../../data/bouquets'
import NameSheet from '../../components/NameSheet'
import { GoldDivider } from '../../components/Ornament'
import BouquetTile from '../../components/BouquetTile'
import HadithCard from '../../components/HadithCard'
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

  // Every entry-to-a-bouquet is a full session (opening hadith → names → closing → celebration).
  // Only دعائية stays inline — it's dua phrases, not a bouquet to memorize.
  const famous = BOUQUETS.find((b) => b.id === 'famous')
  const khitam = BOUQUETS.find((b) => b.id === 'khitam')

  return (
    <StudentLayout showProgress>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Opening hadith — always visible, prominent */}
        <HadithCard hadith={OPENING_HADITH} label={t('memorize.hadith.opening_label')} accent="gold" />

        {/* الأسماء المشهورة — its own session, like every bouquet */}
        {famous && (
          <div className="mb-4">
            <BouquetTile
              bouquet={famous}
              memorizedCount={(byBouquet.famous || []).filter((n) => memorized.has(n.id)).length}
              total={(byBouquet.famous || []).length}
              complete={!!bouquetCompletion.famous}
            />
          </div>
        )}

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

        {/* أسماء الختام — its own session */}
        {khitam && (
          <div className="mb-4">
            <BouquetTile
              bouquet={khitam}
              memorizedCount={(byBouquet.khitam || []).filter((n) => memorized.has(n.id)).length}
              total={(byBouquet.khitam || []).length}
              complete={!!bouquetCompletion.khitam}
            />
          </div>
        )}

        {/* الأدعية الجامعة — 4 dua phrases (stays inline, not a memorization session) */}
        <NamePillsSection
          title={t('memorize.section.duaa')}
          names={byBouquet.duaa || []}
          memorized={memorized}
          onOpen={setOpenId}
        />

        <GoldDivider />

        <HadithCard hadith={CLOSING_HADITH} label={t('memorize.hadith.closing_label')} accent="teal" />
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

// Dua phrases only — they're a vocative supplement to the 99 Names, not a
// memorization bouquet, so they stay inline on the overview rather than
// opening a full ceremonial session.
function NamePillsSection({ title, names, memorized, onOpen }) {
  return (
    <section className="mt-6 rounded-2xl bg-white border border-[color:var(--color-cream-deep)]" dir="rtl">
      <div className="p-4 sm:p-5">
        <h3 className="font-display font-bold text-sm sm:text-base text-[color:var(--color-ink)] mb-3">
          {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {names.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onOpen(n.id)}
              className="relative rounded-xl font-serif font-bold text-center text-sm px-3 py-3 border-2 border-[color:var(--color-cream-deep)] bg-white text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:-translate-y-0.5 hover:shadow-sm transition-all"
            >
              {n.name}
              {memorized.has(n.id) && <span className="absolute top-1 end-1.5 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

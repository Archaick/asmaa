import { useEffect } from 'react'
import { useLang } from '../i18n/LangContext'
import { useNames } from '../hooks/useNames'
import { BOUQUETS, OPENING_HADITH, CLOSING_HADITH } from '../data/bouquets'

// الوسيلة كاملة — one continuous, read-only review of the whole chart:
// opening hadith → famous 5 → the six bouquets in sequence → khitam →
// the dua phrases → closing hadith. No extras, no per-name popups —
// exactly the paper وسيلة, for whoever wants a full uninterrupted review.
export default function FullWaseelaModal({ open, onClose, onOpenTour }) {
  const { t } = useLang()
  const { byBouquet } = useNames()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const middle = BOUQUETS.slice(1, 7)
  const famous = BOUQUETS.find((b) => b.id === 'famous')
  const khitam = BOUQUETS.find((b) => b.id === 'khitam')
  const duaa   = BOUQUETS.find((b) => b.id === 'duaa')

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-[color:var(--color-ink)]/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92dvh] bg-[color:var(--color-cream)] sm:rounded-3xl shadow-2xl border border-[color:var(--color-cream-deep)] flex flex-col overflow-hidden animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          <div>
            <div className="font-display font-bold text-lg text-[color:var(--color-ink)]">
              {t('waseela.full.title')}
            </div>
            <div className="text-[11px] text-[color:var(--color-ink-mute)]">
              {t('waseela.full.hint')}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/70 transition flex items-center justify-center text-[color:var(--color-ink-soft)]"
            aria-label={t('tour.close')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Continuous chart */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-6" dir="rtl">
          <HadithBlock label={t('memorize.hadith.opening_label')} text={OPENING_HADITH.text} source={OPENING_HADITH.source} accent="gold" />

          {famous && <NameGrid bouquet={famous} names={byBouquet.famous || []} />}

          {middle.map((b) => (
            <div key={b.id}>
              <div className="text-center mt-5 mb-2">
                <span
                  className="inline-block px-3 py-0.5 rounded-full text-xs font-serif font-bold"
                  style={{
                    background: b.color === 'gold' ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
                    color: b.color === 'gold' ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
                  }}
                >
                  {t('bouquet.divider.you_allah')}
                </span>
              </div>
              <NameGrid bouquet={b} names={byBouquet[b.id] || []} />
            </div>
          ))}

          {khitam && <NameGrid bouquet={khitam} names={byBouquet.khitam || []} />}
          {duaa   && <NameGrid bouquet={duaa}   names={byBouquet.duaa || []} />}

          <HadithBlock label={t('memorize.hadith.closing_label')} text={CLOSING_HADITH.text} source={CLOSING_HADITH.source} accent="teal" />
        </div>

        {/* Footer — the guided tour stays one tap away */}
        {onOpenTour && (
          <div className="border-t border-[color:var(--color-cream-deep)] px-5 sm:px-7 py-3 bg-white flex justify-center">
            <button
              type="button"
              onClick={onOpenTour}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border-2 border-[color:var(--color-gold)] text-[color:var(--color-gold-deep)] hover:bg-[color:var(--color-gold-soft)]/50 transition"
            >
              ✨ {t('waseela.full.tour_cta')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function HadithBlock({ label, text, source, accent }) {
  const isGold = accent === 'gold'
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[color:var(--color-cream-deep)] mb-4">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: isGold ? 'var(--color-gold)' : 'var(--color-teal)' }} />
      <div className="p-4 sm:p-5 text-center">
        <div
          className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-2.5 py-0.5 rounded-full"
          style={{
            background: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)',
            color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)',
          }}
        >
          {label}
        </div>
        <p className="font-serif text-sm sm:text-base leading-relaxed text-[color:var(--color-ink)]">«{text}»</p>
        <p className="text-[10px] text-[color:var(--color-ink-mute)] mt-1.5">{source}</p>
      </div>
    </div>
  )
}

// Read-only bouquet block — always 5 per row (the method's geometry),
// 4 for khitam, 2 for the dua phrases.
function NameGrid({ bouquet, names }) {
  const isGold = bouquet.color === 'gold'
  const cols =
    bouquet.isDua ? 'grid-cols-1 sm:grid-cols-2' :
    bouquet.id === 'khitam' ? 'grid-cols-4' : 'grid-cols-5'

  return (
    <section className="mb-4">
      <div className="text-center mb-1.5">
        <span className="text-xs font-display font-bold" style={{ color: isGold ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)' }}>
          {bouquet.title}
        </span>
      </div>
      <div className={`grid ${cols} gap-1 sm:gap-1.5`}>
        {names.map((n) => (
          <div
            key={n.id}
            className="min-w-0 rounded-lg sm:rounded-xl border text-center font-serif font-bold text-[12px] sm:text-base leading-tight py-2.5 sm:py-3.5 px-0.5 bg-white"
            style={{ borderColor: isGold ? 'var(--color-gold-soft)' : 'var(--color-teal-soft)' }}
          >
            {n.name}
          </div>
        ))}
      </div>
    </section>
  )
}

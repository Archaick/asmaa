import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'

const famousNames = [
  {
    id: 'allah',
    name: 'الله',
    meaning: { ar: 'لفظ الجلالة الأعظم، المسمّى بجميع أسمائه الحسنى وصفاته العلى.', en: 'The Supreme Name — the One called by every beautiful name and lofty attribute.' },
    thanaa:  { ar: 'سبحان الله وبحمده، سبحان الله العظيم.', en: 'Glory be to Allah and praise Him, glory be to Allah the Almighty.' },
    talab:   { ar: 'اللهم لك الحمد كله، ولك الملك كله، وإليك يرجع الأمر كله.', en: 'O Allah, all praise is Yours, all sovereignty is Yours, and to You all matters return.' },
  },
  {
    id: 'rahman',
    name: 'الرَّحمن',
    meaning: { ar: 'ذو الرحمة الواسعة التي وسعت كل شيء.', en: 'The Most Merciful — whose mercy encompasses everything.' },
    thanaa:  { ar: 'سبحان الرحمن الذي وسعت رحمته كل شيء.', en: 'Glory be to Ar-Rahman, whose mercy encompasses all things.' },
    talab:   { ar: 'يا رحمن، ارحمني برحمتك التي وسعت كل شيء.', en: 'O Ar-Rahman, have mercy on me by Your mercy which encompasses all things.' },
  },
  {
    id: 'raheem',
    name: 'الرَّحيم',
    meaning: { ar: 'العطوف على عباده المؤمنين برحمة خاصة.', en: 'The Especially Merciful — bestowing special mercy on His believing servants.' },
    thanaa:  { ar: 'سبحان الرحيم، أرحم الراحمين.', en: 'Glory be to Ar-Raheem, the Most Merciful of the merciful.' },
    talab:   { ar: 'يا رحيم، ارحمني واغفر لي وتولّني برحمتك.', en: 'O Ar-Raheem, have mercy on me, forgive me, and take charge of me by Your mercy.' },
  },
  {
    id: 'hayy',
    name: 'الحيّ',
    meaning: { ar: 'ذو الحياة الكاملة الأبدية التي لا تسبقها عدم ولا يلحقها فناء.', en: 'The Ever-Living — with perfect eternal life, preceded by no non-existence and followed by no perishing.' },
    thanaa:  { ar: 'سبحان الحيّ الذي لا يموت.', en: 'Glory be to Al-Hayy — the Living who does not die.' },
    talab:   { ar: 'يا حيّ يا قيّوم برحمتك أستغيث، أصلح لي شأني كلّه.', en: 'O Al-Hayy, O Al-Qayyum, by Your mercy I seek help — set right all my affairs.' },
  },
  {
    id: 'qayyum',
    name: 'القيّوم',
    meaning: { ar: 'القائم بنفسه، المقيم لغيره — قامت به كل الموجودات.', en: 'The Self-Subsisting Sustainer — established in Himself, sustaining all that exists.' },
    thanaa:  { ar: 'سبحان القيّوم الذي قامت به السماوات والأرض.', en: 'Glory be to Al-Qayyum by whom the heavens and earth stand.' },
    talab:   { ar: 'يا قيّوم، اكفني بحفظك، وتولَّ أمري في يومي كلّه.', en: 'O Al-Qayyum, suffice me by Your protection, and take charge of my day.' },
  },
]

export default function TrialTourModal({ open, onClose }) {
  const { t, lang } = useLang()
  const [step, setStep] = useState(0)
  const [selectedName, setSelectedName] = useState(null)

  useEffect(() => {
    if (open) {
      setStep(0)
      setSelectedName(null)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const total = 3
  const stepNum = (lang === 'ar' ? ['١','٢','٣'] : ['1','2','3'])[step]
  const totalNum = (lang === 'ar' ? '٣' : '3')

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[color:var(--color-ink)]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] bg-[color:var(--color-cream)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[color:var(--color-cream-deep)] flex flex-col overflow-hidden animate-fade-in-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream-warm)]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[color:var(--color-gold-soft)] text-[color:var(--color-gold-deep)]">
              {stepNum} {t('tour.step')} {totalNum}
            </span>
            <span className="text-sm font-bold text-[color:var(--color-ink-soft)]">
              {t(`tour.s${step + 1}.badge`)}
            </span>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
          {step === 0 && <StepOpening t={t} lang={lang} />}
          {step === 1 && (
            <StepNames
              t={t}
              lang={lang}
              names={famousNames}
              selectedName={selectedName}
              setSelectedName={setSelectedName}
            />
          )}
          {step === 2 && <StepClosing t={t} lang={lang} onClose={onClose} />}
        </div>

        {/* Footer */}
        <div className="border-t border-[color:var(--color-cream-deep)] px-5 sm:px-7 py-4 flex items-center justify-between gap-3 bg-white">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={
                  'w-2 h-2 rounded-full transition ' +
                  (i === step
                    ? 'bg-[color:var(--color-gold)] w-6'
                    : i < step
                      ? 'bg-[color:var(--color-gold-soft)]'
                      : 'bg-[color:var(--color-cream-deep)]')
                }
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] text-[color:var(--color-ink-soft)] transition"
              >
                {t('tour.back')}
              </button>
            )}
            {step < total - 1 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition"
              >
                {t('tour.next')} {lang === 'ar' ? '←' : '→'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepOpening({ t, lang }) {
  return (
    <div className="text-center animate-fade-in-up">
      <div className="text-3xl mb-3">🌒</div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-3">
        {t('tour.s1.title')}
      </h3>
      <p className="text-[color:var(--color-ink-soft)] leading-relaxed mb-6 max-w-md mx-auto">
        {t('tour.s1.desc')}
      </p>
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[color:var(--color-gold-soft)] shadow-sm" dir="rtl">
        <p className={(lang === 'ar' ? 'font-serif' : 'font-serif') + ' text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink)]'}>
          «{t('tour.s1.hadith')}»
        </p>
      </div>
    </div>
  )
}

function StepNames({ t, lang, names, selectedName, setSelectedName }) {
  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-5">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-2">
          {t('tour.s2.title')}
        </h3>
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          {t('tour.s2.desc')}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-5" dir="rtl">
        {names.map((n) => {
          const active = selectedName?.id === n.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedName(n)}
              className={
                'py-3 sm:py-4 rounded-xl border-2 font-serif text-sm sm:text-base font-bold transition-all ' +
                (active
                  ? 'border-[color:var(--color-gold)] bg-[color:var(--color-gold-soft)] scale-105 shadow-md'
                  : 'border-[color:var(--color-cream-deep)] bg-white hover:border-[color:var(--color-gold)] hover:-translate-y-0.5')
              }
            >
              {n.name}
            </button>
          )
        })}
      </div>

      {!selectedName ? (
        <div className="text-center py-8 rounded-2xl bg-[color:var(--color-cream-warm)] border border-dashed border-[color:var(--color-cream-deep)]">
          <div className="text-2xl mb-2">👆</div>
          <p className="text-sm font-semibold text-[color:var(--color-ink-mute)]">
            {t('tour.s2.hint')}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[color:var(--color-gold-soft)] p-5 shadow-sm animate-fade-in-up" dir="rtl">
          <h4 className="font-serif text-3xl font-bold text-center text-[color:var(--color-ink)] mb-4">
            {selectedName.name}
          </h4>

          <NameFacet
            icon="💡"
            label={t('tour.s2.meaning')}
            text={selectedName.meaning[lang] || selectedName.meaning.ar}
            accent="gold"
          />
          <NameFacet
            icon="🌟"
            label={t('tour.s2.thanaa')}
            text={selectedName.thanaa[lang] || selectedName.thanaa.ar}
            accent="teal"
          />
          <NameFacet
            icon="🤲"
            label={t('tour.s2.talab')}
            text={selectedName.talab[lang] || selectedName.talab.ar}
            accent="gold"
            last
          />
        </div>
      )}
    </div>
  )
}

function NameFacet({ icon, label, text, accent, last }) {
  const color = accent === 'gold' ? 'var(--color-gold-deep)' : 'var(--color-teal-deep)'
  return (
    <div className={'flex gap-3 ' + (last ? '' : 'pb-3 mb-3 border-b border-dashed border-[color:var(--color-cream-deep)]')}>
      <div className="text-xl shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
          {label}
        </div>
        <div className="text-[15px] leading-relaxed text-[color:var(--color-ink)]">
          {text}
        </div>
      </div>
    </div>
  )
}

function StepClosing({ t, lang, onClose }) {
  return (
    <div className="text-center animate-fade-in-up">
      <div className="text-3xl mb-3">🌘</div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-3">
        {t('tour.s3.title')}
      </h3>
      <p className="text-[color:var(--color-ink-soft)] leading-relaxed mb-6 max-w-md mx-auto">
        {t('tour.s3.desc')}
      </p>
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[color:var(--color-teal-soft)] shadow-sm mb-6" dir="rtl">
        <p className="font-serif text-lg sm:text-xl leading-relaxed text-[color:var(--color-ink)]">
          «{t('tour.s3.hadith')}»
        </p>
      </div>
      <div className="text-sm text-[color:var(--color-ink-mute)] mb-5 font-semibold">
        ✨ {t('tour.s3.outro')}
      </div>
      <a
        href="#memorize"
        onClick={onClose}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition shadow-lg"
      >
        {t('tour.s3.cta')}
        <span>{lang === 'ar' ? '←' : '→'}</span>
      </a>
    </div>
  )
}

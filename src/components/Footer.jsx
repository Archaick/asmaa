import { useLang } from '../i18n/LangContext'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t border-[color:var(--color-cream-deep)] bg-[color:var(--color-cream)] py-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src="/asmaa.jpeg"
              alt="مشروع أسماء الله الحسنى"
              width="56"
              height="56"
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />
          </div>
          <div>
            <div className="font-bold text-[color:var(--color-ink)]">{t('footer.tagline')}</div>
            <div className="text-xs text-[color:var(--color-ink-mute)]">{t('footer.by')}</div>
          </div>
        </div>
        <div className="text-xs text-[color:var(--color-ink-mute)]" dir="ltr">
          asmaa-allah.net · info@asmaa-allah.net
        </div>
      </div>
    </footer>
  )
}

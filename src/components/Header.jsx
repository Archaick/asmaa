import { useState } from 'react'
import { useLang } from '../i18n/LangContext'

export default function Header() {
  const { t, lang, toggle } = useLang()
  const [open, setOpen] = useState(false)

  const links = [
    { key: 'nav.home', href: '#' },
    { key: 'nav.memorize', href: '#memorize' },
    { key: 'nav.library', href: '#library' },
    { key: 'nav.support', href: '#support' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--color-cream)]/85 backdrop-blur-md border-b border-[color:var(--color-cream-deep)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/asmaa.jpeg"
              alt="مشروع أسماء الله الحسنى"
              width="48"
              height="48"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg font-bold text-[color:var(--color-ink)]">
              {lang === 'ar' ? 'مشروع أسماء الله الحسنى' : 'The 99 Names of Allah'}
            </span>
            <span className="text-xs text-[color:var(--color-ink-mute)]">
              {lang === 'ar'
                ? 'الحفظ ← الفهم ← الدعاء ← التعبد'
                : 'Memorize · Understand · Supplicate · Live'}
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="px-4 py-2 rounded-full text-[15px] font-medium text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-warm)] hover:text-[color:var(--color-ink)] transition"
            >
              {t(l.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="px-3 py-1.5 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold-deep)] transition"
          >
            {t('nav.lang')}
          </button>
          <a
            href="#login"
            className="hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-bold bg-[color:var(--color-ink)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-teal-deep)] transition"
          >
            {t('nav.login')}
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-[color:var(--color-cream-warm)]"
            aria-label="menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[color:var(--color-cream-deep)] px-5 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-[15px] font-medium text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-cream-warm)]"
            >
              {t(l.key)}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

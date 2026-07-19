import SA from 'country-flag-icons/react/3x2/SA'
import GB from 'country-flag-icons/react/3x2/GB'
import { LANGUAGES, useLang } from '../i18n/LangContext'

// Crisp SVG flags (country-flag-icons is tree-shaken — only the flags we
// import here are bundled, ~1KB each, and they render identically on every
// platform). To add a language: import its flag component and map it here.
const FLAGS = { SA, GB }

// Reusable segmented language switch with flags + endonyms. Renders every
// entry in LANGUAGES, so adding a language anywhere grows this automatically.
// `full` stretches it to the container width (used inside the profile menu).
export default function LangToggle({ full = false, className = '' }) {
  const { lang, setLang } = useLang()

  return (
    <div
      role="group"
      aria-label="Language"
      dir="ltr"
      className={
        'inline-flex items-center gap-0.5 p-0.5 rounded-full bg-[color:var(--color-cream-warm)] border border-[color:var(--color-cream-deep)] ' +
        (full ? 'w-full ' : '') + className
      }
    >
      {LANGUAGES.map((l) => {
        const active = lang === l.code
        const Flag = FLAGS[l.country]
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            className={
              'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition ' +
              (full ? 'flex-1 ' : '') +
              (active
                ? 'bg-[color:var(--color-ink)] text-[color:var(--color-cream)] shadow-sm'
                : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]')
            }
          >
            {Flag && (
              <Flag
                title={l.label}
                className="w-5 h-auto rounded-[3px] shrink-0 ring-1 ring-black/5"
              />
            )}
            <span>{l.label}</span>
          </button>
        )
      })}
    </div>
  )
}

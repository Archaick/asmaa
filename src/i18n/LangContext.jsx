import { createContext, useContext, useEffect, useState } from 'react'
import { dict } from './dict'

// Supported languages. Add an entry here (+ a dict.{code} block) to grow —
// the LangToggle renders straight from this list.
export const LANGUAGES = [
  { code: 'ar', label: 'عربي',    flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
]

const LANG_CODES = LANGUAGES.map((l) => l.code)

const LangContext = createContext({
  lang: 'ar', t: (k) => k, toggle: () => {}, setLang: () => {},
})

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('asmaa.lang')
    return LANG_CODES.includes(saved) ? saved : 'ar'
  })

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]
    localStorage.setItem('asmaa.lang', lang)
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', meta.dir)
  }, [lang])

  const setLang = (code) => { if (LANG_CODES.includes(code)) setLangState(code) }
  const t = (key) => (dict[lang] && dict[lang][key]) || dict.ar[key] || key
  // Kept for callers that just flip between the first two languages.
  const toggle = () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'))

  return (
    <LangContext.Provider value={{ lang, t, toggle, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

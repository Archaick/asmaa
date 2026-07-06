import { createContext, useContext, useEffect, useState } from 'react'
import { dict } from './dict'

const LangContext = createContext({ lang: 'ar', t: (k) => k, toggle: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('asmaa.lang') || 'ar')

  useEffect(() => {
    localStorage.setItem('asmaa.lang', lang)
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  }, [lang])

  const t = (key) => (dict[lang] && dict[lang][key]) || dict.ar[key] || key
  const toggle = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))

  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

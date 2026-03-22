'use client'

import { useEffect } from 'react'
import i18n from '@/src/i18n'

export function I18nInitializer() {
  useEffect(() => {
    const lang = localStorage.getItem('language') || 'ar'
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [])

  return null
}

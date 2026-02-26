import i18n from '@/i18n'
import { create } from 'zustand'

interface StatusState {
  currentTheme: 'Light' | 'Dark'
  currentLanguage: 'zh' | 'en'
  toggleTheme: () => void
  toggleLanguage: () => void
}

export const useStatusStore = create<StatusState>((set, get) => ({
  currentTheme:
    (localStorage.getItem('theme') as StatusState['currentTheme']) || 'Light',
  currentLanguage:
    (localStorage.getItem('language') as StatusState['currentLanguage']) ||
    'zh',

  toggleTheme() {
    set({
      currentTheme: get().currentTheme === 'Light' ? 'Dark' : 'Light',
    })
    document.body.dataset.theme = get().currentTheme
    localStorage.setItem('theme', get().currentTheme)
  },
  toggleLanguage() {
    set({
      currentLanguage: get().currentLanguage === 'zh' ? 'en' : 'zh',
    })
    i18n.changeLanguage(get().currentLanguage)
    localStorage.setItem('language', get().currentLanguage)
  },
}))

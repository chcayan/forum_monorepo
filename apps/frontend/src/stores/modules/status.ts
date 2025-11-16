import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStatusStore = defineStore(
  'status',
  () => {
    const currentTheme = ref(localStorage.getItem('theme') || 'Light')

    const toggleTheme = () => {
      currentTheme.value = currentTheme.value === 'Light' ? 'Dark' : 'Light'
      localStorage.setItem('theme', currentTheme.value)
      document.body.dataset.theme = currentTheme.value
    }

    return {
      currentTheme,
      toggleTheme,
    }
  },
  {
    persist: true,
  }
)

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStatusStore = defineStore(
  'status',
  () => {
    const currentTheme = ref('Light')

    const toggleTheme = () => {
      currentTheme.value = currentTheme.value === 'Light' ? 'Dark' : 'Light'
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

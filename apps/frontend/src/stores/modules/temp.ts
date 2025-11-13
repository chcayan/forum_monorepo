import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTempStore = defineStore('temp', () => {
  const tempComment = ref('')
  const setTempComment = (comment: string) => {
    tempComment.value = comment
  }
  const removeTempComment = () => {
    tempComment.value = ''
  }

  return {
    tempComment,
    setTempComment,
    removeTempComment,
  }
})

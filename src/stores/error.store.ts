import { ref } from 'vue'
import { defineStore } from 'pinia'

export type AppError = {
  message: string
  status: number
  reason?: string
}

export const useErrorStore = defineStore('error', () => {
  const error = ref<AppError | null>(null)

  function setError(payload: AppError) {
    error.value = payload
  }

  function clearError() {
    error.value = null
  }

  return { error, setError, clearError }
})

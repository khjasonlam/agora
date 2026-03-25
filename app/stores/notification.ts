import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const toast = useToast()

  const success = (message: string) => {
    toast.add({ title: message, color: 'success', icon: 'i-heroicons-check-circle' })
  }

  const error = (message: string) => {
    toast.add({ title: message, color: 'error', icon: 'i-heroicons-exclamation-circle' })
  }

  const info = (message: string) => {
    toast.add({ title: message, color: 'info', icon: 'i-heroicons-information-circle' })
  }

  return { success, error, info }
})

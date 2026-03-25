import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const toast = useToast()

  function success(message: string) {
    toast.add({ title: message, color: 'success', icon: 'i-heroicons-check-circle' })
  }

  function error(message: string) {
    toast.add({ title: message, color: 'error', icon: 'i-heroicons-exclamation-circle' })
  }

  function info(message: string) {
    toast.add({ title: message, color: 'info', icon: 'i-heroicons-information-circle' })
  }

  return { success, error, info }
})

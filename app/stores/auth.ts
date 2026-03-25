import { defineStore } from 'pinia'
import type { Profile } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null)

  const isAdmin = computed(() => profile.value?.is_admin ?? false)

  const fetchProfile = async () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const userId = user.value?.sub

    if (!userId) {
      profile.value = null
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[auth store] fetchProfile failed:', error.message)
      profile.value = null
      return
    }

    profile.value = data
  }

  const clearProfile = () => {
    profile.value = null
  }

  return { profile, isAdmin, fetchProfile, clearProfile }
})

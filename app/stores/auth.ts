import { defineStore } from 'pinia'
import type { Profile } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null)

  const isAdmin = computed(() => profile.value?.is_admin ?? false)

  const fetchProfile = async () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    if (!user.value?.id) {
      profile.value = null
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    profile.value = data
  }

  const clearProfile = () => {
    profile.value = null
  }

  return { profile, isAdmin, fetchProfile, clearProfile }
})

import { defineStore } from 'pinia'

interface Profile {
  id: string
  employee_id: string
  name: string
  is_admin: boolean
}

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

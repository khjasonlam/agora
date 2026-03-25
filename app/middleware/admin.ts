export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  if (!user.value?.sub) {
    return navigateTo('/login')
  }

  const authStore = useAuthStore()

  if (!authStore.profile) {
    await authStore.fetchProfile()
  }

  if (!authStore.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})

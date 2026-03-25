export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/login')
  }

  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.value.id)
    .single()

  if (!data?.is_admin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})

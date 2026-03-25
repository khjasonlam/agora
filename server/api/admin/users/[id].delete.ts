export default defineEventHandler(async (event) => {
  const { user, supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  if (id === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete yourself' })
  }

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data: null, error: null }
})

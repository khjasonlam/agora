import { badRequest, internalError } from '../../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const { user, supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw badRequest('User ID is required')
  }

  if (id === user.id) {
    throw badRequest('Cannot delete yourself')
  }

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data: null, error: null }
})

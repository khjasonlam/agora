import { badRequest, internalError } from '../../../utils/apiErrors'
import { parseRequiredParam } from '../../../utils/params'

export default defineEventHandler(async (event) => {
  const { user, supabase } = await requireAdmin(event)
  const userId = parseRequiredParam(getRouterParam(event, 'id'), 'userId')

  if (userId === user.id) {
    throw badRequest('Cannot delete yourself')
  }

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data: null, error: null }
})

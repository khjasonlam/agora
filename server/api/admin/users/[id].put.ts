import { updateUserSchema } from '../../../validation/schemas'
import { badRequest, internalError } from '../../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw badRequest('User ID is required')
  }

  const body = await readBody(event)
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    throw badRequest(parsed.error.message)
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: parsed.data.name,
      employee_id: parsed.data.employeeId,
      is_admin: parsed.data.isAdmin
    })
    .eq('id', id)

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data: null, error: null }
})

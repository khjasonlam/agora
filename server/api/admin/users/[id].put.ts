import { updateUserSchema } from '../../../validation/schemas'
import { badRequest, internalError } from '../../../utils/apiErrors'
import { parseRequiredParam } from '../../../utils/params'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = parseRequiredParam(getRouterParam(event, 'id'), 'userId')

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

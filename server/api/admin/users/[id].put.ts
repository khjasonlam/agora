import { updateUserSchema } from '../../../validation/schemas'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const body = await readBody(event)
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
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
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data: null, error: null }
})

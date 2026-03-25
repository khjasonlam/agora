import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(20),
  employeeId: z.string().min(1),
  isAdmin: z.boolean()
})

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
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

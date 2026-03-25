import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(20),
  employeeId: z.string().min(1),
  isAdmin: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      name: parsed.data.name,
      employee_id: parsed.data.employeeId
    }
  })

  if (authError) {
    throw createError({ statusCode: 500, statusMessage: authError.message })
  }

  if (parsed.data.isAdmin && authData.user) {
    await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', authData.user.id)
  }

  return { success: true, data: authData.user, error: null }
})

import { internalError } from '../../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

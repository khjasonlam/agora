import { internalError } from '../../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const { data, error } = await supabase
    .from('categories')
    .select('name, posts(count)')
    .eq('is_deleted', false)
    .order('name', { ascending: true })

  if (error) {
    throw internalError(error.message)
  }

  const result = (data ?? [])
    .map(c => ({
      name: c.name,
      count: (c.posts as unknown as { count: number }[])[0]?.count ?? 0
    }))
    .sort((a, b) => b.count - a.count)

  return { success: true, data: result, error: null }
})

import { serverSupabaseClient } from '#supabase/server'
import { badRequest, internalError } from '../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.postId) {
    throw badRequest('postId is required')
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase
    .from('threads')
    .select('*, profiles(name)')
    .eq('post_id', Number(query.postId))
    .eq('is_deleted', false)
    .order('thread_number')

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

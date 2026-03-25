import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Thread } from '~/types'

export const useRealtime = (postId: number) => {
  const supabase = useSupabaseClient()
  const newThreads = ref<Thread[]>([])
  let channel: RealtimeChannel | null = null

  const fetchProfile = async (userId: string): Promise<{ name: string } | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()
    return data
  }

  const subscribe = () => {
    channel = supabase
      .channel(`threads:post_${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threads',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          const row = payload.new
          const profiles = await fetchProfile(String(row.user_id))
          newThreads.value.push({
            id: Number(row.id),
            user_id: String(row.user_id),
            post_id: Number(row.post_id),
            thread_number: Number(row.thread_number),
            content: String(row.content),
            is_deleted: Boolean(row.is_deleted),
            created_at: String(row.created_at),
            updated_at: String(row.updated_at),
            profiles
          })
        }
      )
      .subscribe()
  }

  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  onMounted(subscribe)
  onUnmounted(unsubscribe)

  return { newThreads }
}

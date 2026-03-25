import type { RealtimeChannel } from '@supabase/supabase-js'

interface Thread {
  id: number
  user_id: string
  post_id: number
  thread_number: number
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export function useRealtime(postId: number) {
  const supabase = useSupabaseClient()
  const newThreads = ref<Thread[]>([])
  let channel: RealtimeChannel | null = null

  function subscribe() {
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
        (payload) => {
          newThreads.value.push(payload.new as Thread)
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  onMounted(subscribe)
  onUnmounted(unsubscribe)

  return { newThreads }
}

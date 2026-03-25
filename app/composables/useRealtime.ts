import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeThread {
  id: number
  user_id: string
  post_id: number
  thread_number: number
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles: { name: string } | null
}

export function useRealtime(postId: number) {
  const supabase = useSupabaseClient()
  const newThreads = ref<RealtimeThread[]>([])
  let channel: RealtimeChannel | null = null

  async function fetchProfile(userId: string): Promise<{ name: string } | null> {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()
    return data
  }

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
        async (payload) => {
          const raw = payload.new as Omit<RealtimeThread, 'profiles'>
          const profiles = await fetchProfile(raw.user_id)
          newThreads.value.push({ ...raw, profiles })
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

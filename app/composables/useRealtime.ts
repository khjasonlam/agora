import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Thread } from '~/types'

type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_BASE_DELAY_MS = 1000

export const useRealtime = (postId: number) => {
  const supabase = useSupabaseClient()
  const newThreads = ref<Thread[]>([])
  const status = ref<RealtimeStatus>('connecting')
  const connectionError = ref<string | null>(null)

  let channel: RealtimeChannel | null = null
  let reconnectAttempts = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const fetchProfile = async (userId: string): Promise<{ name: string } | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()
    return data
  }

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const scheduleReconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      status.value = 'error'
      connectionError.value = 'リアルタイム接続に失敗しました。ページを再読み込みしてください。'
      return
    }

    const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts)
    reconnectAttempts++
    status.value = 'connecting'
    connectionError.value = null

    reconnectTimer = setTimeout(() => {
      unsubscribe()
      subscribe()
    }, delay)
  }

  const subscribe = () => {
    status.value = 'connecting'
    connectionError.value = null

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
      .subscribe((subscriptionStatus, err) => {
        if (subscriptionStatus === 'SUBSCRIBED') {
          status.value = 'connected'
          connectionError.value = null
          reconnectAttempts = 0
        } else if (subscriptionStatus === 'CHANNEL_ERROR') {
          console.error('[useRealtime] Channel error:', err)
          status.value = 'error'
          connectionError.value = 'リアルタイム接続でエラーが発生しました。'
          scheduleReconnect()
        } else if (subscriptionStatus === 'TIMED_OUT') {
          console.error('[useRealtime] Subscription timed out')
          status.value = 'error'
          connectionError.value = 'リアルタイム接続がタイムアウトしました。'
          scheduleReconnect()
        } else if (subscriptionStatus === 'CLOSED') {
          status.value = 'disconnected'
        }
      })
  }

  const unsubscribe = () => {
    clearReconnectTimer()
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  const reconnect = () => {
    reconnectAttempts = 0
    connectionError.value = null
    unsubscribe()
    subscribe()
  }

  onMounted(subscribe)
  onUnmounted(unsubscribe)

  return { newThreads, status, connectionError, reconnect }
}

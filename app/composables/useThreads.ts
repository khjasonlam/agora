interface Thread {
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

interface ThreadsResponse {
  success: boolean
  data: Thread[] | null
  error: string | null
}

export function useThreads(postId: number) {
  const { data, status, refresh } = useApiFetch<ThreadsResponse>(`/api/threads?postId=${postId}`)

  const threads = computed(() => data.value?.data ?? [])

  return { threads, status, refresh }
}

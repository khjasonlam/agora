import type { Thread, ApiResponse } from '~/types'

export const useThreads = (postId: number) => {
  const { data, status, refresh } = useFetch<ApiResponse<Thread[]>>(`/api/threads?postId=${postId}`)

  const threads = computed(() => data.value?.data ?? [])

  return { threads, status, refresh }
}

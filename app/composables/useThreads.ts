import type { Thread, ApiResponse } from '~/types'

export const useThreads = (postId: number) => {
  const { data, status, error, refresh } = useFetch<ApiResponse<Thread[]>>(`/api/threads?postId=${postId}`)

  const threads = computed(() => data.value?.data ?? [])

  return { threads, status, error, refresh }
}

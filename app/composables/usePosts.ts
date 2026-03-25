import type { Post, ApiResponse } from '~/types'

export const usePosts = (categoryId?: number | Ref<number>) => {
  const id = toValue(categoryId)
  const url = id ? `/api/posts?categoryId=${id}` : '/api/posts'

  const { data, status, error, refresh } = useFetch<ApiResponse<Post[]>>(url)

  const posts = computed(() => data.value?.data ?? [])

  return { posts, status, error, refresh }
}

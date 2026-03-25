interface Post {
  id: number
  user_id: string
  category_id: number
  title: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles: { name: string } | null
  categories: { name: string; icon: string } | null
  threads: { count: number }[]
}

interface PostsResponse {
  success: boolean
  data: Post[] | null
  error: string | null
}

export function usePosts(categoryId?: number | Ref<number>) {
  const id = toValue(categoryId)
  const url = id ? `/api/posts?categoryId=${id}` : '/api/posts'

  const { data, status, refresh } = useApiFetch<PostsResponse>(url)

  const posts = computed(() => data.value?.data ?? [])

  return { posts, status, refresh }
}

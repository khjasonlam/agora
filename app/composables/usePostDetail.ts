import type { ApiResponse, Post, Thread } from '~/types'

export const usePostDetail = async (postId: number) => {
  const { data: postData, status: postStatus, error: postError, refresh: refreshPost } = await useFetch<ApiResponse<Post>>(
    `/api/posts/${postId}`
  )
  const post = computed(() => postData.value?.data ?? null)

  const {
    threads: initialThreads,
    status: threadsStatus,
    error: threadsError,
    refresh: refreshThreads
  } = useThreads(postId)

  const { newThreads, status: realtimeStatus, connectionError, reconnect } = useRealtime(postId)

  const allThreads = computed<Thread[]>(() => [...initialThreads.value, ...newThreads.value])

  const backLink = computed(() => {
    const catId = post.value?.category_id
    return catId ? `/categories/${catId}` : '/'
  })

  const backLabel = computed(() => post.value?.categories?.name ?? 'カテゴリに戻る')

  const activeCategoryId = useState<number | null>('activeCategoryId', () => null)
  watch(
    post,
    (p) => {
      activeCategoryId.value = p?.category_id ?? null
    },
    { immediate: true }
  )
  onUnmounted(() => {
    activeCategoryId.value = null
  })

  return {
    post,
    postStatus,
    postError,
    refreshPost,
    threadsStatus,
    threadsError,
    refreshThreads,
    initialThreads,
    newThreads,
    realtimeStatus,
    connectionError,
    reconnect,
    allThreads,
    backLink,
    backLabel,
    postId
  }
}


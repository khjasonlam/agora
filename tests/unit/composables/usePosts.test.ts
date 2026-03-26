import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, unref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { ApiResponse, Post } from '~/types'

import { usePosts } from '~/composables/usePosts'

const { useFetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn()
}))

mockNuxtImport('useFetch', () => useFetchMock)

const mockPost: Post = {
  id: 1,
  user_id: 'user-uuid-1',
  category_id: 1,
  title: 'Test Post Title',
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  profiles: { name: 'Alice' },
  categories: { name: 'Tech', icon: 'i-heroicons-folder' },
  threads: [{ count: 3 }]
}

describe('usePosts', () => {
  const resolveUrl = (value: unknown) => String(unref(value as string))

  beforeEach(() => {
    vi.clearAllMocks()
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('pending'),
      error: ref(null),
      refresh: vi.fn()
    })
  })

  describe('URL construction', () => {
    it('calls /api/posts when no categoryId provided', () => {
      usePosts()
      expect(resolveUrl(useFetchMock.mock.calls[0][0])).toBe('/api/posts')
    })

    it('calls /api/posts?categoryId=X when categoryId is a number', () => {
      usePosts(5)
      expect(resolveUrl(useFetchMock.mock.calls[0][0])).toBe('/api/posts?categoryId=5')
    })

    it('calls /api/posts when categoryId is undefined', () => {
      usePosts(undefined)
      expect(resolveUrl(useFetchMock.mock.calls[0][0])).toBe('/api/posts')
    })

    it('reacts to Ref categoryId changes', () => {
      const categoryId = ref(1)
      usePosts(categoryId)

      const urlSource = useFetchMock.mock.calls[0][0]
      expect(resolveUrl(urlSource)).toBe('/api/posts?categoryId=1')

      categoryId.value = 2
      expect(resolveUrl(urlSource)).toBe('/api/posts?categoryId=2')
    })
  })

  describe('posts computed', () => {
    it('returns empty array when data is null', () => {
      const { posts } = usePosts()
      expect(posts.value).toEqual([])
    })

    it('returns empty array when API data field is null', () => {
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Post[]>>({ success: false, data: null, error: 'Error' }),
        status: ref('error'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { posts } = usePosts()
      expect(posts.value).toEqual([])
    })

    it('returns posts from successful response', () => {
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Post[]>>({ success: true, data: [mockPost], error: null }),
        status: ref('success'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { posts } = usePosts()
      expect(posts.value).toHaveLength(1)
      expect(posts.value[0].title).toBe('Test Post Title')
      expect(posts.value[0].profiles?.name).toBe('Alice')
    })

    it('returns multiple posts', () => {
      const secondPost: Post = { ...mockPost, id: 2, title: 'Second Post' }
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Post[]>>({ success: true, data: [mockPost, secondPost], error: null }),
        status: ref('success'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { posts } = usePosts()
      expect(posts.value).toHaveLength(2)
    })
  })

  describe('status and error', () => {
    it('exposes pending status', () => {
      const { status } = usePosts()
      expect(status.value).toBe('pending')
    })

    it('exposes error from useFetch', () => {
      const mockError = new Error('Fetch failed')
      useFetchMock.mockReturnValue({
        data: ref(null),
        status: ref('error'),
        error: ref(mockError),
        refresh: vi.fn()
      })

      const { error } = usePosts()
      expect(error.value).toEqual(mockError)
    })
  })

  it('exposes refresh function', () => {
    const mockRefresh = vi.fn()
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('idle'),
      error: ref(null),
      refresh: mockRefresh
    })

    const { refresh } = usePosts()
    refresh()
    expect(mockRefresh).toHaveBeenCalledOnce()
  })
})

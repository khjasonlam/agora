import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { ApiResponse, Thread } from '~/types'

import { useThreads } from '~/composables/useThreads'

const { useFetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn()
}))

mockNuxtImport('useFetch', () => useFetchMock)

const mockThread: Thread = {
  id: 1,
  user_id: 'user-uuid-1',
  post_id: 10,
  thread_number: 1,
  content: 'This is a thread comment',
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  profiles: { name: 'Bob' }
}

describe('useThreads', () => {
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
    it('calls /api/threads?postId=X with given postId', () => {
      useThreads(10)
      expect(useFetchMock.mock.calls[0][0]).toBe('/api/threads?postId=10')
    })

    it('calls with correct postId for different values', () => {
      useThreads(42)
      expect(useFetchMock.mock.calls[0][0]).toBe('/api/threads?postId=42')
    })
  })

  describe('threads computed', () => {
    it('returns empty array when data is null', () => {
      const { threads } = useThreads(10)
      expect(threads.value).toEqual([])
    })

    it('returns empty array when API data field is null', () => {
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Thread[]>>({ success: false, data: null, error: 'Error' }),
        status: ref('error'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { threads } = useThreads(10)
      expect(threads.value).toEqual([])
    })

    it('returns threads from successful response', () => {
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Thread[]>>({ success: true, data: [mockThread], error: null }),
        status: ref('success'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { threads } = useThreads(10)
      expect(threads.value).toHaveLength(1)
      expect(threads.value[0].content).toBe('This is a thread comment')
      expect(threads.value[0].thread_number).toBe(1)
    })

    it('preserves thread data including profiles', () => {
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Thread[]>>({ success: true, data: [mockThread], error: null }),
        status: ref('success'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { threads } = useThreads(10)
      expect(threads.value[0].profiles?.name).toBe('Bob')
    })

    it('returns multiple threads in order', () => {
      const thread2: Thread = { ...mockThread, id: 2, thread_number: 2, content: 'Second comment' }
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Thread[]>>({ success: true, data: [mockThread, thread2], error: null }),
        status: ref('success'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { threads } = useThreads(10)
      expect(threads.value).toHaveLength(2)
      expect(threads.value[1].thread_number).toBe(2)
    })
  })

  describe('status and error', () => {
    it('exposes pending status initially', () => {
      const { status } = useThreads(10)
      expect(status.value).toBe('pending')
    })

    it('exposes null error on success', () => {
      useFetchMock.mockReturnValue({
        data: ref<ApiResponse<Thread[]>>({ success: true, data: [], error: null }),
        status: ref('success'),
        error: ref(null),
        refresh: vi.fn()
      })

      const { error } = useThreads(10)
      expect(error.value).toBeNull()
    })

    it('exposes error on failure', () => {
      const mockError = new Error('Connection failed')
      useFetchMock.mockReturnValue({
        data: ref(null),
        status: ref('error'),
        error: ref(mockError),
        refresh: vi.fn()
      })

      const { error } = useThreads(10)
      expect(error.value).toEqual(mockError)
    })
  })

  it('exposes refresh function', () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined)
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('idle'),
      error: ref(null),
      refresh: mockRefresh
    })

    const { refresh } = useThreads(10)
    refresh()
    expect(mockRefresh).toHaveBeenCalledOnce()
  })
})

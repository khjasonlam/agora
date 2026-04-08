import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref, type ComputedRef } from 'vue'
import type { ApiResponse, Post, Thread } from '~/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import { usePostDetail } from '~/composables/usePostDetail'

const { useFetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn()
}))

const { useThreadsMock } = vi.hoisted(() => ({
  useThreadsMock: vi.fn()
}))

const { useRealtimeMock } = vi.hoisted(() => ({
  useRealtimeMock: vi.fn()
}))

mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useThreads', () => useThreadsMock)
mockNuxtImport('useRealtime', () => useRealtimeMock)

const stateMap = vi.hoisted(() => ({} as Record<string, ReturnType<typeof ref>>))
const useStateMock = vi.hoisted(() =>
  vi.fn((key: string, init: () => unknown) => {
    if (!stateMap[key]) stateMap[key] = ref(init())
    return stateMap[key] as ReturnType<typeof ref>
  })
)
mockNuxtImport('useState', () => useStateMock)

function getBackLinkRef(result: unknown): ComputedRef<string> {
  const r = result as {
    nav?: { backLink?: ComputedRef<string> }
    backLink?: ComputedRef<string>
  }
  const backLink = r.nav?.backLink ?? r.backLink
  if (!backLink) throw new Error('backLink is missing from usePostDetail result')
  return backLink
}
function getBackLabelRef(result: unknown): ComputedRef<string> {
  const r = result as {
    nav?: { backLabel?: ComputedRef<string> }
    backLabel?: ComputedRef<string>
  }
  const backLabel = r.nav?.backLabel ?? r.backLabel
  if (!backLabel) throw new Error('backLabel is missing from usePostDetail result')
  return backLabel
}
function getAllThreadsRef(result: unknown): { value: Thread[] } {
  const r = result as {
    threads?: { allThreads?: { value: Thread[] } }
    allThreads?: { value: Thread[] }
  }
  const allThreads = r.threads?.allThreads ?? r.allThreads
  if (!allThreads) throw new Error('allThreads is missing from usePostDetail result')
  return allThreads
}

describe('usePostDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(stateMap).forEach((k) => {
      stateMap[k].value = null
    })
  })

  it('builds backLink/backLabel, updates activeCategoryId, and merges threads', async () => {
    const postDataRef = ref<ApiResponse<Post> | null>(null)
    const initialThreadsRef = ref<Thread[]>([])
    const newThreadsRef = ref<Thread[]>([])

    const reconnect = vi.fn()

    const mockPostA = {
      id: 1,
      user_id: 'user-1',
      category_id: 5,
      title: 'Hello',
      is_deleted: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      profiles: null,
      categories: { name: 'Tech', icon: 'i-heroicons-folder' },
      threads: []
    } satisfies Post

    const mockPostB = { ...mockPostA, category_id: 9 } satisfies Post

    const thread1 = {
      id: 1,
      user_id: 'user-1',
      post_id: 1,
      thread_number: 1,
      content: 'First',
      is_deleted: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      profiles: null
    } satisfies Thread

    const thread2 = { ...thread1, id: 2, thread_number: 2, content: 'Second' } satisfies Thread

    postDataRef.value = { success: true, data: mockPostA, error: null }
    initialThreadsRef.value = [thread1]
    newThreadsRef.value = []

    useFetchMock.mockImplementation(() => ({
      data: postDataRef,
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    }))
    useThreadsMock.mockReturnValue({
      threads: initialThreadsRef,
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    })
    useRealtimeMock.mockReturnValue({
      newThreads: newThreadsRef,
      status: ref('connected'),
      connectionError: ref(null),
      reconnect
    })

    const result = await usePostDetail(1)
    const backLink = getBackLinkRef(result)
    const backLabel = getBackLabelRef(result)
    const allThreads = getAllThreadsRef(result)

    expect(backLink.value).toBe('/categories/5')
    expect(backLabel.value).toBe('Tech')

    const activeCategoryId = stateMap.activeCategoryId as { value: number | null } | undefined
    expect(activeCategoryId?.value).toBe(5)

    // Update post category -> watch should update state.
    postDataRef.value = { success: true, data: mockPostB, error: null }
    await nextTick()
    await nextTick()
    expect(activeCategoryId?.value).toBe(9)

    // Merge initialThreads + newThreads.
    expect(allThreads.value).toHaveLength(1)
    newThreadsRef.value = [thread2]
    await nextTick()
    await nextTick()
    expect(allThreads.value).toHaveLength(2)
  })

  it('falls back when post/categories are null', async () => {
    const postDataRef = ref<ApiResponse<Post> | null>(null)
    const initialThreadsRef = ref<Thread[]>([])
    const newThreadsRef = ref<Thread[]>([])

    useFetchMock.mockImplementation(() => ({
      data: postDataRef,
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    }))
    useThreadsMock.mockReturnValue({
      threads: initialThreadsRef,
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    })
    useRealtimeMock.mockReturnValue({
      newThreads: newThreadsRef,
      status: ref('connected'),
      connectionError: ref(null),
      reconnect: vi.fn()
    })

    const mockPostNoCategories = {
      id: 1,
      user_id: 'user-1',
      category_id: 1,
      title: 'Hello',
      is_deleted: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      profiles: null,
      categories: null,
      threads: []
    } satisfies Post

    postDataRef.value = { success: true, data: mockPostNoCategories, error: null }

    const result = await usePostDetail(2)
    const backLink = getBackLinkRef(result)
    const backLabel = getBackLabelRef(result)

    // backLink still uses category_id, backLabel falls back.
    expect(backLink.value).toBe('/categories/1')
    expect(backLabel.value).toBe('カテゴリに戻る')

    // When post itself is null, both should fall back.
    postDataRef.value = { success: true, data: null, error: null }
    await nextTick()
    await nextTick()
    expect(backLink.value).toBe('/')
    expect(backLabel.value).toBe('カテゴリに戻る')
  })
})

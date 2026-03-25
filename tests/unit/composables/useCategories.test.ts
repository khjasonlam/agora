import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { ApiResponse, Category } from '~/types'

import { useCategories } from '~/composables/useCategories'

const { useFetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn()
}))

mockNuxtImport('useFetch', () => useFetchMock)

const mockCategory: Category = {
  id: 1,
  name: 'Tech',
  icon: 'i-heroicons-folder',
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z'
}

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('pending'),
      error: ref(null),
      refresh: vi.fn()
    })
  })

  it('calls useFetch with /api/categories', () => {
    useCategories()
    expect(useFetchMock.mock.calls[0][0]).toBe('/api/categories')
  })

  it('returns empty array when data is null', () => {
    const { categories } = useCategories()
    expect(categories.value).toEqual([])
  })

  it('returns empty array when API data field is null', () => {
    useFetchMock.mockReturnValue({
      data: ref<ApiResponse<Category[]>>({ success: false, data: null, error: 'Server error' }),
      status: ref('error'),
      error: ref(null),
      refresh: vi.fn()
    })

    const { categories } = useCategories()
    expect(categories.value).toEqual([])
  })

  it('returns categories from successful API response', () => {
    const mockCategories: Category[] = [
      mockCategory,
      { id: 2, name: 'General', icon: 'i-heroicons-chat', is_deleted: false, created_at: '2024-01-02T00:00:00Z' }
    ]

    useFetchMock.mockReturnValue({
      data: ref<ApiResponse<Category[]>>({ success: true, data: mockCategories, error: null }),
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    })

    const { categories } = useCategories()
    expect(categories.value).toHaveLength(2)
    expect(categories.value[0]).toEqual(mockCategory)
    expect(categories.value[1].name).toBe('General')
  })

  it('returns single category list', () => {
    useFetchMock.mockReturnValue({
      data: ref<ApiResponse<Category[]>>({ success: true, data: [mockCategory], error: null }),
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    })

    const { categories } = useCategories()
    expect(categories.value).toHaveLength(1)
  })

  it('exposes status from useFetch', () => {
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn()
    })

    const { status } = useCategories()
    expect(status.value).toBe('success')
  })

  it('exposes error from useFetch', () => {
    const mockError = new Error('Network error')
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('error'),
      error: ref(mockError),
      refresh: vi.fn()
    })

    const { error } = useCategories()
    expect(error.value).toEqual(mockError)
  })

  it('exposes refresh function', () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined)
    useFetchMock.mockReturnValue({
      data: ref(null),
      status: ref('idle'),
      error: ref(null),
      refresh: mockRefresh
    })

    const { refresh } = useCategories()
    refresh()
    expect(mockRefresh).toHaveBeenCalledOnce()
  })
})

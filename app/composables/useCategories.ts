import type { Category, ApiResponse } from '~/types'

export const useCategories = () => {
  const { data, status, refresh } = useFetch<ApiResponse<Category[]>>('/api/categories')

  const categories = computed(() => data.value?.data ?? [])

  return { categories, status, refresh }
}

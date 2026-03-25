interface Category {
  id: number
  name: string
  icon: string
  is_deleted: boolean
  created_at: string
}

interface CategoriesResponse {
  success: boolean
  data: Category[] | null
  error: string | null
}

export function useCategories() {
  const { data, status, refresh } = useApiFetch<CategoriesResponse>('/api/categories')

  const categories = computed(() => data.value?.data ?? [])

  return { categories, status, refresh }
}

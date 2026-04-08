import type { Ref } from 'vue'

interface UseAdminListPageOptions<T> {
  items: Ref<T[]>
  filterBy: (item: T, search: string) => boolean
  deleteRequest: (target: T) => Promise<void>
  deleteSuccessMessage: string
  deleteErrorMessage: string
  onDeleted: () => Promise<unknown>
  pageSize?: number
}

const useAdminListFilterPagination = <T>(
  items: Ref<T[]>,
  filterBy: (item: T, search: string) => boolean,
  pageSize: number
) => {
  const search = ref('')
  const page = ref(1)

  watch(search, () => {
    page.value = 1
  })

  const filtered = computed(() => {
    const keyword = search.value.toLowerCase().trim()
    if (!keyword) return items.value
    return items.value.filter(item => filterBy(item, keyword))
  })

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize
    return filtered.value.slice(start, start + pageSize)
  })

  return { search, page, filtered, paginated }
}

const useAdminListFormState = <T>() => {
  const formOpen = ref(false)
  const editTarget = ref<T | null>(null)

  const openCreateForm = () => {
    editTarget.value = null
    formOpen.value = true
  }

  const openEditForm = (target: T) => {
    editTarget.value = target
    formOpen.value = true
  }

  return {
    open: formOpen,
    editTarget,
    openCreate: openCreateForm,
    openEdit: openEditForm
  }
}

const useAdminListDeleteFlow = <T>(
  options: Pick<UseAdminListPageOptions<T>, 'deleteRequest' | 'deleteSuccessMessage' | 'deleteErrorMessage' | 'onDeleted'>
) => {
  const notify = useNotificationStore()
  const deleteTarget = ref<T | null>(null)
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)

  const openDeleteModal = (target: T) => {
    deleteTarget.value = target
    deleteModalOpen.value = true
  }

  const confirmDelete = async () => {
    if (!deleteTarget.value) return

    deleteLoading.value = true
    try {
      await options.deleteRequest(deleteTarget.value)
    } catch {
      notify.error(options.deleteErrorMessage)
      return
    } finally {
      deleteLoading.value = false
    }

    deleteModalOpen.value = false
    deleteTarget.value = null
    notify.success(options.deleteSuccessMessage)
    await options.onDeleted()
  }

  return {
    target: deleteTarget,
    modalOpen: deleteModalOpen,
    loading: deleteLoading,
    openModal: openDeleteModal,
    confirm: confirmDelete
  }
}

export const useAdminListPage = <T>(options: UseAdminListPageOptions<T>) => {
  const pageSize = options.pageSize ?? 10
  const list = useAdminListFilterPagination(options.items, options.filterBy, pageSize)
  const form = useAdminListFormState<T>()
  const remove = useAdminListDeleteFlow(options)

  return {
    list: { pageSize, ...list },
    form,
    remove
  }
}

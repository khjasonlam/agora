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

export const useAdminListPage = <T>(options: UseAdminListPageOptions<T>) => {
  const notify = useNotificationStore()

  const PAGE_SIZE = options.pageSize ?? 10
  const search = ref('')
  const page = ref(1)

  watch(search, () => {
    page.value = 1
  })

  const filtered = computed(() => {
    const keyword = search.value.toLowerCase().trim()
    if (!keyword) return options.items.value
    return options.items.value.filter(item => options.filterBy(item, keyword))
  })

  const paginated = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE
    return filtered.value.slice(start, start + PAGE_SIZE)
  })

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
    notify.success(options.deleteSuccessMessage)
    await options.onDeleted()
  }

  return {
    list: {
      pageSize: PAGE_SIZE,
      search,
      page,
      filtered,
      paginated
    },
    form: {
      open: formOpen,
      editTarget,
      openCreate: openCreateForm,
      openEdit: openEditForm
    },
    remove: {
      target: deleteTarget,
      modalOpen: deleteModalOpen,
      loading: deleteLoading,
      openModal: openDeleteModal,
      confirm: confirmDelete
    }
  }
}

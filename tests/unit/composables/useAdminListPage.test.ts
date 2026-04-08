import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, nextTick, ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import { useAdminListPage } from '~/composables/useAdminListPage'

const { storeMock, useNotificationStoreMock } = vi.hoisted(() => {
  const storeMock = {
    success: vi.fn(),
    error: vi.fn()
  }
  return {
    storeMock,
    useNotificationStoreMock: vi.fn(() => storeMock)
  }
})

mockNuxtImport('useNotificationStore', () => useNotificationStoreMock)

function withSetup<T>(composable: () => T): { result: T, unmount: () => void } {
  let result!: T
  const app = createApp({
    setup() {
      result = composable()
      return () => null
    }
  })
  const el = document.createElement('div')
  app.mount(el)
  return { result, unmount: () => app.unmount() }
}

describe('useAdminListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resets page to 1 when search changes and filters items', async () => {
    const items = ref([
      { id: 1, name: 'Alice', employee_id: 'E-001' },
      { id: 2, name: 'Bob', employee_id: 'E-002' }
    ])

    const deleteRequest = vi.fn().mockResolvedValue(undefined)
    const onDeleted = vi.fn().mockResolvedValue(undefined)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterBy = (item: any, search: string) =>
      item.name.toLowerCase().includes(search) || item.employee_id.toLowerCase().includes(search)

    const { result } = withSetup(() =>
      useAdminListPage({
        items,
        filterBy,
        deleteRequest,
        deleteSuccessMessage: 'deleted',
        deleteErrorMessage: 'delete failed',
        onDeleted,
        pageSize: 10
      })
    )

    expect(result.list.page.value).toBe(1)
    result.list.page.value = 2
    result.list.search.value = 'alice'
    await nextTick()

    expect(result.list.page.value).toBe(1)
    expect(result.list.filtered.value).toHaveLength(1)
    expect(result.list.filtered.value[0].name).toBe('Alice')
  })

  it('opens create/edit forms with correct targets', async () => {
    const items = ref([{ id: 1, name: 'Alice', employee_id: 'E-001' }])
    const deleteRequest = vi.fn().mockResolvedValue(undefined)
    const onDeleted = vi.fn().mockResolvedValue(undefined)

    const { result } = withSetup(() =>
      useAdminListPage({
        items,
        filterBy: () => true,
        deleteRequest,
        deleteSuccessMessage: 'deleted',
        deleteErrorMessage: 'delete failed',
        onDeleted,
        pageSize: 10
      })
    )

    result.form.openCreate()
    await nextTick()
    expect(result.form.open.value).toBe(true)
    expect(result.form.editTarget.value).toBeNull()

    const target = items.value[0]
    result.form.openEdit(target)
    await nextTick()
    expect(result.form.open.value).toBe(true)
    expect(result.form.editTarget.value).toBe(target)
  })

  it('confirmDelete closes modal and notifies on success', async () => {
    const items = ref([{ id: 1, name: 'Alice', employee_id: 'E-001' }])
    const deleteRequest = vi.fn().mockResolvedValue(undefined)
    const onDeleted = vi.fn().mockResolvedValue(undefined)

    const { result } = withSetup(() =>
      useAdminListPage({
        items,
        filterBy: () => true,
        deleteRequest,
        deleteSuccessMessage: 'deleted',
        deleteErrorMessage: 'delete failed',
        onDeleted,
        pageSize: 10
      })
    )

    const target = items.value[0]
    result.remove.openModal(target)
    expect(result.remove.modalOpen.value).toBe(true)

    await result.remove.confirm()

    expect(deleteRequest).toHaveBeenCalledWith(target)
    expect(result.remove.modalOpen.value).toBe(false)
    expect(result.remove.loading.value).toBe(false)
    expect(storeMock.success).toHaveBeenCalled()
    expect(onDeleted).toHaveBeenCalled()
  })

  it('confirmDelete keeps modal open and notifies on error', async () => {
    const items = ref([{ id: 1, name: 'Alice', employee_id: 'E-001' }])
    const deleteRequest = vi.fn().mockRejectedValue(new Error('fail'))
    const onDeleted = vi.fn().mockResolvedValue(undefined)

    const { result } = withSetup(() =>
      useAdminListPage({
        items,
        filterBy: () => true,
        deleteRequest,
        deleteSuccessMessage: 'deleted',
        deleteErrorMessage: 'delete failed',
        onDeleted,
        pageSize: 10
      })
    )

    result.remove.openModal(items.value[0])
    await result.remove.confirm()

    expect(storeMock.error).toHaveBeenCalled()
    expect(result.remove.modalOpen.value).toBe(true)
    expect(result.remove.loading.value).toBe(false)
    expect(onDeleted).not.toHaveBeenCalled()
  })
})

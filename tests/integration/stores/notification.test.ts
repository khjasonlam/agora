import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import { useNotificationStore } from '~/stores/notification'

const { useToastMock } = vi.hoisted(() => ({
  useToastMock: vi.fn()
}))

mockNuxtImport('useToast', () => useToastMock)

describe('useNotificationStore', () => {
  let mockToastAdd: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockToastAdd = vi.fn()
    useToastMock.mockReturnValue({ add: mockToastAdd })
  })

  describe('success()', () => {
    it('calls toast.add with success color', () => {
      const store = useNotificationStore()
      store.success('Operation successful')

      expect(mockToastAdd).toHaveBeenCalledWith({
        title: 'Operation successful',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    })

    it('passes the correct message as title', () => {
      const store = useNotificationStore()
      store.success('Profile updated')

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Profile updated' })
      )
    })
  })

  describe('error()', () => {
    it('calls toast.add with error color', () => {
      const store = useNotificationStore()
      store.error('Something went wrong')

      expect(mockToastAdd).toHaveBeenCalledWith({
        title: 'Something went wrong',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
    })

    it('uses exclamation-circle icon', () => {
      const store = useNotificationStore()
      store.error('Error occurred')

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'i-heroicons-exclamation-circle' })
      )
    })
  })

  describe('info()', () => {
    it('calls toast.add with info color', () => {
      const store = useNotificationStore()
      store.info('Please note this')

      expect(mockToastAdd).toHaveBeenCalledWith({
        title: 'Please note this',
        color: 'info',
        icon: 'i-heroicons-information-circle'
      })
    })

    it('uses information-circle icon', () => {
      const store = useNotificationStore()
      store.info('Info message')

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'i-heroicons-information-circle' })
      )
    })
  })

  it('all methods call toast.add exactly once', () => {
    const store = useNotificationStore()

    store.success('a')
    store.error('b')
    store.info('c')

    expect(mockToastAdd).toHaveBeenCalledTimes(3)
  })
})

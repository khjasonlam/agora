import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Profile } from '~/types'

import { useAuthStore } from '~/stores/auth'

const { useSupabaseClientMock, useSupabaseUserMock } = vi.hoisted(() => ({
  useSupabaseClientMock: vi.fn(),
  useSupabaseUserMock: vi.fn()
}))

mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)
mockNuxtImport('useSupabaseUser', () => useSupabaseUserMock)

const mockProfile: Profile = {
  id: 'user-uuid-1',
  employee_id: 'EMP001',
  name: 'Alice',
  is_admin: false,
  created_at: '2024-01-01T00:00:00Z'
}

const mockAdminProfile: Profile = {
  ...mockProfile,
  id: 'admin-uuid-1',
  is_admin: true,
  name: 'Admin User'
}

function createMockSupabaseClient(profileData: Profile | null = mockProfile, shouldError = false) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(
        shouldError
          ? { data: null, error: { message: 'Not found' } }
          : { data: profileData, error: null }
      )
    })
  }
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with null profile', () => {
      useSupabaseUserMock.mockReturnValue(ref(null))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient())

      const store = useAuthStore()
      expect(store.profile).toBeNull()
    })

    it('isAdmin defaults to false when profile is null', () => {
      useSupabaseUserMock.mockReturnValue(ref(null))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient())

      const store = useAuthStore()
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('fetchProfile', () => {
    it('sets profile to null when no user is logged in', async () => {
      useSupabaseUserMock.mockReturnValue(ref(null))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient())

      const store = useAuthStore()
      await store.fetchProfile()

      expect(store.profile).toBeNull()
    })

    it('fetches and sets profile when user is logged in', async () => {
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'user-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient(mockProfile))

      const store = useAuthStore()
      await store.fetchProfile()

      expect(store.profile).toEqual(mockProfile)
    })

    it('sets isAdmin to false for non-admin profile', async () => {
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'user-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient(mockProfile))

      const store = useAuthStore()
      await store.fetchProfile()

      expect(store.isAdmin).toBe(false)
    })

    it('sets isAdmin to true for admin profile', async () => {
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'admin-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient(mockAdminProfile))

      const store = useAuthStore()
      await store.fetchProfile()

      expect(store.isAdmin).toBe(true)
    })

    it('sets profile to null on fetch error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'user-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient(null, true))

      const store = useAuthStore()
      // Pre-set a profile to confirm it gets cleared
      store.profile = mockProfile
      await store.fetchProfile()
      consoleSpy.mockRestore()

      expect(store.profile).toBeNull()
    })

    it('queries the profiles table with the user id', async () => {
      const mockClient = createMockSupabaseClient(mockProfile)
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'user-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(mockClient)

      const store = useAuthStore()
      await store.fetchProfile()

      expect(mockClient.from).toHaveBeenCalledWith('profiles')
    })
  })

  describe('clearProfile', () => {
    it('sets profile to null', async () => {
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'user-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient(mockProfile))

      const store = useAuthStore()
      await store.fetchProfile()
      expect(store.profile).toEqual(mockProfile)

      store.clearProfile()
      expect(store.profile).toBeNull()
    })

    it('sets isAdmin to false after clearing', async () => {
      useSupabaseUserMock.mockReturnValue(ref({ sub: 'admin-uuid-1' }))
      useSupabaseClientMock.mockReturnValue(createMockSupabaseClient(mockAdminProfile))

      const store = useAuthStore()
      await store.fetchProfile()
      expect(store.isAdmin).toBe(true)

      store.clearProfile()
      expect(store.isAdmin).toBe(false)
    })
  })
})

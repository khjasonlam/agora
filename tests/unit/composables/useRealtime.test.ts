import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import { useRealtime } from '~/composables/useRealtime'

const { useSupabaseClientMock } = vi.hoisted(() => ({
  useSupabaseClientMock: vi.fn()
}))

mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)

/** Mounts a composable in a minimal Vue app, triggering onMounted. */
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

type SubscribeCallback = (status: string, err?: Error) => void
type PayloadCallback = (payload: { new: Record<string, unknown> }) => Promise<void>

interface MockSupabaseClient {
  channel: ReturnType<typeof vi.fn>
  removeChannel: ReturnType<typeof vi.fn>
  from: ReturnType<typeof vi.fn>
  _triggerSubscribe: SubscribeCallback
  _triggerInsert: PayloadCallback
}

function createMockClient(): MockSupabaseClient {
  let subscribeCallback: SubscribeCallback = () => {}
  let insertCallback: PayloadCallback = async () => {}

  const mockSubscribe = vi.fn((cb: SubscribeCallback) => {
    subscribeCallback = cb
    return {}
  })

  const mockOn = vi.fn((_event: string, _filter: unknown, cb: PayloadCallback) => {
    insertCallback = cb
    return { subscribe: mockSubscribe }
  })

  const mockChannel = vi.fn(() => ({ on: mockOn }))
  const mockRemoveChannel = vi.fn()
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { name: 'Test User' } })
  }))

  return {
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
    from: mockFrom,
    _triggerSubscribe: (status, err) => subscribeCallback(status, err),
    _triggerInsert: payload => insertCallback(payload)
  }
}

describe('useRealtime', () => {
  let mockClient: MockSupabaseClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockClient()
    useSupabaseClientMock.mockReturnValue(mockClient)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with connecting status', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))
    expect(result.status.value).toBe('connecting')
    unmount()
  })

  it('initializes with empty newThreads', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))
    expect(result.newThreads.value).toEqual([])
    unmount()
  })

  it('initializes with null connectionError', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))
    expect(result.connectionError.value).toBeNull()
    unmount()
  })

  it('subscribes to the correct channel on mount', () => {
    const { unmount } = withSetup(() => useRealtime(42))
    expect(mockClient.channel).toHaveBeenCalledWith('threads:post_42')
    unmount()
  })

  it('sets status to connected when SUBSCRIBED', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))

    mockClient._triggerSubscribe('SUBSCRIBED')

    expect(result.status.value).toBe('connected')
    expect(result.connectionError.value).toBeNull()
    unmount()
  })

  it('schedules reconnect (status → connecting) on CHANNEL_ERROR', () => {
    // CHANNEL_ERROR sets error briefly, then scheduleReconnect() overrides to 'connecting'
    vi.useFakeTimers()
    const { result, unmount } = withSetup(() => useRealtime(1))

    mockClient._triggerSubscribe('CHANNEL_ERROR', new Error('channel error'))

    expect(result.status.value).toBe('connecting')
    expect(result.connectionError.value).toBeNull()
    vi.useRealTimers()
    unmount()
  })

  it('schedules reconnect (status → connecting) on TIMED_OUT', () => {
    vi.useFakeTimers()
    const { result, unmount } = withSetup(() => useRealtime(1))

    mockClient._triggerSubscribe('TIMED_OUT')

    expect(result.status.value).toBe('connecting')
    vi.useRealTimers()
    unmount()
  })

  it('sets status to disconnected on CLOSED', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))

    mockClient._triggerSubscribe('CLOSED')

    expect(result.status.value).toBe('disconnected')
    unmount()
  })

  it('removes channel on unmount', () => {
    const { unmount } = withSetup(() => useRealtime(1))
    unmount()
    expect(mockClient.removeChannel).toHaveBeenCalledOnce()
  })

  it('reconnect() removes and re-subscribes', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))

    result.reconnect()

    expect(mockClient.removeChannel).toHaveBeenCalled()
    // channel should be called twice: once on mount, once on reconnect
    expect(mockClient.channel).toHaveBeenCalledTimes(2)
    unmount()
  })

  it('reconnect() returns to connecting state from connected', () => {
    const { result, unmount } = withSetup(() => useRealtime(1))

    mockClient._triggerSubscribe('SUBSCRIBED')
    expect(result.status.value).toBe('connected')

    result.reconnect()

    expect(result.status.value).toBe('connecting')
    expect(result.connectionError.value).toBeNull()
    unmount()
  })

  it('adds new thread to newThreads on INSERT payload', async () => {
    const { result, unmount } = withSetup(() => useRealtime(1))

    await mockClient._triggerInsert({
      new: {
        id: 10,
        user_id: 'user-1',
        post_id: 1,
        thread_number: 1,
        content: 'Hello world',
        is_deleted: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    })

    expect(result.newThreads.value).toHaveLength(1)
    expect(result.newThreads.value[0].content).toBe('Hello world')
    expect(result.newThreads.value[0].thread_number).toBe(1)
    unmount()
  })

  it('attaches profile to new thread from fetchProfile', async () => {
    const { result, unmount } = withSetup(() => useRealtime(1))

    await mockClient._triggerInsert({
      new: {
        id: 10,
        user_id: 'user-1',
        post_id: 1,
        thread_number: 1,
        content: 'Profile test',
        is_deleted: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    })

    expect(result.newThreads.value[0].profiles).toEqual({ name: 'Test User' })
    unmount()
  })

  it('sets status to error after exhausting max reconnect attempts (5)', async () => {
    vi.useFakeTimers()

    const { result, unmount } = withSetup(() => useRealtime(1))

    // Each iteration: trigger error → scheduleReconnect increments counter → timer fires → new subscribe
    // After 5 iterations reconnectAttempts = 5; the 6th trigger hits the >= MAX_RECONNECT_ATTEMPTS branch
    for (let i = 0; i < 5; i++) {
      mockClient._triggerSubscribe('CHANNEL_ERROR', new Error('error'))
      await vi.runAllTimersAsync()
    }
    // 6th error: reconnectAttempts(5) >= MAX(5) → status = 'error'
    mockClient._triggerSubscribe('CHANNEL_ERROR', new Error('error'))

    expect(result.status.value).toBe('error')
    expect(result.connectionError.value).toBe('リアルタイム接続に失敗しました。ページを再読み込みしてください。')

    unmount()
    vi.useRealTimers()
  })
})

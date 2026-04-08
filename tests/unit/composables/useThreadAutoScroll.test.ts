import { describe, it, expect } from 'vitest'
import { createApp, nextTick, ref } from 'vue'
import type { Thread } from '~/types'

import { useThreadAutoScroll } from '~/composables/useThreadAutoScroll'

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

describe('useThreadAutoScroll', () => {
  it('scrolls to bottom when realtimeStatus becomes connected', async () => {
    const realtimeStatus = ref('connecting')
    const newThreads = ref<Thread[]>([])

    const { result, unmount } = withSetup(() => useThreadAutoScroll({ realtimeStatus, newThreads }))
    const el = document.createElement('div')

    Object.defineProperty(el, 'scrollHeight', { value: 200, writable: false })
    el.scrollTop = 0

    result.scrollContainer.value = el

    realtimeStatus.value = 'connected'
    await nextTick()
    // composable calls nextTick() inside scrollToBottom()
    await nextTick()

    expect(el.scrollTop).toBe(200)
    unmount()
  })

  it('scrolls to bottom when newThreads length changes', async () => {
    const realtimeStatus = ref('connected')
    const newThreads = ref<Thread[]>([])

    const { result, unmount } = withSetup(() => useThreadAutoScroll({ realtimeStatus, newThreads }))
    const el = document.createElement('div')

    Object.defineProperty(el, 'scrollHeight', { value: 300, writable: false })
    el.scrollTop = 0

    result.scrollContainer.value = el

    const thread1 = {
      id: 1,
      user_id: 'user-1',
      post_id: 10,
      thread_number: 1,
      content: 'Hello',
      is_deleted: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      profiles: null
    } satisfies Thread

    newThreads.value = [thread1]
    await nextTick()
    await nextTick()

    expect(el.scrollTop).toBe(300)
    unmount()
  })
})

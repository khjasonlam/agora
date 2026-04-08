import type { Thread } from '~/types'
import type { RealtimeStatus } from '~/composables/useRealtime'

export const useThreadAutoScroll = (
  args: {
    realtimeStatus: Ref<RealtimeStatus>
    newThreads: Ref<Thread[]>
  }
) => {
  const scrollContainer = ref<HTMLElement | null>(null)

  const scrollToBottom = () => {
    nextTick(() => {
      if (!scrollContainer.value) return
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    })
  }

  watch(args.realtimeStatus, (status) => {
    if (status === 'connected') scrollToBottom()
  })

  watch(() => args.newThreads.value.length, () => {
    scrollToBottom()
  })

  return { scrollContainer }
}

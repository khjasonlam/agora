import type { Thread } from '~/types'

export const useThreadAutoScroll = (
  args: {
    realtimeStatus: Ref<string>
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

import { ref, computed } from 'vue'

export interface Webmention {
  id: string
  source: string
  target: string
  timestamp: string
  verified: boolean
  type?: 'mention' | 'reply' | 'like' | 'repost'
  author?: {
    name?: string
    photo?: string
    url?: string
  }
  content?: {
    text?: string
    html?: string
  }
}

export function useWebmentions(target?: string) {
  const webmentions = ref<Webmention[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const mentions = computed(() =>
    webmentions.value.filter(wm => wm.type === 'mention' || !wm.type)
  )
  const replies = computed(() =>
    webmentions.value.filter(wm => wm.type === 'reply')
  )
  const likes = computed(() =>
    webmentions.value.filter(wm => wm.type === 'like')
  )
  const reposts = computed(() =>
    webmentions.value.filter(wm => wm.type === 'repost')
  )

  const totalCount = computed(() => webmentions.value.length)

  const fetchWebmentions = async (targetUrl?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const url = targetUrl || target
      const query = url ? `?target=${encodeURIComponent(url)}` : ''

      const response = await $fetch<{ success: boolean; webmentions: Webmention[] }>(
        `/api/webmentions${query}`
      )

      if (response.success) {
        webmentions.value = response.webmentions
      }
    } catch (err: any) {
      console.error('Error fetching webmentions:', err)
      error.value = err.message || 'Failed to fetch webmentions'
    } finally {
      isLoading.value = false
    }
  }

  return {
    webmentions,
    mentions,
    replies,
    likes,
    reposts,
    totalCount,
    isLoading,
    error,
    fetchWebmentions
  }
}


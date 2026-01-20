import { ref, onMounted, onUnmounted } from 'vue'

const isFullscreen = ref(false)

function isClient() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function useFullscreen() {
  onMounted(() => {
    // Initialize state (no browser fullscreen API calls)
  })

  onUnmounted(() => {
    // Cleanup if needed
  })

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

  const setFullscreen = (value: boolean) => {
    isFullscreen.value = value
  }

  return {
    isFullscreen,
    toggleFullscreen,
    setFullscreen,
  }
}

import { ref, onMounted, onUnmounted } from 'vue'

const isFullscreen = ref(false)

function isClient() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function addFullscreenListener() {
  if (!isClient()) return
  const handler = () => {
    isFullscreen.value = !!document.fullscreenElement
  }
  document.addEventListener('fullscreenchange', handler)
  return () => document.removeEventListener('fullscreenchange', handler)
}

async function requestFullscreen() {
  if (!isClient()) return
  const target = document.documentElement
  try {
    if (!document.fullscreenElement && target.requestFullscreen) {
      await target.requestFullscreen()
      isFullscreen.value = true
    }
  } catch (err) {
    console.error('Failed to enter fullscreen', err)
  }
}

async function exitFullscreen() {
  if (!isClient()) return
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen()
    }
    isFullscreen.value = false
  } catch (err) {
    console.error('Failed to exit fullscreen', err)
  }
}

export function useFullscreen() {
  let removeListener: (() => void) | null = null

  onMounted(() => {
    const disposer = addFullscreenListener()
    removeListener = disposer || null
  })

  onUnmounted(() => {
    if (removeListener) removeListener()
  })

  const toggleFullscreen = async () => {
    if (isFullscreen.value) {
      await exitFullscreen()
    } else {
      await requestFullscreen()
    }
  }

  const setFullscreen = async (value: boolean) => {
    if (value) {
      await requestFullscreen()
    } else {
      await exitFullscreen()
    }
  }

  return {
    isFullscreen,
    toggleFullscreen,
    setFullscreen,
  }
}

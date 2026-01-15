import { ref } from 'vue'

const isFullscreen = ref(false)

export function useFullscreen() {
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


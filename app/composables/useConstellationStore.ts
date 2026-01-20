/**
 * Composable to store and persist constellation data across layout changes
 */
import { ref } from 'vue'
import type { StarData } from '~/data/mythologyData'

// Global ref that persists across component remounts
const storedConstellationData = ref<StarData[]>([])

export function useConstellationStore() {
  /**
   * Set the constellation data
   */
  function setConstellationData(data: StarData[]) {
    storedConstellationData.value = data
  }

  /**
   * Get the constellation data
   */
  function getConstellationData(): StarData[] {
    return storedConstellationData.value
  }

  /**
   * Clear the constellation data
   */
  function clearConstellationData() {
    storedConstellationData.value = []
  }

  return {
    constellationData: storedConstellationData,
    setConstellationData,
    getConstellationData,
    clearConstellationData,
  }
}


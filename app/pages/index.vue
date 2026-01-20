<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { StarData } from '~/data/mythologyData'
import { convertMultipleSparqlResults, type SparqlMythologyResult } from '~/utils/sparqlDataConverter'

const { isFullscreen, setFullscreen } = useFullscreen()
// Note: isFullscreen now just drives layout; no browser fullscreen is requested.
const { executeSpecificQuery, loading, error, results } = useSparqlQuery()
const { constellationData, setConstellationData } = useConstellationStore()

const showSparqlSearch = ref(false)
const currentMythology = ref<string>('Greek')
const useDomainClustering = ref(true)
const pureDomainsOnly = ref(false)
const isCanvasFullscreen = ref(false)


// Map of Wikidata entity IDs to mythology names
const mythologyMap: Record<string, string> = {
  'wd:Q22989102': 'Greek',
  'wd:Q16513881': 'Norse',
  'wd:Q146083': 'Egyptian',
  'wd:Q979507': 'Hindu',
  'wd:Q465434': 'Celtic',
}

// Prevent browser fullscreen; only toggle canvas stretch
const toggleCanvasFullscreen = () => {
  const next = !isCanvasFullscreen.value
  isCanvasFullscreen.value = next
  setFullscreen(next) // keep shared state in sync
}
const exitCanvasFullscreen = () => {
  isCanvasFullscreen.value = false
  setFullscreen(false)
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'f' || event.key === 'F') {
    toggleCanvasFullscreen()
  }
}

const handlePureFilterChange = (val: boolean) => {
  pureDomainsOnly.value = val
  // Re-apply filter to current constellation data if present
  if (constellationData.value.length > 0) {
    setConstellationData(filterDenseDomains(constellationData.value, pureDomainsOnly.value))
  }
}

function filterDenseDomains(stars: StarData[], enabled: boolean): StarData[] {
  if (!enabled) return stars
  // Count domains among stars
  const domainCounts = new Map<string, number>()
  stars.forEach((s) => {
    const domains = parseDomains(s.domains)
    const primary = domains[0]
    if (primary) domainCounts.set(primary, (domainCounts.get(primary) || 0) + 1)
  })

  // Keep only stars whose primary domain has at least 3 members
  return stars.filter((s) => {
    const domains = parseDomains(s.domains)
    const primary = domains[0]
    if (!primary) return false
    return (domainCounts.get(primary) || 0) >= 3
  })
}

function parseDomains(domainString?: string): string[] {
  if (!domainString) return []
  return domainString
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
}

const handleQueryRun = async (query: string) => {
  try {
    await executeSpecificQuery(query)

    // Convert SPARQL results to constellation data
    if (results.value && results.value.length > 0) {
      // Detect which mythologies are in the query
      const selectedMythologies = Object.entries(mythologyMap)
        .filter(([entityId]) => query.includes(entityId))
        .map(([, mythology]) => mythology)

      // If multiple mythologies, use 'Mixed', otherwise use the single one or default
      const mythology = selectedMythologies.length > 1
        ? 'Mixed'
        : (selectedMythologies[0] || currentMythology.value)

      const starData = convertMultipleSparqlResults(
        results.value as SparqlMythologyResult[],
        mythology,
        1,
        useDomainClustering.value
      )

      // Apply dense-domain filter if enabled
      setConstellationData(filterDenseDomains(starData, pureDomainsOnly.value))

      console.log(`Generated ${starData.length} stars for ${mythology} mythology`)
    }
  } catch (err) {
    console.error('Failed to execute SPARQL query:', err)
  }
}

const handleQueryUpdate = (query: string) => {
  // Extract mythology types from query
  const selectedMythologies = Object.entries(mythologyMap)
    .filter(([entityId]) => query.includes(entityId))
    .map(([, mythology]) => mythology)

  // Set to first found mythology or keep current
  if (selectedMythologies.length > 0) {
    currentMythology.value = selectedMythologies.length > 1
      ? 'Mixed'
      : (selectedMythologies[0] || 'Greek')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<template>
  <div v-if="isCanvasFullscreen" class="fullscreen-wrapper">
    <ThreeStarField :constellation-data="constellationData" />
    <div class="fullscreen-controls">
      <UButton
        @click="exitCanvasFullscreen"
        icon="i-heroicons-x-mark"
        size="sm"
        color="neutral"
        variant="ghost"
        label="Exit (F)"
      />
    </div>
  </div>

  <div v-else class="normal-view">
    <section class="hero">
      <h1 class="title">Star Gazer</h1>
      <p class="subtitle">Explore mythological deities connected across cultures in an interactive 3D visualization</p>
      <div class="controls">
        <UButton
          @click="toggleCanvasFullscreen"
          icon="i-heroicons-arrows-pointing-out"
          size="lg"
          label="Enter Fullscreen (F)"
        />
        <UButton
          @click="showSparqlSearch = !showSparqlSearch"
          :icon="showSparqlSearch ? 'i-heroicons-eye-slash' : 'i-heroicons-magnifying-glass'"
          size="lg"
          color="primary"
          variant="outline"
          :label="showSparqlSearch ? 'Hide Search' : 'SPARQL Search'"
        />
      </div>
    </section>

    <!-- SPARQL Search Section -->
    <section v-if="showSparqlSearch" class="sparql-section">
      <UCard>
        <div class="clustering-toggle mb-4">
          <UCheckbox
            v-model="useDomainClustering"
            label="Group by Domain (with clustering and connections)"
          />
        </div>

        <SparqlSearch
          @query="handleQueryUpdate"
          @run="handleQueryRun"
          @pure-filter="handlePureFilterChange"
        />
        <div v-if="loading" class="mt-4">
          <UAlert
            icon="i-heroicons-arrow-path"
            color="info"
            variant="subtle"
            title="Loading..."
            description="Fetching deity data from Wikidata..."
          />
        </div>
        <div v-if="error" class="mt-4">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="warning"
            variant="subtle"
            title="Error"
            :description="error.message"
          />
        </div>
        <div v-if="constellationData.length > 0" class="mt-4">
          <UAlert
            icon="i-heroicons-star"
            color="success"
            variant="subtle"
            title="Success!"
            :description="`Generated ${constellationData.length} stars for ${currentMythology} mythology. View them in the constellation below!`"
          />
        </div>
      </UCard>
    </section>

    <section class="canvas-section" :class="{ 'canvas-fullscreen': isCanvasFullscreen }">
      <ThreeStarField :constellation-data="constellationData" />
    </section>

    <section class="content">
      <div class="info-grid">
        <div class="info-card">
          <h3>Mythology Visualization</h3>
          <p>Explore deities from Greek, Norse, Egyptian, Hindu, and Celtic mythologies as interactive stars in 3D space.</p>
        </div>
        <div class="info-card">
          <h3>SPARQL Search</h3>
          <p>Use the SPARQL search to query Wikidata for mythological figures and generate custom constellations in real-time.</p>
        </div>
        <div class="info-card">
          <h3>Interactive Connections</h3>
          <p>Click on any deity to learn more. White lines show relationships between mythological figures.</p>
        </div>
        <div class="info-card">
          <h3>Immersive Experience</h3>
          <p>Press <kbd>F</kbd> for fullscreen mode. Use your mouse to rotate, zoom, and navigate the cosmic mythology network.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.fullscreen-wrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.fullscreen-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

/* Normal view layout */
.normal-view {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  text-align: center;
  padding: 2rem 0;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: var(--color-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: rgb(107 114 128);
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Canvas section */
.canvas-section {
  position: relative;
  width: 100%;
  height: 600px;
  min-height: 400px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  transition: height 0.25s ease, width 0.25s ease, border-radius 0.2s ease;
}

.canvas-fullscreen {
   height: calc(100vh - 2rem);
   width: 100vw;
   margin-left: calc(-50vw + 50%);
   margin-right: calc(-50vw + 50%);
   border-radius: 0;
   box-shadow: none;
}

/* SPARQL Search section */
.sparql-section {
  padding: 2rem 0;
}

.clustering-toggle {
  padding: 1rem;
  background: rgb(249 250 251);
  border-radius: 0.75rem;
  border: 1px solid rgb(229 231 235);
}

@media (prefers-color-scheme: dark) {
  .clustering-toggle {
    background: rgb(31 41 55);
    border-color: rgb(55 65 81);
  }
}

/* Content section */
.content {
  padding: 2rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.info-card {
  padding: 2rem;
  border-radius: 0.75rem;
  background: rgb(249 250 251);
  border: 1px solid rgb(229 231 235);
  transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.info-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: rgb(17 24 39);
}

.info-card p {
  color: rgb(107 114 128);
  line-height: 1.6;
}

kbd {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  background: rgb(243 244 246);
  border: 1px solid rgb(209 213 219);
  border-radius: 0.25rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .subtitle {
    color: rgb(156 163 175);
  }

  .info-card {
    background: rgb(31 41 55);
    border-color: rgb(55 65 81);
  }

  .info-card h3 {
    color: rgb(243 244 246);
  }

  .info-card p {
    color: rgb(156 163 175);
  }

  kbd {
    background: rgb(55 65 81);
    border-color: rgb(75 85 99);
  }
}
</style>
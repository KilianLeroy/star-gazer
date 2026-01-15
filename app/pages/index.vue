<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const { isFullscreen, toggleFullscreen } = useFullscreen()

watch(isFullscreen, (newValue) => {
  setPageLayout(newValue ? 'fullscreen' : 'default')
}, { immediate: true })

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'f' || event.key === 'F') {
    toggleFullscreen()
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
  <div v-if="isFullscreen" class="fullscreen-wrapper">
    <ThreeStarField />
    <div class="fullscreen-controls">
      <UButton
        @click="toggleFullscreen"
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
          @click="toggleFullscreen"
          icon="i-heroicons-arrows-pointing-out"
          size="lg"
          label="Enter Fullscreen (F)"
        />
      </div>
    </section>

    <section class="canvas-section">
      <ThreeStarField />
    </section>

    <section class="content">
      <div class="info-grid">
        <div class="info-card">
          <h3>Mythology Visualization</h3>
          <p>Explore deities from Greek, Norse, Egyptian, Hindu, and Celtic mythologies as interactive stars in 3D space.</p>
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
  width: 100%;
  height: 100%;
  position: relative;
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
}

/* Content section */
.content {
  padding: 2rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
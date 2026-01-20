<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { OrbitControls } from 'three/addons'
import { mythData } from '~/data/mythologyData'
import type { StarData } from '~/data/mythologyData'

const props = defineProps<{
  constellationData?: StarData[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const labelContainerRef = ref<HTMLElement | null>(null)
const selectedStarInfo = ref<{
  name: string
  mythology: string
  description?: string
  image?: string
  domains?: string
  fathers?: string
  mothers?: string
  children?: string
  article?: string
} | null>(null)

const { scene, camera, renderer, init, startAnimationLoop, dispose: disposeThree } = useThree(canvasRef, {
  antialias: true,
  clearColor: 0x000510,
})

let controls: OrbitControls | null = null
let mythologyViz: ReturnType<typeof useMythologyVisualization> | null = null
let cleanup: (() => void) | undefined

const setupScene = () => {
  if (!scene.value || !camera.value || !renderer.value || !labelContainerRef.value) return

  if (mythologyViz) {
    mythologyViz.dispose()
  }

  camera.value.position.set(0, 0, 15)

  if (!controls) {
    controls = new OrbitControls(camera.value, renderer.value.domElement)
    controls.enableDamping = true
  }

  if (scene.value.children.filter(c => c instanceof THREE.AmbientLight).length === 0) {
    scene.value.add(new THREE.AmbientLight(0xffffff, 0.5))
  }

  const dataToVisualize = props.constellationData && props.constellationData.length > 0
    ? props.constellationData
    : mythData

  mythologyViz = useMythologyVisualization(scene.value, camera.value, renderer.value, labelContainerRef.value)
  mythologyViz.init(dataToVisualize)

  const handleClick = (event: MouseEvent) => {
    if (!mythologyViz) return
    mythologyViz.onStarClick(event, (data) => {
      selectedStarInfo.value = {
        name: data.name,
        mythology: data.mythology,
        description: data.description,
        image: data.image,
        domains: data.domains,
        fathers: data.fathers,
        mothers: data.mothers,
        children: data.children,
        article: data.article,
      }
    })
  }

  window.addEventListener('click', handleClick)

  // Animation loop
  startAnimationLoop(() => {
    if (mythologyViz) {
      mythologyViz.updateLabels()
      mythologyViz.animateStarfield(performance.now())
    }
    if (controls) {
      controls.update()
    }
  })

  cleanup = () => {
    window.removeEventListener('click', handleClick)
    if (mythologyViz) {
      mythologyViz.dispose()
    }
  }
}

watch(() => props.constellationData, () => {
  if (scene.value && camera.value && renderer.value && labelContainerRef.value) {
    setupScene()
  }
}, { deep: true })

onMounted(() => {
  init()
  setupScene()
})

onUnmounted(() => {
  if (cleanup) {
    cleanup()
  }
  if (mythologyViz) {
    mythologyViz.dispose()
  }
  if (controls) {
    controls.dispose()
  }
  disposeThree()
})
</script>

<template>
  <div ref="containerRef" class="three-canvas-container">
    <canvas ref="canvasRef" class="three-canvas" />
    <div ref="labelContainerRef" class="label-container"></div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="selectedStarInfo" class="star-info-panel">
        <button class="close-btn" @click="selectedStarInfo = null">✕</button>

        <div v-if="selectedStarInfo.image" class="deity-image">
          <img :src="selectedStarInfo.image" :alt="selectedStarInfo.name" />
        </div>

        <div class="star-info-content">
          <h3>{{ selectedStarInfo.name }}</h3>

          <div v-if="selectedStarInfo.mythology" class="info-section">
            <h4>Mythology</h4>
            <p class="info-text">{{selectedStarInfo.mythology}}</p>
          </div>

          <div v-if="selectedStarInfo.description" class="info-section">
            <h4>Description</h4>
            <p class="info-text">{{ selectedStarInfo.description }}</p>
          </div>

          <div v-if="selectedStarInfo.domains" class="info-section">
            <h4>Domains</h4>
            <p class="info-text">{{ selectedStarInfo.domains }}</p>
          </div>

          <div v-if="selectedStarInfo.fathers" class="info-section">
            <h4>Father(s)</h4>
            <p class="info-text">{{ selectedStarInfo.fathers }}</p>
          </div>

          <div v-if="selectedStarInfo.mothers" class="info-section">
            <h4>Mother(s)</h4>
            <p class="info-text">{{ selectedStarInfo.mothers }}</p>
          </div>

          <div v-if="selectedStarInfo.children" class="info-section">
            <h4>Children</h4>
            <p class="info-text">{{ selectedStarInfo.children }}</p>
          </div>

          <div v-if="selectedStarInfo.article" class="info-section">
            <a
              :href="selectedStarInfo.article"
              target="_blank"
              rel="noopener noreferrer"
              class="wiki-link"
            >
              View on Wikipedia →
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.three-canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.three-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.label-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

:global(.mythology-label) {
  position: absolute;
  color: rgba(255, 255, 255, 0.9);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.star-info-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  max-width: 500px;
  width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
}

@media (min-width: 640px) {
  .star-info-panel {
    width: auto;
    min-width: 320px;
  }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 1);
}

.deity-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.deity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.star-info-content {
  color: white;
  padding-right: 8px;
}

.star-info-content h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}


.info-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-section h4 {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  word-break: break-word;
}

.wiki-link {
  display: inline-block;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  margin-top: 8px;
}

.wiki-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

/* Scrollbar styling */
.star-info-panel::-webkit-scrollbar {
  width: 6px;
}

.star-info-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.star-info-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.star-info-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>


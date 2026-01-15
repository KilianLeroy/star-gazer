<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted, onUnmounted } from 'vue'
import { OrbitControls } from 'three/addons'
import { mythData } from '~/data/mythologyData'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const labelContainerRef = ref<HTMLElement | null>(null)
const selectedStarInfo = ref<{ name: string; mythology: string } | null>(null)

const { scene, camera, renderer, init, startAnimationLoop, dispose: disposeThree } = useThree(canvasRef, {
  antialias: true,
  clearColor: 0x000510,
})

let controls: OrbitControls | null = null
let mythologyViz: ReturnType<typeof useMythologyVisualization> | null = null

// Create the mythology visualization
const setupScene = () => {
  if (!scene.value || !camera.value || !renderer.value || !labelContainerRef.value) return

  // Set camera position
  camera.value.position.set(0, 0, 15)

  // Setup orbit controls
  controls = new OrbitControls(camera.value, renderer.value.domElement)
  controls.enableDamping = true

  // Add ambient light
  scene.value.add(new THREE.AmbientLight(0xffffff, 0.5))

  mythologyViz = useMythologyVisualization(scene.value, camera.value, renderer.value, labelContainerRef.value)
  mythologyViz.init(mythData)

  const handleClick = (event: MouseEvent) => {
    if (!mythologyViz) return
    mythologyViz.onStarClick(event, (data) => {
      selectedStarInfo.value = {
        name: data.name,
        mythology: data.mythology,
      }
    })
  }

  window.addEventListener('click', handleClick)

  // Animation loop
  startAnimationLoop((time) => {
    if (mythologyViz) {
      mythologyViz.updateLabels()
    }
    if (controls) {
      controls.update()
    }
  })

  // Cleanup on unmount
  return () => {
    window.removeEventListener('click', handleClick)
    if (mythologyViz) {
      mythologyViz.dispose()
    }
    disposeThree()
  }
}

onMounted(() => {
  init()
  setupScene()
})

onUnmounted(() => {
  if (mythologyViz) {
    mythologyViz.dispose()
  }
  disposeThree()
})
</script>

<template>
  <div ref="containerRef" class="three-canvas-container">
    <canvas ref="canvasRef" class="three-canvas" />
    <div ref="labelContainerRef" class="label-container"></div>

    <!-- Star info panel -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="selectedStarInfo" class="star-info-panel">
        <div class="star-info-content">
          <h3>{{ selectedStarInfo.name }}</h3>
          <p class="mythology-label">{{ selectedStarInfo.mythology }} Mythology</p>
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

.star-info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.star-info-content {
  color: white;
}

.star-info-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.mythology-label {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* Global style for mythology labels positioned within container */
:global(.mythology-label) {
  position: absolute;
  font-size: 12px;
  color: white;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  font-weight: 500;
  z-index: 5;
}
</style>


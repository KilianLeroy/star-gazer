<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const { scene, init, startAnimationLoop } = useThree(canvasRef, {
  antialias: true,
  clearColor: 0x0a0a0a,
})

// Create a basic scene with a rotating cube
const setupScene = () => {
  if (!scene.value) return

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.value.add(ambientLight)

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.value.add(directionalLight)

  // Create a cube
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    metalness: 0.3,
    roughness: 0.4,
  })
  const cube = new THREE.Mesh(geometry, material)
  scene.value.add(cube)

  // Animation loop
  startAnimationLoop((time) => {
    cube.rotation.x = time * 0.0005
    cube.rotation.y = time * 0.001
  })
}

onMounted(() => {
  init()
  setupScene()
})
</script>

<template>
  <div class="three-canvas-container">
    <canvas ref="canvasRef" class="three-canvas" />
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
</style>


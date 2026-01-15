import * as THREE from 'three'
import { ref, shallowRef, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseThreeOptions {
  antialias?: boolean
  alpha?: boolean
  clearColor?: number
  clearAlpha?: number
}

export function useThree(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: UseThreeOptions = {}
) {
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const animationFrameId = ref<number | null>(null)
  const resizeObserver = ref<ResizeObserver | null>(null)

  const {
    antialias = true,
    alpha = false,
    clearColor = 0x000000,
    clearAlpha = 1,
  } = options

  const init = () => {
    if (!canvasRef.value) return

    // Create scene
    scene.value = new THREE.Scene()

    // Create camera
    const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
    camera.value = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    camera.value.position.z = 5

    // Create renderer
    renderer.value = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias,
      alpha,
    })
    renderer.value.setSize(
      canvasRef.value.clientWidth,
      canvasRef.value.clientHeight
    )
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.value.setClearColor(clearColor, clearAlpha)
  }

  const handleResize = () => {
    if (!canvasRef.value || !camera.value || !renderer.value) return

    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight

    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()

    renderer.value.setSize(width, height)
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  const startAnimationLoop = (callback: (time: number) => void) => {
    const animate = (time: number) => {
      if (renderer.value && scene.value && camera.value) {
        callback(time)
        renderer.value.render(scene.value, camera.value)
      }
      animationFrameId.value = requestAnimationFrame(animate)
    }
    animate(0)
  }

  const stopAnimationLoop = () => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  const dispose = () => {
    stopAnimationLoop()

    if (renderer.value) {
      renderer.value.dispose()
      renderer.value = null
    }

    if (scene.value) {
      scene.value.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material?.dispose()
          }
        }
      })
      scene.value = null
    }

    camera.value = null
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)

    // Use ResizeObserver to detect when canvas container size changes
    if (canvasRef.value) {
      resizeObserver.value = new ResizeObserver(() => {
        handleResize()
      })
      resizeObserver.value.observe(canvasRef.value)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)

    if (resizeObserver.value) {
      resizeObserver.value.disconnect()
      resizeObserver.value = null
    }

    dispose()
  })

  return {
    scene,
    camera,
    renderer,
    init,
    handleResize,
    startAnimationLoop,
    stopAnimationLoop,
    dispose,
  }
}

